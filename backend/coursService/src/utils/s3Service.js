const { S3Client, PutObjectCommand, DeleteObjectCommand, HeadBucketCommand, CreateBucketCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// Configuration du client S3 pour LocalStack ou AWS
const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT || 'http://localhost:4566',
  forcePathStyle: true, // Requis pour LocalStack
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || 'test',
    secretAccessKey: process.env.S3_SECRET_KEY || 'test',
  },
});

const bucketName = process.env.S3_BUCKET_NAME || 'elearning-platform';

/**
 * Vérifie si le bucket existe, sinon le crée (Utile pour LocalStack)
 */
const ensureBucketExists = async () => {
  if (process.env.STORAGE_TYPE !== 's3') return;
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
  } catch (error) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      console.log(`[S3] Création du bucket : ${bucketName}`);
      await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
    }
  }
};

/**
 * Upload un fichier vers S3
 * @param {string} localFilePath - Chemin complet du fichier sur le disque
 * @param {string} folder - Dossier de destination dans S3 (ex: 'videos')
 * @returns {Promise<string|null>} - Retourne la clé du fichier ou null
 */
exports.uploadToS3 = async (localFilePath, folder = '') => {
  if (process.env.STORAGE_TYPE !== 's3') return null;

  try {
    await ensureBucketExists();
    const fileName = path.basename(localFilePath);
    const fileStream = fs.createReadStream(localFilePath);
    const key = folder ? `${folder}/${fileName}` : fileName;

    const uploadParams = {
      Bucket: bucketName,
      Key: key,
      Body: fileStream,
      ACL: 'public-read', // Optionnel selon votre config
    };

    await s3Client.send(new PutObjectCommand(uploadParams));
    console.log(`[S3] Fichier uploadé avec succès : ${key}`);
    return key;
  } catch (error) {
    console.error('[S3] Erreur lors de l\'upload :', error.message);
    return null;
  }
};

/**
 * Supprime un fichier de S3
 * @param {string} fileName - Nom du fichier ou clé complète
 * @param {string} folder - Dossier dans S3
 */
exports.deleteFromS3 = async (fileName, folder = '') => {
  if (process.env.STORAGE_TYPE !== 's3') return;

  try {
    const key = folder && !fileName.includes('/') ? `${folder}/${fileName}` : fileName;
    await s3Client.send(new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    }));
    console.log(`[S3] Fichier supprimé : ${key}`);
  } catch (error) {
    console.error('[S3] Erreur lors de la suppression S3 :', error.message);
  }
};

/**
 * Génère l'URL d'un fichier
 */
exports.getFileUrl = (fileName, folder = '') => {
  if (process.env.STORAGE_TYPE === 's3') {
    const key = folder && !fileName.includes('/') ? `${folder}/${fileName}` : fileName;
    return `${process.env.S3_ENDPOINT || 'http://localhost:4566'}/${bucketName}/${key}`;
  }
  // Retour local (votre logique actuelle)
  return `/uploads/${folder}/${fileName}`;
};
