const asyncHandler = require("express-async-handler");
const Review = require("../models/reviewModel");
const ApiError = require("../utils/apiError");

// @desc    Create review
// @route   POST /api/v1/reviews
// @access  Private/Protect/User
exports.createReview = asyncHandler(async (req, res, next) => {
  // Check if user already reviewed this course
  const existingReview = await Review.findOne({
    user: req.user._id,
    course: req.body.course,
  });

  if (existingReview) {
    return next(new ApiError("You have already reviewed this course", 400));
  }

  const review = await Review.create({
    ratings: req.body.ratings,
    title: req.body.title,
    user: req.user._id,
    course: req.body.course,
  });

  res.status(201).json({ status: "success", data: review });
});

// @desc    Get all reviews for a course
// @route   GET /api/v1/reviews/course/:courseId
// @access  Public
exports.getCourseReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ course: req.params.courseId });

  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: reviews,
  });
});

// @desc    Update review
// @route   PUT /api/v1/reviews/:id
// @access  Private/Protect/User
exports.updateReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ApiError(`No review found with ID ${req.params.id}`, 404));
  }

  // Check ownership
  if (review.user.toString() !== req.user._id.toString()) {
    return next(new ApiError("You are not allowed to update this review", 403));
  }

  review.ratings = req.body.ratings || review.ratings;
  review.title = req.body.title || review.title;
  await review.save();

  res.status(200).json({ status: "success", data: review });
});

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private/Protect/User
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ApiError(`No review found with ID ${req.params.id}`, 404));
  }

  // Check ownership
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new ApiError("You are not allowed to delete this review", 403));
  }

  await review.deleteOne();
  // The post-remove hook will handle updating the course ratings

  res.status(204).send();
});

// @desc    Get logged-in user review for a specific course
// @route   GET /api/v1/reviews/my-review/:courseId
// @access  Private/Protect/User
exports.getUserReviewOnCourse = asyncHandler(async (req, res, next) => {
  const review = await Review.findOne({
    user: req.user._id,
    course: req.params.courseId,
  });

  res.status(200).json({ status: "success", data: review });
});

