const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Module title is required"],
      trim: true,
      minlength: [3, "Module title must be at least 3 characters"],
      maxlength: [100, "Module title cannot exceed 100 characters"],
    },

    description: {
      type: String,
      trim: true,
      minlength: [10, "Module description must be at least 10 characters"],
      maxlength: [500, "Module description cannot exceed 500 characters"],
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Module course is required"],
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model("Module", moduleSchema);
