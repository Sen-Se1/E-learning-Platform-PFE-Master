const mongoose = require("mongoose");
const path = require("path");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Course = require("../models/courseModel");
const Module = require("../models/moduleSchema");
const Lesson = require("../models/lessonSchema");
const Exercise = require("../models/exerciseSchema");
const { uploadToS3 } = require("../utils/s3Service");
const axios = require("axios");

/**
 * @desc    Upload Course Image
 * @route   POST /api/v1/courses/upload-image
 * @access  Private
 */
exports.uploadCourseImage = asyncHandler(async (req, res, next) => {
  if (!req.files || !req.files.imageCover) {
    return next(new ApiError("Please upload an image", 400));
  }
  res.status(200).json({ filename: req.files.imageCover[0].filename });
});

/**
 * @desc    Get list of courses
 * @route   GET /api/v1/courses
 * @access  Public
 */
exports.getCourses = asyncHandler(async (req, res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  // 1. Get total count of documents
  const totalDocuments = await Course.countDocuments();

  // 2. Fetch paginated data
  const courses = await Course.find({}).skip(skip).limit(limit);

  // 3. Calculate pagination metadata
  const totalPages = Math.ceil(totalDocuments / limit);

  res.status(200).json({
    results: courses.length,
    pagination: {
      currentPage: page,
      limit: limit,
      totalDocuments: totalDocuments,
      totalPages: totalPages,
    },
    data: courses,
  });
});

/**
 * @desc    Get specific course by id or slug with deep population
 * @route   GET /api/v1/courses/:id
 * @access  Public
 */
exports.getCourse = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const isMongoId = mongoose.Types.ObjectId.isValid(id);

  // 1. Fetch Course
  const course = await Course.findOne({
    $or: [...(isMongoId ? [{ _id: id }] : []), { slug: id }],
  }).lean();

  if (!course) {
    return next(new ApiError(`No course for this id or slug: ${id}`, 404));
  }

  // 2. Fetch Modules for this Course
  const modules = await Module.find({ courseId: course._id }).lean();

  // 3. For each Module, Fetch Lessons
  const modulesWithLessons = await Promise.all(
    modules.map(async (mod) => {
      const lessons = await Lesson.find({ moduleId: mod._id }).lean();

      // 4. For each Lesson, Fetch Exercises
      const lessonsWithExercises = await Promise.all(
        lessons.map(async (less) => {
          const exercises = await Exercise.find({ lessonId: less._id }).lean();
          return { ...less, exercises: exercises };
        }),
      );

      return { ...mod, lessons: lessonsWithExercises };
    }),
  );

  // Assemble final object
  course.modules = modulesWithLessons;

  res.status(200).json({ data: course });
});

/**
 * @desc    Create course (Supports nested data)
 * @route   POST /api/v1/courses
 * @access  Private (Instructor/Admin)
 */
exports.createCourse = asyncHandler(async (req, res) => {
  if (req.files && req.files.imageCover) {
    req.body.imageCover = req.files.imageCover[0].filename;

    // Logic hybride : Upload vers S3/LocalStack
    const imagePath = path.join(
      process.cwd(),
      "uploads",
      "images",
      req.files.imageCover[0].filename,
    );
    await uploadToS3(imagePath, "images");
  }

  const newCourse = await Course.create({
    title: req.body.title,
    description: req.body.description,
    instructorId: req.user.userId,
    price: req.body.price,
    category: req.body.category,
    level: req.body.level,
    imageCover: req.body.imageCover || null,
  });

  res.status(201).json({ data: newCourse });
});

/**
 * @desc    Update specific course
 * @route   PUT /api/v1/courses/:id
 * @access  Private (Instructor/Admin)
 */
exports.update = asyncHandler(async (req, res, next) => {
  if (req.files && req.files.imageCover) {
    req.body.imageCover = req.files.imageCover[0].filename;

    // Logic hybride : Upload vers S3/LocalStack
    const imagePath = path.join(
      process.cwd(),
      "uploads",
      "images",
      req.files.imageCover[0].filename,
    );
    await uploadToS3(imagePath, "images");
  }

  const course = await Course.findByIdAndUpdate(
    { _id: req.params.id },
    {
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      level: req.body.level,
      imageCover: req.body.imageCover || undefined,
    },
    { new: true },
  );
  if (!course) {
    return next(new ApiError(`No course for this id ${req.params.id}`, 404));
  }

  // Send notifications to enrolled students about course update
  // const inscriptionsRes = await axios.get(
  //   `${process.env.INSCRIPTION_SERVICE_URL}/inscriptions/course-students/${course._id}`,
  //   {
  //     headers: {
  //       Authorization: req.headers.authorization
  //     }
  //   }
  // );

  // const inscriptions = inscriptionsRes.data.data || inscriptionsRes.data;

  // await Promise.all(
  //   inscriptions.map(inscription =>
  //     axios.post(process.env.NOTIFICATION_SERVICE_URL, {
  //       recipientType: "USER",
  //       recipientId: inscription.userId,
  //       title: "Course updated",
  //       message: `Your course "${course.title}" has new updates`,
  //       type: "COURSE_UPDATE",
  //       priority: "MEDIUM",
  //       metadata: {
  //         courseId: course._id,
  //         teacherId: course.teacherId
  //       }
  //     })
  //   )
  // );

  res.status(200).json({ data: course });
});

/**
 * @desc    Delete specific course and its children (Cascading Delete)
 * @route   DELETE /api/v1/courses/:id
 * @access  Private (Instructor/Admin)
 */
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ApiError(`No course for this id ${req.params.id}`, 404));
  }

  const courseId = course._id;

  // 1. Find all modules belonging to the course
  const modules = await Module.find({ courseId });

  const moduleIds = modules.map((module) => module._id);

  if (moduleIds.length > 0) {
    // 2. Find all lessons belonging to these modules
    const lessons = await Lesson.find({ moduleId: { $in: moduleIds } });

    const lessonIds = lessons.map((lesson) => lesson._id);

    // 3. Delete exercises belonging to these lessons
    if (lessonIds.length > 0) {
      await Exercise.deleteMany({
        lessonId: { $in: lessonIds },
      });
    }

    // 4. Delete all lessons
    await Lesson.deleteMany({
      moduleId: { $in: moduleIds },
    });

    // 5. Delete all modules
    await Module.deleteMany({
      courseId,
    });
  }

  // 6. Delete all reviews belonging to the course
  await Review.deleteMany({
    course: courseId,
  });

  // 7. Delete the course
  await Course.findByIdAndDelete(courseId);

  res.status(204).send();
});
