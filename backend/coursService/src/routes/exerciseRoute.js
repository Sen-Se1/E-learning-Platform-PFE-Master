const express = require('express');
const {
  getExercises,
  getExercise,
  createExercise,
  updateExercise,
  deleteExercise,
  getExerciseForInternal,
} = require('../controllers/exerciseController');

const {
  createExerciseValidator,
  getExerciseValidator,
  updateExerciseValidator,
  deleteExerciseValidator,
} = require('../utils/validators/exerciseValidator');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getExercises)
  .post(createExerciseValidator, createExercise);

router.route('/:id')
  .get(getExerciseValidator, getExercise)
  .put(updateExerciseValidator, updateExercise)
  .delete(deleteExerciseValidator, deleteExercise);

router.get('/:id/internal', getExerciseForInternal);

module.exports = router;
