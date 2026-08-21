const asyncHandler = require("express-async-handler");
const path = require("path");
const Lesson = require("../schemas/lessonSchema");
const Module = require("../schemas/moduleSchema");
const Exercise = require("../schemas/exerciseSchema");
const ApiError = require("../utils/apiError");
const { getYoutubeDuration } = require("../utils/youtube-duration");
const { getVimeoDuration } = require("../utils/vimeo-duration");
const { getVideoDurationInSeconds } = require("../utils/local-video-duration");
const {
  recalcCourseDurationFromModule,
} = require("../utils/courseDurationCalc");
const { uploadToS3 } = require("../utils/s3Service");

/**
 * @desc    Get all lessons
 * @route   GET /api/v1/lessons
 * @access  Public
 */
exports.getLessons = asyncHandler(async (req, res) => {
  const lessons = await Lesson.find();

  res.status(200).json({
    results: lessons.length,
    data: lessons,
  });
});

/**
 * @desc    Get specific lesson by id
 * @route   GET /api/v1/lessons/:id
 * @access  Public
 */
exports.getLesson = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const lesson = await Lesson.findById(id);

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
  const videoFile = req.files?.videoFile?.[0];
  const pdfFile = req.files?.pdfFile?.[0];
  let duration = "0:00";

  // Calculate duration if we have a video
  if (req.body.videoSource === "url" && req.body.videoUrl) {
    try {
      if (req.body.videoUrl.includes("vimeo.com")) {
        duration = await getVimeoDuration(req.body.videoUrl);
      } else {
        duration = await getYoutubeDuration(req.body.videoUrl);
      }
    } catch (err) {
      console.error("Failed to get video URL duration:", err.message);
    }
  } else if (req.body.videoSource === "upload" && videoFile) {
    try {
      const videoPath = path.resolve(videoFile.path);
      const durationSec = await getVideoDurationInSeconds(videoPath);
      const h = Math.floor(durationSec / 3600);
      const m = Math.floor((durationSec % 3600) / 60);
      const s = Math.floor(durationSec % 60);
      const durationStr =
        h > 0
          ? `${h}:${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`
          : `${m}:${s < 10 ? "0" : ""}${s}`;
      duration = durationStr;
    } catch (err) {
      console.error("Failed to get video file duration:", err.message);
    }
  }

  // Logic hybride : Upload vers S3/LocalStack si activé
  if (videoFile) {
    await uploadToS3(path.resolve(videoFile.path), "videos");
  }

  if (pdfFile) {
    await uploadToS3(path.resolve(pdfFile.path), "documents");
  }

  const newLesson = await Lesson.create({
    title: req.body.title,
    description: req.body.description,
    videoSource: req.body.videoSource,
    videoUrl: req.body.videoUrl,
    videoFile: videoFile?.filename,
    pdfFile: pdfFile?.filename,
    noteContent: req.body.noteContent,
    duration,
    moduleId: req.body.moduleId,
  });

  await recalcCourseDurationFromModule(req.body.moduleId);

  res.status(201).json({ data: newLesson });
});

/**
 * @desc    Update lesson
 * @route   PUT /api/v1/lessons/:id
 * @access  Private
 */
exports.updateLesson = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const videoFile = req.files?.videoFile?.[0];
  const pdfFile = req.files?.pdfFile?.[0];
  let duration = "0:00";

  // Calculate duration if we have a new video
  if (req.body.videoSource === "url" && req.body.videoUrl) {
    try {
      if (req.body.videoUrl.includes("vimeo.com")) {
        duration = await getVimeoDuration(req.body.videoUrl);
      } else {
        duration = await getYoutubeDuration(req.body.videoUrl);
      }
    } catch (err) {
      console.error("Failed to get video URL duration:", err.message);
    }
  } else if (req.body.videoSource === "upload" && req.body.videoFile) {
    try {
      const videoPath = path.resolve(videoFile.path);
      const durationSec = await getVideoDurationInSeconds(videoPath);
      const h = Math.floor(durationSec / 3600);
      const m = Math.floor((durationSec % 3600) / 60);
      const s = Math.floor(durationSec % 60);
      const durationStr =
        h > 0
          ? `${h}:${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`
          : `${m}:${s < 10 ? "0" : ""}${s}`;
      duration = durationStr;
    } catch (err) {
      console.error("Failed to get video file duration:", err.message);
    }
  }

  // Logic hybride : Upload vers S3/LocalStack si activé (Mise à jour)
  if (req.files) {
    if (req.files.videoFile) {
      const videoPath = path.join(
        process.cwd(),
        "uploads",
        "videos",
        req.files.videoFile[0].filename,
      );
      await uploadToS3(videoPath, "videos");
    }
    if (req.files.pdfFile) {
      const pdfPath = path.join(
        process.cwd(),
        "uploads",
        "documents",
        req.files.pdfFile[0].filename,
      );
      await uploadToS3(pdfPath, "documents");
    }
  }

  const lesson = await Lesson.findByIdAndUpdate(
    id,
    {
      title: req.body.title,
      description: req.body.description,
      videoSource: req.body.videoSource,
      videoUrl: req.body.videoUrl,
      videoFile: videoFile?.filename,
      pdfFile: pdfFile?.filename,
      noteContent: req.body.noteContent,
      duration,
      moduleId: req.body.moduleId,
    },
    { new: true },
  );

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
  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    return next(
      new ApiError(`No lesson found for this id ${req.params.id}`, 404),
    );
  }

  // Save moduleId before deleting the lesson
  const moduleId = lesson.moduleId;

  // 2. Delete all exercises belonging to this lesson
  await Exercise.deleteMany({
    lessonId: lesson._id,
  });

  // 3. Delete the lesson
  await Lesson.findByIdAndDelete(lesson._id);

  // 4. Recalculate course duration
  if (moduleId) {
    await recalcCourseDurationFromModule(moduleId);
  }

  // 5. Return success
  res.status(204).send();
});
