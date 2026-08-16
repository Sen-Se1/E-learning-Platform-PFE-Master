const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const CourseProgress = require('../models/courseProgressModel');

/**
 * @desc    Get course progress for user
 * @route   GET /api/v1/course-progress/:courseId
 * @access  Private
 */
exports.getCourseProgress = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.query.userId || req.body.userId || req.user?._id || req.headers['x-user-id'];

  if (!userId) {
    return res.status(400).json({ status: 'fail', message: 'User ID is required' });
  }

  // Validate ObjectId to prevent CastError
  if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(userId)) {
     return res.status(200).json({ status: 'success', data: [] });
  }

  const progress = await CourseProgress.findOne({ userId, courseId });
  
  res.status(200).json({
    status: 'success',
    data: progress ? progress.completedItems : []
  });
});

/**
 * @desc    Mark an item (lesson or exercise) as completed
 * @route   POST /api/v1/course-progress/:courseId/mark
 * @access  Private
 */
exports.markItemCompleted = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { items } = req.body;
  const userId = req.body.userId || req.query.userId || req.user?._id || req.headers['x-user-id'];

  if (!userId) {
    return res.status(400).json({ status: 'fail', message: 'User ID is required' });
  }

  // Ensure items is an array
  const itemsToAdd = Array.isArray(items) ? items : [items];

  // Validate ObjectId to prevent CastError
  if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(userId)) {
     return res.status(200).json({ status: 'success', data: [] });
  }

  // Update or create
  const progress = await CourseProgress.findOneAndUpdate(
    { userId, courseId },
    { $addToSet: { completedItems: { $each: itemsToAdd } } },
    { upsert: true, new: true }
  );

  res.status(200).json({
    status: 'success',
    data: progress.completedItems
  });
});
