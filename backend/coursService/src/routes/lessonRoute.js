const express = require('express');
const {
  getLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  fetchYoutubeDuration,
} = require('../controllers/lessonController');

const { uploadMixFiles, parseJsonData } = require('../middleware/uploadMiddleware');

const {
  createLessonValidator,
  getLessonValidator,
  updateLessonValidator,
  deleteLessonValidator,
} = require('../utils/validators/lessonValidator');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/youtube-duration', fetchYoutubeDuration);

router.route('/')
  .get(getLessons)
  .post(
    uploadMixFiles([
      { name: 'videoFile', maxCount: 1 },
      { name: 'pdfFile', maxCount: 1 }
    ]),
    parseJsonData,
    createLessonValidator,
    createLesson
  );

router.route('/:id')
  .get(getLessonValidator, getLesson)
  .put(
    uploadMixFiles([
      { name: 'videoFile', maxCount: 1 },
      { name: 'pdfFile', maxCount: 1 }
    ]),
    parseJsonData,
    updateLessonValidator,
    updateLesson
  )
  .delete(deleteLessonValidator, deleteLesson);

module.exports = router;
