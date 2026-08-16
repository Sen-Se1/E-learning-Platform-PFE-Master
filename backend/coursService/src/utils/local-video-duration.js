const { exec } = require('child_process');
// Utilise la commande 'ffprobe' du système (installée via apk dans le Dockerfile)
const ffprobeCommand = 'ffprobe';

/**
 * Get video duration in seconds using ffprobe-static
 * @param {string} videoPath - Absolute path to the video file
 * @returns {Promise<number>} - Duration in seconds
 */
exports.getVideoDurationInSeconds = (videoPath) => {
  return new Promise((resolve, reject) => {
    const command = `${ffprobeCommand} -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      if (stderr) {
        console.warn('ffprobe stderr:', stderr);
      }
      const duration = parseFloat(stdout.trim());
      if (isNaN(duration)) {
        return reject(new Error('Could not parse video duration'));
      }
      resolve(duration);
    });
  });
};
