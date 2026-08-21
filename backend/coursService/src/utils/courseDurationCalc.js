const Course = require('../schemas/courseSchema');
const Module = require('../schemas/moduleSchema');
const Lesson = require('../schemas/lessonSchema');
const Exercise = require('../schemas/exerciseSchema');

const recalculateDuration = async (courseId) => {
  if (!courseId) return;

  try {
    const modules = await Module.find({ courseId });
    const moduleIds = modules.map(m => m._id);

    const lessons = await Lesson.find({ moduleId: { $in: moduleIds } });
    const lessonIds = lessons.map(l => l._id);

    const exercises = await Exercise.find({ lessonId: { $in: lessonIds } });

    let totalSeconds = 0;

    // Sum Lesson durations
    lessons.forEach(lesson => {
      if (lesson.duration) {
        // "HH:MM:SS" or "MM:SS"
        const parts = lesson.duration.toString().split(':').map(Number);
        if (parts.length === 3) {
          totalSeconds += (parts[0] * 3600) + (parts[1] * 60) + (isNaN(parts[2]) ? 0 : parts[2]);
        } else if (parts.length === 2) {
          totalSeconds += (parts[0] * 60) + (isNaN(parts[1]) ? 0 : parts[1]);
        } else if (parts.length === 1 && !isNaN(parts[0])) { // Maybe raw seconds or minutes
            // We assume it might have been saved as something else, ignore or handle if needed
        }
      }
    });

    // Sum Exercise durations
    exercises.forEach(ex => {
      if (ex.timeLimit) {
        totalSeconds += (ex.timeLimit * 60);
      }
    });

    // Format output
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    
    let formattedDuration = "";
    if (h > 0) {
      formattedDuration = `${h} Heures ${m} Mins`;
    } else {
      formattedDuration = `${m} Mins`;
    }

    await Course.findByIdAndUpdate(courseId, { duration: formattedDuration });
  } catch (err) {
    console.error('Error recalculating course duration:', err);
  }
};

exports.recalcCourseDurationFromCourse = async (courseId) => {
  await recalculateDuration(courseId);
};

exports.recalcCourseDurationFromModule = async (moduleId) => {
  if (!moduleId) return;
  const mod = await Module.findById(moduleId);
  if (mod && mod.courseId) {
    await recalculateDuration(mod.courseId);
  }
};

exports.recalcCourseDurationFromLesson = async (lessonId) => {
  if (!lessonId) return;
  const lesson = await Lesson.findById(lessonId);
  if (lesson && lesson.moduleId) {
    await exports.recalcCourseDurationFromModule(lesson.moduleId);
  }
};
