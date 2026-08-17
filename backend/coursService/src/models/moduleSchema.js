const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: {
    type: String,
    minlength: 10
  },
  courseId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course'
  },

}, { timestamps: true });

module.exports = mongoose.model('Module', moduleSchema);
