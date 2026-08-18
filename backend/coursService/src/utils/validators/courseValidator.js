const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");

exports.createCourseValidator = [
  check("title")
    .notEmpty()
    .withMessage("Course title is required")
    .isString()
    .withMessage("Course title must be a string")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Course title must be at least 3 characters")
    .isLength({ max: 100 })
    .withMessage("Course title cannot exceed 100 characters"),

  check("subtitle")
    .optional()
    .isString()
    .withMessage("Course subtitle must be a string")
    .trim()
    .isLength({ max: 200 })
    .withMessage("Course subtitle cannot exceed 200 characters"),

  check("description")
    .notEmpty()
    .withMessage("Course description is required")
    .isString()
    .withMessage("Course description must be a string")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Course description must be at least 10 characters"),

  check("category")
    .notEmpty()
    .withMessage("Course category is required")
    .isString()
    .withMessage("Course category must be a string")
    .trim(),

  check("level")
    .optional()
    .isIn(["Beginner", "Intermediate", "Advanced", "All Levels"])
    .withMessage(
      "Level must be Beginner, Intermediate, Advanced, or All Levels",
    ),

  check("price")
    .optional()
    .isNumeric()
    .withMessage("Course price must be a number")
    .custom((value) => {
      if (Number(value) < 0) {
        throw new Error("Course price cannot be negative");
      }
      return true;
    }),

  check("imageCover")
    .optional()
    .isString()
    .withMessage("Cover image must be a string")
    .trim(),

  validatorMiddleware,
];

exports.getCourseValidator = [
  check("id").notEmpty().withMessage("Course id or slug is required"),

  validatorMiddleware,
];

exports.updateCourseValidator = [
  check("id")
    .notEmpty()
    .withMessage("Course id is required")
    .isMongoId()
    .withMessage("Invalid course id format"),

  check("title")
    .optional()
    .isString()
    .withMessage("Course title must be a string")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Course title must be at least 3 characters")
    .isLength({ max: 100 })
    .withMessage("Course title cannot exceed 100 characters"),

  check("subtitle")
    .optional()
    .isString()
    .withMessage("Course subtitle must be a string")
    .trim()
    .isLength({ max: 200 })
    .withMessage("Course subtitle cannot exceed 200 characters"),

  check("description")
    .optional()
    .isString()
    .withMessage("Course description must be a string")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Course description must be at least 10 characters"),

  check("category")
    .optional()
    .isString()
    .withMessage("Course category must be a string")
    .trim()
    .notEmpty()
    .withMessage("Course category cannot be empty"),

  check("level")
    .optional()
    .isIn(["Beginner", "Intermediate", "Advanced", "All Levels"])
    .withMessage(
      "Level must be Beginner, Intermediate, Advanced, or All Levels",
    ),

  check("price")
    .optional()
    .isNumeric()
    .withMessage("Course price must be a number")
    .custom((value) => {
      if (Number(value) < 0) {
        throw new Error("Course price cannot be negative");
      }
      return true;
    }),

  check("imageCover")
    .optional()
    .isString()
    .withMessage("Cover image must be a string")
    .trim(),

  check("isArchived")
    .optional()
    .isBoolean()
    .withMessage("isArchived must be a boolean"),

  validatorMiddleware,
];

exports.deleteCourseValidator = [
  check("id")
    .notEmpty()
    .withMessage("Course id is required")
    .isMongoId()
    .withMessage("Invalid course id format"),

  validatorMiddleware,
];
