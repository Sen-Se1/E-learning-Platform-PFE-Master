const asyncHandler = require('express-async-handler');
const path = require('path');
const Lesson = require('../models/lessonSchema');
const Module = require('../models/moduleSchema');
const Exercise = require('../models/exerciseSchema');
const ApiError = require('../utils/apiError');
const { getYoutubeDuration } = require('../utils/youtube-duration');
const { getVimeoDuration } = require('../utils/vimeo-duration');
const { getVideoDurationInSeconds } = require('../utils/local-video-duration');
const { recalcCourseDurationFromModule } = require('../utils/courseDurationCalc');
const { uploadToS3 } = require('../utils/s3Service');

/**
 * @desc    Fetch Youtube duration
 * @route   GET /api/v1/lessons/youtube-duration
 * @access  Private
 */
exports.fetchYoutubeDuration = asyncHandler(async (req, res, next) => {
  const { url } = req.query;
  if (!url) return next(new ApiError('URL is required', 400));
  
  try {
    const duration = await getYoutubeDuration(url);
    res.status(200).json({ data: duration });
  } catch (error) {
    return next(new ApiError('Could not fetch duration', 400));
  }
});

/**
 * @desc    Upload Lesson Video

 * @route   POST /api/v1/courses/upload-video
 * @access  Private
 */
exports.uploadLessonVideo = asyncHandler(async (req, res, next) => {
  if (!req.files || !req.files.videoFile) {
    return next(new ApiError('Please upload a video', 400));
  }
  res.status(200).json({ filename: req.files.videoFile[0].filename });
});

/**
 * @desc    Upload Lesson PDF
 * @route   POST /api/v1/courses/upload-pdf
 * @access  Private
 */
exports.uploadLessonPdf = asyncHandler(async (req, res, next) => {
  if (!req.files || !req.files.pdfFile) {
    return next(new ApiError('Please upload a PDF', 400));
  }
  res.status(200).json({ filename: req.files.pdfFile[0].filename });
});

/**
 * @desc    Get all lessons
 * @route   GET /api/v1/lessons
 * @access  Public
 */
exports.getLessons = asyncHandler(async (req, res) => {
  const lessons = await Lesson.find();
  res.status(200).json({ data: lessons });
});

/**
 * @desc    Get specific lesson by id
 * @route   GET /api/v1/lessons/:id
 * @access  Public
 */
exports.getLesson = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const lesson = await Lesson.findById(id).populate('exercisesID');
  if (!lesson) {
    return next(new ApiError(`No lesson found for this id ${id}`, 404));
  }
  res.status(200).json({ data: lesson });
});

/**
 * @desc    Create lesson
 * @route   POST /api/v1/lessons
 * @access  Private
 */
exports.createLesson = asyncHandler(async (req, res) => {
  if (req.files) {
    if (req.files.videoFile) req.body.videoFile = req.files.videoFile[0].filename;
    if (req.files.pdfFile) req.body.pdfFile = req.files.pdfFile[0].filename;
  }

  // Calculate duration if we have a video
  if (req.body.videoSource === 'url' && req.body.videoUrl && !req.body.duration) {
    try {
      if (req.body.videoUrl.includes('vimeo.com')) {
        req.body.duration = await getVimeoDuration(req.body.videoUrl);
      } else {
        req.body.duration = await getYoutubeDuration(req.body.videoUrl);
      }
    } catch (err) {
      console.error('Failed to get video URL duration:', err.message);
    }
  } else if (req.body.videoSource === 'upload' && req.body.videoFile && !req.body.duration) {
    try {
      const videoPath = path.join(process.cwd(), 'uploads', 'videos', req.body.videoFile);
      const durationSec = await getVideoDurationInSeconds(videoPath);
      const h = Math.floor(durationSec / 3600);
      const m = Math.floor((durationSec % 3600) / 60);
      const s = Math.floor(durationSec % 60);
      const durationStr = h > 0 
        ? `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`
        : `${m}:${s < 10 ? '0' : ''}${s}`;
      req.body.duration = durationStr;
    } catch (err) {
      console.error('Failed to get video file duration:', err.message);
    }
  }

  // Logic hybride : Upload vers S3/LocalStack si activé
  if (req.files) {
    if (req.files.videoFile) {
      const videoPath = path.join(process.cwd(), 'uploads', 'videos', req.files.videoFile[0].filename);
      await uploadToS3(videoPath, 'videos');
    }
    if (req.files.pdfFile) {
      const pdfPath = path.join(process.cwd(), 'uploads', 'documents', req.files.pdfFile[0].filename);
      await uploadToS3(pdfPath, 'documents');
    }
  }

  const newLesson = await Lesson.create(req.body);
  
  // If moduleId is provided, add lesson to module
  if (req.body.moduleId) {
    await Module.findByIdAndUpdate(req.body.moduleId, {
      $push: { lessonsID: newLesson._id }
    });
    
    // Recalculate duration
    await recalcCourseDurationFromModule(req.body.moduleId);
  }

  res.status(201).json({ data: newLesson });
});

/**
 * @desc    Update lesson
 * @route   PUT /api/v1/lessons/:id
 * @access  Private
 */
exports.updateLesson = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (req.files) {
    if (req.files.videoFile) req.body.videoFile = req.files.videoFile[0].filename;
    if (req.files.pdfFile) req.body.pdfFile = req.files.pdfFile[0].filename;
  }

  // Calculate duration if we have a new video
  if (req.body.videoSource === 'url' && req.body.videoUrl && !req.body.duration) {
    try {
      if (req.body.videoUrl.includes('vimeo.com')) {
        req.body.duration = await getVimeoDuration(req.body.videoUrl);
      } else {
        req.body.duration = await getYoutubeDuration(req.body.videoUrl);
      }
    } catch (err) {
      console.error('Failed to get video URL duration:', err.message);
    }
  } else if (req.body.videoSource === 'upload' && req.body.videoFile && !req.body.duration) {
    try {
      const videoPath = path.join(process.cwd(), 'uploads', 'videos', req.body.videoFile);
      const durationSec = await getVideoDurationInSeconds(videoPath);
      const h = Math.floor(durationSec / 3600);
      const m = Math.floor((durationSec % 3600) / 60);
      const s = Math.floor(durationSec % 60);
      const durationStr = h > 0 
        ? `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`
        : `${m}:${s < 10 ? '0' : ''}${s}`;
      req.body.duration = durationStr;
    } catch (err) {
      console.error('Failed to get video file duration:', err.message);
    }
  }

  // Logic hybride : Upload vers S3/LocalStack si activé (Mise à jour)
  if (req.files) {
    if (req.files.videoFile) {
      const videoPath = path.join(process.cwd(), 'uploads', 'videos', req.files.videoFile[0].filename);
      await uploadToS3(videoPath, 'videos');
    }
    if (req.files.pdfFile) {
      const pdfPath = path.join(process.cwd(), 'uploads', 'documents', req.files.pdfFile[0].filename);
      await uploadToS3(pdfPath, 'documents');
    }
  }

  const lesson = await Lesson.findByIdAndUpdate(id, req.body, { new: true });
  if (!lesson) {
    return next(new ApiError(`No lesson found for this id ${id}`, 404));
  }

  if (lesson.moduleId) {
    await recalcCourseDurationFromModule(lesson.moduleId);
  }

  res.status(200).json({ data: lesson });
});

/**
 * @desc    Delete specific lesson and its exercises
 * @route   DELETE /api/v1/lessons/:id
 * @access  Private (Instructor/Admin)
 */
exports.deleteLesson = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const lesson = await Lesson.findById(id);

  if (!lesson) {
    return next(new ApiError(`No lesson found for this id ${id}`, 404));
  }

  // 1. Delete associated exercises
  await Exercise.deleteMany({ lessonId: id });

  // 2. Remove reference from parent Module
  await Module.updateOne(
    { lessonsID: id },
    { $pull: { lessonsID: id } }
  );

  // 3. Delete the lesson itself
  await Lesson.findByIdAndDelete(id);

  // 4. Recalculate duration
  if (lesson.moduleId) {
    await recalcCourseDurationFromModule(lesson.moduleId);
  }

  res.status(204).send();
});
