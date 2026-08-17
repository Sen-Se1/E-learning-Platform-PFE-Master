const { check } = require('express-validator');
const valitatorMiddleware = require('../../middleware/validatorMiddleware');
const Module = require('../../models/moduleSchema');

exports.createLessonValidator = [
  check('title')
    .notEmpty()
    .withMessage('Lesson title is required')
    .isLength({ min: 3 })
    .withMessage('Too short lesson title'),

  check('moduleId')
    .notEmpty()
    .withMessage('Module is required')
    .isMongoId()
    .withMessage('Invalid module id format')
    .custom((val) =>
      Module.findById(val).then((module) => {
        if (!module) {
          return Promise.reject(new Error(`No module for this id: ${val}`));
        }
      })
    ),

  check('type')
    .optional()
    .isIn(['video', 'code', 'file', 'exercise'])
    .withMessage('Invalid lesson type'),

  check('videoSource')
    .optional()
    .isIn(['url', 'upload'])
    .withMessage('Invalid video source type'),

  check('videoUrl')
    .optional()
    .isURL()
    .withMessage('Invalid video URL'),
  
  valitatorMiddleware,
];

exports.getLessonValidator = [
  check('id').isMongoId().withMessage('Invalid Lesson id format'),
  valitatorMiddleware,
];

exports.updateLessonValidator = [
  check('id').isMongoId().withMessage('Invalid Lesson id format'),
  check('title')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Too short lesson title'),
  valitatorMiddleware,
];

exports.deleteLessonValidator = [
  check('id').isMongoId().withMessage('Invalid Lesson id format'),
  valitatorMiddleware,
];
