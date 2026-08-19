const mongoose = require("mongoose");
const Course = require("./courseModel");

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Review title is required"],
      trim: true,
      minlength: [3, "Review title must be at least 3 characters"],
      maxlength: [200, "Review title cannot exceed 200 characters"],
    },

    ratings: {
      type: Number,
      required: [true, "Review rating is required"],
      min: [1, "Min rating value is 1"],
      max: [5, "Max rating value is 5"],
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Review must belong to a user"],
      index: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Review must belong to a course"],
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

reviewSchema.index({ userId: 1, courseId: 1 }, { unique: true });

reviewSchema.statics.calcAverageRatingsAndQuantity = async function (courseId) {
  const result = await this.aggregate([
    {
      $match: {
        courseId: new mongoose.Types.ObjectId(courseId),
      },
    },

    {
      $group: {
        _id: "$courseId",

        ratingsAverage: {
          $avg: "$ratings",
        },

        ratingsQuantity: {
          $sum: 1,
        },
      },
    },
  ]);

  if (result.length > 0) {
    const average = Number(result[0].ratingsAverage.toFixed(1));

    await Course.findByIdAndUpdate(
      courseId,
      {
        ratingsAverage: average,
        ratingsQuantity: result[0].ratingsQuantity,
      },
      {
        new: true,
        runValidators: true,
      },
    );
  } else {
    await Course.findByIdAndUpdate(
      courseId,
      {
        ratingsAverage: 0,
        ratingsQuantity: 0,
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }
};

reviewSchema.post("save", async function () {
  await this.constructor.calcAverageRatingsAndQuantity(this.courseId);
});

reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRatingsAndQuantity(doc.courseId);
  }
});

reviewSchema.post(
  "deleteOne",
  {
    document: true,
    query: false,
  },
  async function () {
    if (this.courseId) {
      await this.constructor.calcAverageRatingsAndQuantity(this.courseId);
    }
  },
);

reviewSchema.post("findOneAndUpdate", async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRatingsAndQuantity(doc.courseId);
  }
});

module.exports = mongoose.model("Review", reviewSchema);
