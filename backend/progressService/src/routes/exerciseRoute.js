const express = require('express');
const {
  submitAnswer,
  getProgression,
  getUserAllStats,
} = require('../controllers/exerciseController');

const router = express.Router();

router.post('/', submitAnswer);
router.get('/progression/:lessonId', getProgression);
router.get('/user-stats/:userId', getUserAllStats);

module.exports = router;
