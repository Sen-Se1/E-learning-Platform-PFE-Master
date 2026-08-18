const { check } = require("express-validator");
const valitatorMiddleware = require("../../middleware/validatorMiddleware");
const Module = require("../../models/moduleSchema");

exports.createLessonValidator = [
  check("title")
    .notEmpty()
    .withMessage("Lesson title is required")
    .isString()
    .withMessage("Lesson title must be a string")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Lesson title must be at least 3 characters")
    .isLength({ max: 150 })
    .withMessage("Lesson title cannot exceed 150 characters"),

  check("description")
    .notEmpty()
    .withMessage("Lesson description is required")
    .isString()
    .withMessage("Lesson description must be a string")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Lesson description must be at least 10 characters")
    .isLength({ max: 1000 })
    .withMessage("Lesson description cannot exceed 1000 characters"),

  check("moduleId")
    .notEmpty()
    .withMessage("Module is required")
    .isMongoId()
    .withMessage("Invalid module id format")
    .custom(async (moduleId) => {
      const module = await Module.findById(moduleId);

      if (!module) {
        throw new Error(`No module found for this id: ${moduleId}`);
      }

      return true;
    }),

  check("videoSource")
    .notEmpty()
    .withMessage("Video source is required")
    .isIn(["url", "upload"])
    .withMessage("Video source must be either url or upload"),

  check("videoUrl").custom((value, { req }) => {
    if (req.body.videoSource === "url") {
      if (!value) {
        throw new Error("Video URL is required when videoSource is url");
      }

      if (typeof value !== "string" || !/^https?:\/\/.+/i.test(value)) {
        throw new Error("Invalid video URL");
      }

      return true;
    }

    // If upload, videoUrl must not exist
    if (req.body.videoSource === "upload" && value) {
      throw new Error(
        "videoUrl must not be provided when videoSource is upload",
      );
    }

    return true;
  }),

  check("videoFile").custom((value, { req }) => {
    const videoFile = req.files?.videoFile?.[0];

    if (req.body.videoSource === "upload") {
      if (!videoFile) {
        throw new Error("Video file is required when videoSource is upload");
      }

      return true;
    }

    // If URL, videoFile must not exist
    if (req.body.videoSource === "url" && videoFile) {
      throw new Error("videoFile must not be provided when videoSource is url");
    }

    return true;
  }),

  check("noteContent")
    .optional()
    .isString()
    .withMessage("Note content must be a string"),

  valitatorMiddleware,
];

exports.getLessonValidator = [
  check("id")
    .notEmpty()
    .withMessage("Lesson id is required")
    .isMongoId()
    .withMessage("Invalid lesson id format"),

  valitatorMiddleware,
];

exports.updateLessonValidator = [
  check("id")
    .notEmpty()
    .withMessage("Lesson id is required")
    .isMongoId()
    .withMessage("Invalid lesson id format"),

  check("title")
    .optional()
    .isString()
    .withMessage("Lesson title must be a string")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Lesson title must be at least 3 characters")
    .isLength({ max: 150 })
    .withMessage("Lesson title cannot exceed 150 characters"),

  check("description")
    .optional()
    .isString()
    .withMessage("Lesson description must be a string")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Lesson description must be at least 10 characters")
    .isLength({ max: 1000 })
    .withMessage("Lesson description cannot exceed 1000 characters"),

  check("moduleId")
    .optional()
    .isMongoId()
    .withMessage("Invalid module id format")
    .custom(async (moduleId) => {
      const module = await Module.findById(moduleId);

      if (!module) {
        throw new Error(`No module found for this id: ${moduleId}`);
      }

      return true;
    }),

  check("videoSource")
    .optional()
    .isIn(["url", "upload"])
    .withMessage("Video source must be either url or upload"),

  check("videoUrl").custom((value, { req }) => {
    // No videoSource change
    // videoUrl can be omitted
    if (!req.body.videoSource) {
      return true;
    }

    if (req.body.videoSource === "url") {
      if (!value) {
        throw new Error("Video URL is required when videoSource is url");
      }

      if (typeof value !== "string" || !/^https?:\/\/.+/i.test(value)) {
        throw new Error("Invalid video URL");
      }

      return true;
    }

    if (req.body.videoSource === "upload" && value) {
      throw new Error(
        "videoUrl must not be provided when videoSource is upload",
      );
    }

    return true;
  }),

  check("videoFile").custom((value, { req }) => {
    const videoFile = req.files?.videoFile?.[0];

    if (req.body.videoSource === "upload") {
      if (!videoFile) {
        throw new Error("Video file is required when videoSource is upload");
      }

      return true;
    }

    if (req.body.videoSource === "url" && videoFile) {
      throw new Error("videoFile must not be provided when videoSource is url");
    }

    return true;
  }),

  check("noteContent")
    .optional()
    .isString()
    .withMessage("Note content must be a string"),

  valitatorMiddleware,
];

exports.deleteLessonValidator = [
  check("id")
    .notEmpty()
    .withMessage("Lesson id is required")
    .isMongoId()
    .withMessage("Invalid lesson id format"),

  valitatorMiddleware,
];
