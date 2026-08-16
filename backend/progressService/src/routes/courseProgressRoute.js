const express = require('express');
const { getCourseProgress, markItemCompleted } = require('../controllers/courseProgressController');

const router = express.Router();

router.get('/:courseId', getCourseProgress);
router.post('/:courseId/mark', markItemCompleted);

module.exports = router;
