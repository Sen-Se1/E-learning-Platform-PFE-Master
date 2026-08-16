const express = require('express');
const {
  enroll,
  getMyInscriptions,
  checkEnrollment,
  checkoutSession,
  webhookCheckout,
  getCourseStudentCount,
  getAllCoursesStudentCounts,
  getUniqueStudentCount,
  getEnrolledStudents
} = require('../controllers/inscriptionController');
const { protect, allowedTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/webhook', express.raw({ type: 'application/json' }), webhookCheckout);
router.get('/count/:courseId', getCourseStudentCount);
router.get('/counts', getAllCoursesStudentCounts);

router.use(protect);

router.post('/unique-count', getUniqueStudentCount);
router.get('/course-students/:courseId', getEnrolledStudents);
router.post('/enroll', allowedTo('student'), enroll);
router.get('/my-courses', allowedTo('student'), getMyInscriptions);
router.get('/check/:courseId', allowedTo('student'), checkEnrollment);
router.get('/checkout-session/:courseId', allowedTo('student'), checkoutSession);

module.exports = router;
