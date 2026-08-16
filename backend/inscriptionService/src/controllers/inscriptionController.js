const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Inscription = require("../models/inscriptionModel");
const axios = require("axios");

/**
 * @desc    Get Checkout Session from Stripe and return as response
 * @route   GET /api/v1/inscriptions/checkout-session/:courseId
 * @access  Private (Student)
 */
exports.checkoutSession = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;
  const { courseTitle, price } = req.query;
  // 1) Check if already paid
  const existingPaid = await Inscription.findOne({
    userId: req.user._id,
    courseId,
    paymentStatus: "paid",
  });
  if (existingPaid) {
    return next(new ApiError("You are already enrolled in this course", 400));
  }

  // 2) Create checkout session
  const frontendUrl =
    process.env.FRONTEND_URL ||
    req.get("origin") ||
    (req.get("referer")
      ? new URL(req.get("referer")).origin
      : "http://localhost:3000");

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: Math.round(parseFloat(price) * 100),
          product_data: {
            name: courseTitle || "Course Enrollment",
          },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${frontendUrl}/student/courses/${courseId}/success`,
    cancel_url: `${frontendUrl}/student/courses/${courseId}`,
    customer_email: req.user.email, // We might need to add email to req.user in authMiddleware
    client_reference_id: courseId.toString(),
    metadata: {
      userId: req.user._id.toString(),
      courseId: courseId.toString(),
    },
  });

  // 3) Update or Create pending inscription in DB
  await Inscription.findOneAndUpdate(
    { userId: req.user._id, courseId },
    {
      price: parseFloat(price),
      paymentStatus: "pending",
      sessionId: session.id,
    },
    { upsert: true, new: true },
  );

  // 4) Send session to response
  res.status(200).json({ status: "success", session });
});

/**
 * @desc    Webhook for Stripe to confirm payment
 * @route   POST /api/v1/inscriptions/webhook
 * @access  Public
 */
exports.webhookCheckout = asyncHandler(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody, // Stripe needs RAW body
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || "",
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    // Update inscription status
    const userId = session.metadata.userId;
    const courseId = session.metadata.courseId;

    const inscription = await Inscription.findOneAndUpdate(
      { userId, courseId },
      { paymentStatus: "paid", paymentIntentId: session.payment_intent },
      { new: true },
    );

    try {
      if (!inscription) {
        console.error(`Webhook: No pending inscription found for user ${userId} and course ${courseId}`);
      }

      let courseTitle = "a course";
      let instructorId = null;
      try {
        const courseRes = await axios.get(
          `${process.env.COURSE_SERVICE_URL}/courses/${courseId}`
        );
        const course = courseRes.data.data || courseRes.data;
        courseTitle = course.title || "a course";
        instructorId = course.instructorId;
      } catch (err) {
        console.error("Webhook: Failed to fetch course info for notification:", err.message);
      }

      let userFullName = "A student";
      try {
        const userRes = await axios.get(
          `${process.env.USER_SERVICE_URL}/auth/public/${userId}`
        );
        const user = userRes.data.data || userRes.data;
        userFullName = user.name || "A student";
      } catch (err) {
        console.error("Webhook: Failed to fetch user info for notification:", err.message);
      }

      if (instructorId) {
        // Send notifications to teacher
        axios.post(process.env.NOTIFICATION_SERVICE_URL, {
          recipientType: "TEACHER",
          recipientId: instructorId,
          title: "New student enrolled",
          message: `${userFullName} enrolled in your course: ${courseTitle}`,
          type: "ENROLLMENT",
          priority: "MEDIUM",
          metadata: {
            courseId: inscription ? inscription.courseId : courseId,
            userId: inscription ? inscription.userId : userId,
            inscriptionId: inscription ? inscription._id : undefined,
          },
        });
      }
    } catch (err) {
      console.error("Error sending enrollment notification:", err.message);
    }
  }

  res.status(200).json({ received: true });
});

/**
 * @desc    Enroll in a course (for FREE courses)
 * @route   POST /api/v1/inscriptions/enroll
 * @access  Private (Student)
 */
exports.enroll = asyncHandler(async (req, res, next) => {
  const { courseId, price } = req.body;
  const userId = req.user._id;
  const userFullName =  `${req.user.profile.firstName +" "+ req.user.profile.lastName || "A student"}`;

  // Check if already paid
  const existingInscription = await Inscription.findOne({ userId, courseId });
  if (existingInscription && existingInscription.paymentStatus === "paid") {
    return next(new ApiError("You are already enrolled in this course", 400));
  }

  // Update if exists (pending) or create new (upsert)
  const inscription = await Inscription.findOneAndUpdate(
    { userId, courseId },
    {
      price: price || 0,
      paymentStatus: price && parseFloat(price) > 0 ? "pending" : "paid",
    },
    { upsert: true, new: true },
  );

  // get course info
  const courseRes = await axios.get(
    `${process.env.COURSE_SERVICE_URL}/api/v1/courses/${courseId}`,
    {
      headers: {
        Authorization: req.headers.authorization,
      },
    },
  );

  const course = courseRes.data.data || courseRes.data;

  // Send notifications to teacher and admin
  await Promise.all([
    axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/api/notifications`, {
      recipientType: "TEACHER",
      recipientId: course.instructorId,
      title: "New student enrolled",
      message: `${userFullName} enrolled in your course: ${course.title}`,
      type: "ENROLLMENT",
      priority: "MEDIUM",
      metadata: {
        courseId: inscription.courseId,
        userId: inscription.userId,
        inscriptionId: inscription._id,
      },
    }),
  ]);

  res.status(201).json({
    status: "success",
    data: inscription,
  });
});

/**
 * @desc    Get my enrolled courses
 * @route   GET /api/v1/inscriptions/my-courses
 * @access  Private (Student)
 */
exports.getMyInscriptions = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  // Find inscriptions that are either paid or active
  // We include 'pending' status only if it has a sessionId (meaning user started checkout)
  // But for the dashboard "My Courses", we usually want confirmed access.
  const inscriptions = await Inscription.find({
    userId,
    $or: [{ paymentStatus: "paid" }, { status: "active" }],
  });

  res.status(200).json({
    status: "success",
    results: inscriptions.length,
    data: inscriptions,
  });
});

/**
 * @desc    Check if user is enrolled in a course
 */
exports.checkEnrollment = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  const inscription = await Inscription.findOne({
    userId,
    courseId,
    $or: [{ paymentStatus: "paid" }, { status: "active" }],
  });

  res.status(200).json({
    status: "success",
    isEnrolled: !!inscription,
  });
});

/**
 * @desc    Get student count for a specific course
 * @route   GET /api/v1/inscriptions/count/:courseId
 * @access  Public
 */
exports.getCourseStudentCount = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;

  const count = await Inscription.countDocuments({
    courseId,
    $or: [{ paymentStatus: "paid" }, { status: "active" }],
  });

  res.status(200).json({
    status: "success",
    data: count,
  });
});

/**
 * @desc    Get student counts for all courses
 * @route   GET /api/v1/inscriptions/counts
 * @access  Public
 */
exports.getAllCoursesStudentCounts = asyncHandler(async (req, res, next) => {
  const counts = await Inscription.aggregate([
    {
      $match: {
        $or: [{ paymentStatus: "paid" }, { status: "active" }],
      },
    },
    {
      $group: {
        _id: "$courseId",
        count: { $sum: 1 },
      },
    },
  ]);

  // Convert to a more convenient format: { courseId: count }
  const countMap = {};
  counts.forEach((item) => {
    countMap[item._id] = item.count;
  });

  res.status(200).json({
    status: "success",
    data: countMap,
  });
});

/**
 * @desc    Get unique student count for a list of courses
 * @route   POST /api/v1/inscriptions/unique-count
 * @access  Public
 */
exports.getUniqueStudentCount = asyncHandler(async (req, res, next) => {
  const { courseIds } = req.body;

  if (!courseIds || !Array.isArray(courseIds)) {
    return next(new ApiError("Please provide courseIds array", 400));
  }

  const uniqueUsers = await Inscription.distinct("userId", {
    courseId: { $in: courseIds },
    $or: [{ paymentStatus: "paid" }, { status: "active" }],
  });

  res.status(200).json({
    status: "success",
    data: uniqueUsers.length,
    userIds: uniqueUsers,
  });
});

/**
 * @desc    Get all students enrolled in a specific course
 * @route   GET /api/v1/inscriptions/course-students/:courseId
 * @access  Private (Instructor/Admin)
 */
exports.getEnrolledStudents = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;

  const inscriptions = await Inscription.find({
    courseId,
    $or: [{ paymentStatus: "paid" }, { status: "active" }],
  }).select("userId createdAt price");

  res.status(200).json({
    status: "success",
    results: inscriptions.length,
    data: inscriptions,
  });
});
