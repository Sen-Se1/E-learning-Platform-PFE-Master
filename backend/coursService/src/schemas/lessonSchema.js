const mongoose = require("mongoose");
const { getFileUrl } = require("../utils/s3Service");

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Lesson title is required"],
      trim: true,
      minlength: [3, "Lesson title must be at least 3 characters"],
      maxlength: [150, "Lesson title cannot exceed 150 characters"],
    },

    description: {
      type: String,
      required: [true, "Lesson description is required"],
      trim: true,
      minlength: [10, "Lesson description must be at least 10 characters"],
      maxlength: [1000, "Lesson description cannot exceed 1000 characters"],
    },

    videoSource: {
      type: String,
      required: [true, "Video source is required"],
      enum: {
        values: ["url", "upload"],
        message: "Video source must be either url or upload",
      },
    },

    videoUrl: {
      type: String,
      trim: true,
      default: undefined,
    },

    videoFile: {
      type: String,
      trim: true,
      default: undefined,
    },

    pdfFile: {
      type: String,
      trim: true,
      default: undefined,
    },

    noteContent: {
      type: String,
      trim: true,
      default: undefined,
    },

    duration: {
      type: String,
      default: "0:00",
    },

    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: [true, "Lesson module is required"],
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Logic for returning full URL
const setFileURL = (doc) => {
  if (doc.videoFile && !doc.videoFile.startsWith("http")) {
    doc.videoFile = getFileUrl(doc.videoFile, "videos");
  }
  if (doc.pdfFile && !doc.pdfFile.startsWith("http")) {
    doc.pdfFile = getFileUrl(doc.pdfFile, "documents");
  }
};

lessonSchema.post("init", (doc) => {
  setFileURL(doc);
});

lessonSchema.post("save", (doc) => {
  setFileURL(doc);
});

module.exports = mongoose.model("Lesson", lessonSchema);
