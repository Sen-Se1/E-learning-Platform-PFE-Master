const express = require('express');
const {
  getCourses,
  getCourse,
  cours,
  update,
  deleteCourse,
  uploadCourseImage,
} = require('../controllers/courseController');
const { uploadMixFiles, parseJsonData } = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

const {
  createCourseValidator,
  getCourseValidator,
  updateCourseValidator,
  deleteCourseValidator,
} = require('../utils/validators/courseValidator');

const router = express.Router();


router
  .route('/')
  .get(getCourses)
  .post(
    protect,
    uploadMixFiles([{ name: 'imageCover', maxCount: 1 }]),
    parseJsonData,
    createCourseValidator,
    cours
  );

router
  .route('/:id')
  .get(getCourseValidator, getCourse)
  .put(
    protect,
    uploadMixFiles([{ name: 'imageCover', maxCount: 1 }]),
    parseJsonData,
    updateCourseValidator,
    update
  )
  .delete(protect, deleteCourseValidator, deleteCourse);


module.exports = router;
