const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const Course = require("../../schemas/courseSchema");

exports.createModuleValidator = [
  check("title")
    .notEmpty()
    .withMessage("Module title is required")
    .isString()
    .withMessage("Module title must be a string")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Module title must be at least 3 characters")
    .isLength({ max: 100 })
    .withMessage("Module title cannot exceed 100 characters"),

  check("description")
    .optional()
    .isString()
    .withMessage("Module description must be a string")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Module description must be at least 10 characters")
    .isLength({ max: 500 })
    .withMessage("Module description cannot exceed 500 characters"),

  check("courseId")
    .notEmpty()
    .withMessage("Course is required")
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

exports.getModuleValidator = [
  check("id")
    .notEmpty()
    .withMessage("Module id is required")
    .isMongoId()
    .withMessage("Invalid Module id format"),

  validatorMiddleware,
];

exports.updateModuleValidator = [
  check("id")
    .notEmpty()
    .withMessage("Module id is required")
    .isMongoId()
    .withMessage("Invalid Module id format"),

  check("title")
    .optional()
    .isString()
    .withMessage("Module title must be a string")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Module title must be at least 3 characters")
    .isLength({ max: 100 })
    .withMessage("Module title cannot exceed 100 characters"),

  check("description")
    .optional()
    .isString()
    .withMessage("Module description must be a string")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Module description must be at least 10 characters")
    .isLength({ max: 500 })
    .withMessage("Module description cannot exceed 500 characters"),

  validatorMiddleware,
];

exports.deleteModuleValidator = [
  check("id")
    .notEmpty()
    .withMessage("Module id is required")
    .isMongoId()
    .withMessage("Invalid Module id format"),

  validatorMiddleware,
];
