const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const Course = require("../../schemas/courseSchema");

exports.createReviewValidator = [
  check("title")
    .notEmpty()
    .withMessage("Review title is required")
    .isString()
    .withMessage("Review title must be a string")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Review title must be at least 3 characters")
    .isLength({ max: 200 })
    .withMessage("Review title cannot exceed 200 characters"),

  check("ratings")
    .notEmpty()
    .withMessage("Rating is required")
    .isFloat({
      min: 1,
      max: 5,
    })
    .withMessage("Rating must be a number between 1 and 5"),

  check("courseId")
    .notEmpty()
    .withMessage("CourseId is required")
    .isMongoId()
    .withMessage("Invalid course id format")
    .custom(async (courseId) => {
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error(`No course found for this id: ${courseId}`);
      }
      return true;
    }),

  validatorMiddleware,
];

exports.getCourseReviewsValidator = [
  check("courseId")
    .notEmpty()
    .withMessage("CourseId is required")
    .isMongoId()
    .withMessage("Invalid course id format")
    .custom(async (courseId) => {
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error(`No course found for this id: ${courseId}`);
      }
      return true;
    }),

  validatorMiddleware,
];

exports.getUserReviewValidator = [
  check("courseId")
    .notEmpty()
    .withMessage("CourseId is required")
    .isMongoId()
    .withMessage("Invalid course id format")
    .custom(async (courseId) => {
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error(`No course found for this id: ${courseId}`);
      }
      return true;
    }),

  validatorMiddleware,
];

exports.updateReviewValidator = [
  check("id")
    .notEmpty()
    .withMessage("Review id is required")
    .isMongoId()
    .withMessage("Invalid review id format"),

  check("title")
    .optional()
    .isString()
    .withMessage("Review title must be a string")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Review title must be at least 3 characters")
    .isLength({ max: 200 })
    .withMessage("Review title cannot exceed 200 characters"),

  check("ratings")
    .optional()
    .isFloat({
      min: 1,
      max: 5,
    })
    .withMessage("Rating must be a number between 1 and 5"),

  validatorMiddleware,
];

exports.deleteReviewValidator = [
  check("id")
    .notEmpty()
    .withMessage("Review id is required")
    .isMongoId()
    .withMessage("Invalid review id format"),

  validatorMiddleware,
];
