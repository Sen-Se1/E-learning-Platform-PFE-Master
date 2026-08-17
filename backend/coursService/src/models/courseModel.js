const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    instructorId: {
      type: mongoose.Schema.ObjectId,
      default: null
    },
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    subtitle: String,
    description: {
      type: String,
      required: [true, 'Course description is required'],
    },
    duration: String,
    rating: {
      type: Number,
      default: 0,
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
      default: 'Beginner'
    },
    tags: [String],
    price: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: String,
      default: () => new Date().toLocaleDateString()
    },
    imageCover: {
      type: String,
      default: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop'
    },
    category: {
      type: String,
      required: [true, 'Course category is required']
    },
    isArchived: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Mongoose middleware for slugifying
courseSchema.pre('save', function (next) {
  if (this.title && !this.slug) {
    this.slug = this.title
      .split(' ')
      .join('-')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '');
  }
  next();
});

module.exports = mongoose.model('Course', courseSchema);
