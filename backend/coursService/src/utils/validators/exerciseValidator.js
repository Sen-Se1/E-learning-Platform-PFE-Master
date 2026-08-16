const { check } = require('express-validator');
const valitatorMiddleware = require('../../middleware/validatorMiddleware');
const Lesson = require('../../models/lessonSchema');

exports.createExerciseValidator = [
  check('title')
    .notEmpty()
    .withMessage('Exercise title is required')
    .isLength({ min: 3 })
    .withMessage('Too short exercise title'),

  check('type')
    .notEmpty()
    .withMessage('Exercise type is required')
    .isIn(['coding', 'quiz', 'boolean'])
    .withMessage('Invalid exercise type'),

  check('lessonId')
    .notEmpty()
    .withMessage('Lesson ID is required')
    .isMongoId()
    .withMessage('Invalid lesson id format')
    .custom((val) =>
      Lesson.findById(val).then((lesson) => {
        if (!lesson) {
          return Promise.reject(new Error(`No lesson for this id: ${val}`));
        }
      })
    ),

  check('instructions')
    .optional(),

  check('maxScore')
    .optional()
    .isNumeric()
    .withMessage('Max score must be a number'),

  check('timeLimit')
    .optional()
    .isNumeric()
    .withMessage('Time limit must be a number'),

  check('options')
    .optional()
    .isArray()
    .withMessage('Options must be an array'),

  valitatorMiddleware,
];

exports.getExerciseValidator = [
  check('id').isMongoId().withMessage('Invalid Exercise id format'),
  valitatorMiddleware,
];

exports.updateExerciseValidator = [
  check('id').isMongoId().withMessage('Invalid Exercise id format'),
  check('title')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Too short exercise title'),
  valitatorMiddleware,
];

exports.deleteExerciseValidator = [
  check('id').isMongoId().withMessage('Invalid Exercise id format'),
  valitatorMiddleware,
];
