const mongoose = require('mongoose');
const { getFileUrl } = require('../utils/s3Service');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: {
    type: String,
    default: 'video'
  },
  duration: String,
  content: String, 
  
  videoSource: {
    type: String,
    enum: ['url', 'upload']
  },
  videoFile: String,
  videoUrl: String,
  pdfFile: String,
  noteContent: String,
  description: String,

  moduleId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Module',
  },
 
}, { timestamps: true });

// Logic for returning full URL
const setFileURL = (doc) => {
  if (doc.videoFile && !doc.videoFile.startsWith('http')) {
    doc.videoFile = getFileUrl(doc.videoFile, 'videos');
  }
  if (doc.pdfFile && !doc.pdfFile.startsWith('http')) {
    doc.pdfFile = getFileUrl(doc.pdfFile, 'documents');
  }
};

lessonSchema.post('init', (doc) => {
  setFileURL(doc);
});

lessonSchema.post('save', (doc) => {
  setFileURL(doc);
});

module.exports = mongoose.model('Lesson', lessonSchema);
