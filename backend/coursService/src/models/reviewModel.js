const mongoose = require('mongoose');
const Course = require('./courseModel');

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    ratings: {
      type: Number,
      min: [1, 'Min rating value is 1.0'],
      max: [5, 'Max rating value is 5.0'],
      required: [true, 'review ratings required'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'Review must belong to user'],
    },
    course: {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
      required: [true, 'Review must belong to a course'],
    },
  },
  { timestamps: true }
);

// Static method to calculate average ratings
reviewSchema.statics.calcAverageRatingsAndQuantity = async function (courseId) {
  const result = await this.aggregate([
    {
      $match: { course: courseId },
    },
    {
      $group: {
        _id: '$course',
        ratingsAverage: { $avg: '$ratings' },
        ratingsQuantity: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await Course.findByIdAndUpdate(courseId, {
      rating: result[0].ratingsAverage.toFixed(1),
      ratingsQuantity: result[0].ratingsQuantity,
      reviewsCount: result[0].ratingsQuantity,
    });
  } else {
    await Course.findByIdAndUpdate(courseId, {
      rating: 0,
      ratingsQuantity: 0,
      reviewsCount: 0,
    });
  }
};

reviewSchema.post('save', async function () {
  await this.constructor.calcAverageRatingsAndQuantity(this.course);
});

reviewSchema.post('remove', async function () {
  await this.constructor.calcAverageRatingsAndQuantity(this.course);
});

// For update and delete (findByIdAndUpdate, findByIdAndDelete)
reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRatingsAndQuantity(doc.course);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
