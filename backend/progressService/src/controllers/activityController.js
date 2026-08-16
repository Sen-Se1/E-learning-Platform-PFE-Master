const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const Activity = require('../models/activityModel');

/**
 * @desc    Log a new activity for a user
 * @route   POST /api/v1/activities/log
 * @access  Private
 */
exports.logActivity = asyncHandler(async (req, res) => {
  const { actionType, itemId, title, courseTitle, courseId } = req.body;
  const userId = req.body.userId || req.query.userId || req.user?._id || req.headers['x-user-id'];

  if (!userId) {
    return res.status(400).json({ status: 'fail', message: 'User ID is required' });
  }

  // Validate ObjectId to prevent CastError
  if (!mongoose.Types.ObjectId.isValid(userId)) {
     return res.status(200).json({ status: 'success' });
  }

  // Prevent duplicate spam within 5 minutes for the exact same item
  const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
  const recent = await Activity.findOne({
    userId,
    itemId,
    createdAt: { $gte: fiveMinsAgo }
  });

  if (!recent) {
    await Activity.create({ userId, actionType, itemId, title, courseTitle, courseId });
  }

  res.status(200).json({ status: 'success' });
});

/**
 * @desc    Get all activities for a user
 * @route   GET /api/v1/activities
 * @access  Private
 */
exports.getActivities = asyncHandler(async (req, res) => {
  const userId = req.query.userId || req.body.userId || req.user?._id || req.headers['x-user-id'];

  if (!userId) {
    return res.status(400).json({ status: 'fail', message: 'User ID is required' });
  }

  // Validate ObjectId to prevent CastError
  if (!mongoose.Types.ObjectId.isValid(userId)) {
     return res.status(200).json({ status: 'success', data: [] });
  }

  const activities = await Activity.find({ userId })
    .sort({ createdAt: -1 })
    .limit(100);

  const formatted = activities.map(a => ({
    id: a._id,
    itemId: a.itemId,
    title: a.title,
    courseTitle: a.courseTitle,
    courseId: a.courseId,
    timestamp: a.createdAt,
    type: a.actionType
  }));

  res.status(200).json({
    status: 'success',
    data: formatted
  });
});
