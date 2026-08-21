const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['coding', 'quiz', 'boolean'],
    required: true
  },
  title: { type: String, required: true },
  instructions: String,
  maxScore: { type: Number, default: 0 },
  timeLimit: Number, // in minutes

  // Coding specific
  language: String,
  initialCode: String,
  solution: String,
  assertions: String,

  // Quiz specific
  options: [
    {
      id: String,
      text: String,
      isCorrect: Boolean
    }
  ],

  // Boolean specific
  correctAnswer: Boolean,
  lessonId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Lesson',
  },

}, { timestamps: true });

module.exports = mongoose.model('Exercise', exerciseSchema);
