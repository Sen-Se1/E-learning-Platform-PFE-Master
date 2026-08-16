const asyncHandler = require('express-async-handler');
const Module = require('../models/moduleSchema');
const Course = require('../models/courseModel');
const Lesson = require('../models/lessonSchema');
const Exercise = require('../models/exerciseSchema');
const ApiError = require('../utils/apiError');
const { recalcCourseDurationFromCourse } = require('../utils/courseDurationCalc');

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
  const { id } = req.params;
  const moduleData = await Module.findById(id).populate({
    path: 'lessonsID',
    populate: {
      path: 'exercisesID'
    }
  });
  if (!moduleData) {
    return next(new ApiError(`No module found for this id ${id}`, 404));
  }
  res.status(200).json({ data: moduleData });
});

/**
 * @desc    Create module
 * @route   POST /api/v1/modules
 * @access  Private
 */
exports.createModule = asyncHandler(async (req, res) => {
  const newModule = await Module.create(req.body);

  // If courseId is provided, add module to course
  if (req.body.courseId) {
    await Course.findByIdAndUpdate(req.body.courseId, {
      $push: { chaptersId: newModule._id }
    });
  }

  res.status(201).json({ data: newModule });
});

/**
 * @desc    Update module
 * @route   PUT /api/v1/modules/:id
 * @access  Private
 */
exports.updateModule = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const moduleData = await Module.findByIdAndUpdate(id, req.body, { new: true });
  if (!moduleData) {
    return next(new ApiError(`No module found for this id ${id}`, 404));
  }
  res.status(200).json({ data: moduleData });
});

/**
 * @desc    Delete specific module and its lessons/exercises
 * @route   DELETE /api/v1/modules/:id
 * @access  Private (Instructor/Admin)
 */
exports.deleteModule = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const moduleData = await Module.findById(id);

  if (!moduleData) {
    return next(new ApiError(`No module found for this id ${id}`, 404));
  }

  // 1. Cascading delete children (Lessons & Exercises)
  const lessons = await Lesson.find({ moduleId: id });
  for (const less of lessons) {
    await Exercise.deleteMany({ lessonId: less._id });
    await Lesson.findByIdAndDelete(less._id);
  }

  // 2. Delete exercises directly linked to the module
  await Exercise.deleteMany({ moduleId: id });

  // 2. Remove reference from parent Course
  await Course.updateOne(
    { chaptersId: id },
    { $pull: { chaptersId: id } }
  );

  // 3. Delete the module itself
  await Module.findByIdAndDelete(id);

  // 4. Recalculate duration
  if (moduleData.courseId) {
    await recalcCourseDurationFromCourse(moduleData.courseId);
  }

  res.status(204).send();
});
