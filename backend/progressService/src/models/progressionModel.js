const mongoose = require('mongoose');

const progressionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'in_progress'
  },
  completedExercises: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  exerciseStats: [{
    exerciseId: mongoose.Schema.Types.ObjectId,
    attempts: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false }
  }],
  totalExercisesInLesson: Number
}, { timestamps: true });

// Ensure unique progression record per user per lesson
progressionSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

module.exports = mongoose.model('Progression', progressionSchema);
