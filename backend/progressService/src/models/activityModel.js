const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  actionType: {
    type: String, // 'lesson', 'exercise', 'badge'
    required: true
  },
  itemId: {
    type: String,
    required: true
  },
  title: String,
  courseTitle: String,
  courseId: String
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
