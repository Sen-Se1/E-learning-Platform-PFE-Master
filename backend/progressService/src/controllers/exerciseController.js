const asyncHandler = require('express-async-handler');
const axios = require('axios');
const Submission = require('../models/submissionModel');
const Progression = require('../models/progressionModel');
const ApiError = require('../utils/apiError');
const vm = require('vm');

const COURSE_SERVICE_URL = process.env.COURSE_SERVICE_URL || 'http://localhost:8003/api/v1';

const { transform } = require('sucrase');

/**
 * @desc    Submit exercise answer and validate
 * @route   POST /api/v1/submissions
 * @access  Private
 */
exports.submitAnswer = asyncHandler(async (req, res, next) => {
  const { exerciseId, courseId, lessonId, moduleId, answer } = req.body;
  const userId = req.user?._id || req.body.userId; // Prefers auth userId

  // 1. Fetch exercise metadata from coursService
  let exercise;
  try {
    const response = await axios.get(`${COURSE_SERVICE_URL}/exercises/${exerciseId}/internal`, {
      headers: {
        Authorization: req.headers.authorization
      }
    });
    exercise = response.data.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    return next(new ApiError(`Failed to fetch exercise details from Course Service: ${errorMsg}`, error.response?.status || 500));
  }

  // 2. Validate the answer based on exercise type
  let isCorrect = false;
  if (exercise.type === 'quiz') {
    const correctOption = exercise.options.find(opt => opt.isCorrect);
    isCorrect = String(answer) === String(correctOption.id);
  } else if (exercise.type === 'boolean') {
    isCorrect = Boolean(answer) === Boolean(exercise.correctAnswer);
  } else if (exercise.type === 'coding') {
    let passed = false;
    let executionError = null;
    let userResult = null;
    
    // 0. CLEANUP: Handle HTML entities and common encoding issues
    const cleanCode = (str) => {
      return String(str || "")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
    };

    const finalAnswer = cleanCode(answer);
    const finalSolution = cleanCode(exercise.solution);

    // Normalization utility: Very flexible (ignores types, spaces, punctuation)
    const normalize = (str) => {
      return String(str || "")
        .replace(/interface\s+\w+\s+\{[^}]*\}/g, '') // Remove TS interfaces
        .replace(/type\s+\w+\s+=[^;]+;/g, '')        // Remove TS types
        .replace(/:\s+[A-Z\w<>|\[\]]+/g, '')        // Remove type annotations
        .replace(/[\s;,'"()\[\]{}:.=>]/g, '')       // Remove dividers/syntax
        .toLowerCase();
    };

    try {
      // 1. PRIMARY VALIDATION: Soft comparison (Logic-only match)
      const userClean = normalize(finalAnswer);
      const solutionClean = normalize(finalSolution);
      
      if (userClean === solutionClean && solutionClean !== "") {
        passed = true;
      } 
      // 2. OPTIONAL ADVANCED VALIDATION: Execute if assertions exist and soft match failed
      else if (exercise.assertions && (exercise.language === 'javascript' || exercise.language === 'typescript')) {
        let transpiledCode = finalAnswer;
        try {
          const result = transform(finalAnswer, {
            transforms: ['typescript', 'jsx'],
            production: true,
          });
          transpiledCode = result.code;
        } catch (err) {
          // If transpilation fails but they have a point, don't crash yet
          executionError = `Syntax Check: ${err.message}`;
        }

        const logs = [];
        const sandbox = {
          React: { createElement: (t, p, ...c) => ({ t, p, c, $$typeof: Symbol.for('react.element') }) },
          console: { log: (...args) => logs.push(args.join(' ')) },
          expect: (actual) => {
            userResult = actual;
            return {
              toBe: (expected) => { if (actual !== expected) throw new Error("Mismatch"); },
              toEqual: (expected) => { if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error("Deep mismatch"); },
              toBeDefined: () => { if (actual === undefined || actual === null) throw new Error("Undefined"); },
            };
          }
        };

        if (transpiledCode) {
          vm.createContext(sandbox);
          vm.runInContext(`${transpiledCode}\n${exercise.assertions}`, sandbox, { timeout: 2000 });
          passed = true;
          executionError = null; // Clear syntax error if execution somehow worked
          req.userLogs = logs;
        }
      }
    } catch (e) {
      executionError = executionError || e.message;
      // FINAL SOFT MATCH (Even if execution or compile failed, look at the text)
      if (normalize(finalAnswer) === normalize(finalSolution)) {
        passed = true;
        executionError = null;
      }
    }
    isCorrect = passed;
    req.executionError = executionError;
    req.userResult = userResult;
  }

  // 3. Get current attempt number
  const previousAttempts = await Submission.countDocuments({ userId, exerciseId });
  const attemptNumber = previousAttempts + 1;

  // 4. Save submission
  const submission = await Submission.create({
    userId,
    exerciseId,
    courseId,
    lessonId,
    moduleId,
    answer,
    isCorrect,
    score: isCorrect ? (exercise.maxScore || 10) : 0,
    attemptNumber
  });

  // 5. Update progression (logic remains same...)
  // ... (lines 55-91) ...
  
  // Find or create progression to update stats
  let progression = await Progression.findOne({ userId, lessonId });
  
  if (!progression) {
    progression = await Progression.create({
      userId,
      lessonId,
      courseId,
      moduleId,
      exerciseStats: [{ exerciseId, attempts: 1, isCompleted: isCorrect }]
    });
  } else {
    const statIndex = progression.exerciseStats.findIndex(s => s.exerciseId.toString() === exerciseId);
    if (statIndex > -1) {
      progression.exerciseStats[statIndex].attempts += 1;
      if (isCorrect) progression.exerciseStats[statIndex].isCompleted = true;
    } else {
      progression.exerciseStats.push({ exerciseId, attempts: 1, isCompleted: isCorrect });
    }
    if (isCorrect) {
      if (!progression.completedExercises.includes(exerciseId)) {
        progression.completedExercises.push(exerciseId);
      }
    }
    await progression.save();
  }

  res.status(200).json({
    status: 'success',
    data: {
      isCorrect,
      score: submission.score,
      attemptNumber: submission.attemptNumber,
      feedback: isCorrect 
        ? 'Great job!' 
        : (req.executionError 
            ? `Error: ${req.executionError}` 
            : 'Logic mismatch. Please check your implementation.'),
      result: req.userResult // Show what the code actually produced
    }
  });
});

/**
 * @desc    Get user progression for a course/lesson
 * @route   GET /api/v1/submissions/progression/:lessonId
 * @access  Private
 */
exports.getProgression = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  const userId = req.user?._id || req.query.userId; // Usually from auth middleware

  const progression = await Progression.findOne({ userId, lessonId });
  res.status(200).json({ data: progression });
});

/**
 * @desc    Get all user exercise stats across all courses
 * @route   GET /api/v1/submissions/user-stats/:userId
 * @access  Private
 */
exports.getUserAllStats = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const progressions = await Progression.find({ userId });
  
  // Flatten all exerciseStats from all progressions
  const allStats = progressions.reduce((acc, curr) => {
    return acc.concat(curr.exerciseStats);
  }, []);

  res.status(200).json({ data: allStats });
});
