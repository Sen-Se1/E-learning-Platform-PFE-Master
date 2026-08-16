const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ApiError = require('../utils/apiError');

// Configuration de Multer pour uploader les fichiers dans "uploads/"
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subFolder = 'others';
    if (file.fieldname === 'imageCover') subFolder = 'images';
    else if (file.fieldname === 'videoFile') subFolder = 'videos';
    else if (file.fieldname === 'pdfFile') subFolder = 'documents';
    
    // On met tout dans le dossier uploads/ par sécurité, mais on suit votre logique de vérification
    const uploadPath = path.join("uploads", subFolder);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Ex: 1654873928.jpg
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'imageCover') {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new ApiError('Only images are allowed', 400), false);
  } else if (file.fieldname === 'videoFile') {
    if (file.mimetype.startsWith('video/')) cb(null, true);
    else cb(new ApiError('Only videos are allowed', 400), false);
  } else if (file.fieldname === 'pdfFile') {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new ApiError('Only PDF files are allowed', 400), false);
  } else {
    cb(null, true);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fieldSize: 10 * 1024 * 1024 // 10MB to allow large JSON payloads in fields like 'data'
  }
});

// Fonction d'enregistrement
exports.upload = upload; // pour l’utiliser dans les routes ou app.js

// On garde cette fonction pour ne pas casser les routes actuelles
exports.uploadMixFiles = (fields) => upload.fields(fields);

// Middleware to parse JSON inside req.body.data (common with FormData)
exports.parseJsonData = (req, res, next) => {
  if (req.body.data) {
    try {
      const parsedData = JSON.parse(req.body.data);
      Object.assign(req.body, parsedData);
    } catch (e) {
      // If parsing fails, we continue (validators will catch empty fields)
    }
  }
  next();
};
