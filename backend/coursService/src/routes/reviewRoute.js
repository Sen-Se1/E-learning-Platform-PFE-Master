const express = require("express");
const {
  createReview,
  getCourseReviews,
  updateReview,
  deleteReview,
  getUserReviewOnCourse,
} = require("../controllers/reviewController");
const {
  createReviewValidator,
  getCourseReviewsValidator,
  getUserReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
} = require("../utils/validators/reviewValidator");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/course/:courseId", getCourseReviews);

// Protected routes
router.use(protect);

router.get(
  "/my-review/:courseId",
  getUserReviewValidator,
  getUserReviewOnCourse,
);

router.post("/", createReviewValidator, createReview);

router
  .route("/:id")
  .put(updateReviewValidator, updateReview)
  .delete(deleteReviewValidator, deleteReview);

module.exports = router;
