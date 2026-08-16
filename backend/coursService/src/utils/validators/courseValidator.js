const { check } = require('express-validator');
const validatorMiddleware = require('../../middleware/validatorMiddleware');

exports.createCourseValidator = [
  check('title')
    .notEmpty()
    .withMessage('Course title is required')
    .isLength({ min: 3 })
    .withMessage('Too short course title')
    .isLength({ max: 100 })
    .withMessage('Too long course title'),
  check('description')
    .notEmpty()
    .withMessage('Course description is required')
    .isLength({ min: 10 })
    .withMessage('Too short course description'),
  check('instructorId')
    .notEmpty()
    .withMessage('Instructor ID is required')
    .isMongoId()
    .withMessage('Invalid instructor id format'),
  check('price')
    .notEmpty()
    .withMessage('Course price is required')
    .isNumeric()
    .withMessage('Course price must be a number'),
  check('category')
    .notEmpty()
    .withMessage('Course category is required'),
  check('level')
    .notEmpty()
    .withMessage('Level is required'),
  check('imageCover')
    .optional()
    .isString()
    .withMessage('Cover image must be a string'),
  validatorMiddleware,
];

exports.getCourseValidator = [
  check('id').notEmpty().withMessage('Course id or slug is required'),
  validatorMiddleware,
];

exports.updateCourseValidator = [
  check('id').isMongoId().withMessage('Invalid course id format'),
  check('title')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Too short course title'),
  validatorMiddleware,
];

exports.deleteCourseValidator = [
  check('id').isMongoId().withMessage('Invalid course id format'),
  validatorMiddleware,
];
