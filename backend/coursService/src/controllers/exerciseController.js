const asyncHandler = require('express-async-handler');
const Exercise = require('../models/exerciseSchema');
const Lesson = require('../models/lessonSchema');
const ApiError = require('../utils/apiError');
const { recalcCourseDurationFromLesson } = require('../utils/courseDurationCalc');

/**
 * @desc    Get all exercises
 * @route   GET /api/v1/exercises
 * @access  Public
 */
exports.getExercises = asyncHandler(async (req, res) => {
  const exercises = await Exercise.find()
    .select('-options.isCorrect -correctAnswer -solution')
    .populate({
      path: 'lessonId',
      select: 'moduleId',
      populate: {
        path: 'moduleId',
        select: 'courseId'
      }
    });

  const transformedExercises = exercises.map(ex => {
    const obj = ex.toObject();
    return {
      ...obj,
      courseId: obj.lessonId?.moduleId?.courseId || null,
      lessonId: obj.lessonId?._id || obj.lessonId // Flatten lessonId back to its original ID form
    };
  });

  res.status(200).json({ data: transformedExercises });
});

/**
 * @desc    Get specific exercise by id
 * @route   GET /api/v1/exercises/:id
 * @access  Public
 */
exports.getExercise = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const exercise = await Exercise.findById(id).select('-options.isCorrect -correctAnswer -solution');
  if (!exercise) {
    return next(new ApiError(`No exercise found for this id ${id}`, 404));
  }
  res.status(200).json({ data: exercise });
});

/**
 * @desc    Get specific exercise with secrets (Internal Use)
 * @route   GET /api/v1/exercises/:id/internal
 * @access  Internal
 */
exports.getExerciseForInternal = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const exercise = await Exercise.findById(id);
  if (!exercise) {
    return next(new ApiError(`No exercise found for this id ${id}`, 404));
  }
  res.status(200).json({ data: exercise });
});

/**
 * @desc    Create exercise
 * @route   POST /api/v1/exercises
 * @access  Private
 */
exports.createExercise = asyncHandler(async (req, res) => {
  const newExercise = await Exercise.create(req.body);

  // If lessonId is provided, add exercise to lesson
  if (req.body.lessonId) {
    await Lesson.findByIdAndUpdate(req.body.lessonId, {
      $push: { exercisesID: newExercise._id }
    });

    // Recalculate duration
    await recalcCourseDurationFromLesson(newExercise.lessonId);
  }

  res.status(201).json({ data: newExercise });
});

/**
 * @desc    Update exercise
 * @route   PUT /api/v1/exercises/:id
 * @access  Private
 */
exports.updateExercise = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const exercise = await Exercise.findByIdAndUpdate(id, req.body, { new: true });
  if (!exercise) {
    return next(new ApiError(`No exercise found for this id ${id}`, 404));
  }

  if (exercise.lessonId) {
    await recalcCourseDurationFromLesson(exercise.lessonId);
  }

  res.status(200).json({ data: exercise });
});

/**
 * @desc    Delete specific exercise
 * @route   DELETE /api/v1/exercises/:id
 * @access  Private (Instructor/Admin)
 */
exports.deleteExercise = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const exercise = await Exercise.findById(id);

  if (!exercise) {
    return next(new ApiError(`No exercise found for this id ${id}`, 404));
  }

  // 1. Remove reference from parent Lesson
  await Lesson.updateOne(
    { exercisesID: id },
    { $pull: { exercisesID: id } }
  );

  // 2. Delete the exercise itself
  await Exercise.findByIdAndDelete(id);

  // 3. Recalculate course duration
  if (exercise.lessonId) {
    await recalcCourseDurationFromLesson(exercise.lessonId);
  }

  res.status(204).send();
});
