const express = require('express');
const {
  createReview,
  getCourseReviews,
  updateReview,
  deleteReview,
  getUserReviewOnCourse
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/course/:courseId', getCourseReviews);

// Protected routes
router.use(protect);

router.get('/my-review/:courseId', getUserReviewOnCourse);
router.post('/', createReview);
router.route('/:id').put(updateReview).delete(deleteReview);

module.exports = router;
