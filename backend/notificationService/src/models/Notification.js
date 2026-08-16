const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipientType: {
      type: String,
      enum: ["USER", "TEACHER", "ADMIN", "ALL"],
      required: true
    },

    recipientId: {
      type: String,
      default: null
    },

    title: {
      type: String,
      required: true
    },

    message: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: [
        "ENROLLMENT",
        "COURSE_UPDATE",
        "METRICS_ALERT",
        "SYSTEM",
        "SECURITY"
      ],
      default: "SYSTEM"
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM"
    },

    metadata: {
      type: Object,
      default: {}
    },

    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Notification", notificationSchema);