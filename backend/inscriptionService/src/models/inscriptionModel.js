const mongoose = require('mongoose');

const inscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'User ID is required'],
    },
    courseId: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'Course ID is required'],
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active',
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    price: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    paymentIntentId: String,
    sessionId: String,
  },
  { timestamps: true }
);

// Ensure a user can only have one active enrollment per course
inscriptionSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Inscription', inscriptionSchema);
