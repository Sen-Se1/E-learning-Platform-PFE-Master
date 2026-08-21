const asyncHandler = require("express-async-handler");
const Module = require("../schemas/moduleSchema");
const Course = require("../schemas/courseSchema");
const Lesson = require("../schemas/lessonSchema");
const Exercise = require("../schemas/exerciseSchema");
const ApiError = require("../utils/apiError");
const {
  recalcCourseDurationFromCourse,
} = require("../utils/courseDurationCalc");

/**
 * @desc    Get all modules
 * @route   GET /api/v1/modules
 * @access  Public
 */
exports.getModules = asyncHandler(async (req, res) => {
  const modules = await Module.find();
  res.status(200).json({ data: modules });
});

/**
 * @desc    Get specific module by id
 * @route   GET /api/v1/modules/:id
 * @access  Public
 */
exports.getModule = asyncHandler(async (req, res, next) => {
  const moduleData = await Module.findById(req.params.id);
  if (!moduleData) {
    return next(
      new ApiError(`No module found for this id ${req.params.id}`, 404),
    );
  }
  res.status(200).json({ data: moduleData });
});

/**
 * @desc    Create module
 * @route   POST /api/v1/modules
 * @access  Private
 */
exports.createModule = asyncHandler(async (req, res) => {
  const newModule = await Module.create({
    title: req.body.title,
    description: req.body.description,
    courseId: req.body.courseId,
  });

  res.status(201).json({ data: newModule });
});

/**
 * @desc    Update module
 * @route   PUT /api/v1/modules/:id
 * @access  Private
 */
exports.updateModule = asyncHandler(async (req, res, next) => {
  const moduleData = await Module.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      description: req.body.description,
    },
    { new: true },
  );
  if (!moduleData) {
    return next(
      new ApiError(`No module found for this id ${req.params.id}`, 404),
    );
  }
  res.status(200).json({ data: moduleData });
});

/**
 * @desc    Delete specific module and its lessons/exercises
 * @route   DELETE /api/v1/modules/:id
 * @access  Private (Instructor/Admin)
 */
exports.deleteModule = asyncHandler(async (req, res, next) => {
  const moduleData = await Module.findById(req.params.id);

  if (!moduleData) {
    return next(
      new ApiError(
        `No module found for this id ${req.params.id}`,
        404
      )
    );
  }

  const courseId = moduleData.courseId;

  // Find all lessons belonging to this module
  const lessons = await Lesson.find({ moduleId: moduleData._id });

  // Delete exercises belonging to those lessons
  if (lessons.length > 0) {
    const lessonIds = lessons.map(lesson => lesson._id);

    await Exercise.deleteMany({
      lessonId: { $in: lessonIds }
    });
  }

  // Delete all lessons belonging to the module
  await Lesson.deleteMany({
    moduleId: moduleData._id
  });

  // Delete the module
  await Module.findByIdAndDelete(moduleData._id);

  // Recalculate course duration
  if (courseId) {
    await recalcCourseDurationFromCourse(courseId);
  }

  res.status(204).send();
});