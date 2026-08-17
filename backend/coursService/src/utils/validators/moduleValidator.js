const { check } = require('express-validator');
const validatorMiddleware = require('../../middleware/validatorMiddleware');
const Course = require('../../models/courseModel');

exports.createModuleValidator = [
  check('title')
    .notEmpty()
    .withMessage('Module title is required')
    .isLength({ min: 3 })
    .withMessage('Too short module title'),
  check('description')
    .optional()
    .isLength({ min: 10 })
    .withMessage('Too short module description'),
  check('courseId')
    .notEmpty()
    .withMessage('Course is required')
    .isMongoId()
    .withMessage('Invalid course id format')
    .custom((val) =>
      Course.findById(val).then((course) => {
        if (!course) {
          return Promise.reject(new Error(`No course for this id: ${val}`));
        }
      })
    ),
  validatorMiddleware,
];

exports.getModuleValidator = [
  check('id').isMongoId().withMessage('Invalid Module id format'),
  validatorMiddleware,
];

exports.updateModuleValidator = [
  check('id').isMongoId().withMessage('Invalid Module id format'),
  check('title')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Too short module title'),
  check('description')
    .optional()
    .isLength({ min: 10 })
    .withMessage('Too short module description'),
  validatorMiddleware,
];

exports.deleteModuleValidator = [
  check('id').isMongoId().withMessage('Invalid Module id format'),
  validatorMiddleware,
];
