const https = require('https');

/**
 * Fetches the duration of a Vimeo video using its ID.
 * @param {string} url - The Vimeo video URL.
 * @returns {Promise<string>} - Formatted duration (MM:SS or HH:MM:SS)
 */
exports.getVimeoDuration = (url) => {
    return new Promise((resolve, reject) => {
        // Extract Vimeo ID (e.g., from https://vimeo.com/123456789)
        const match = url.match(/vimeo\.com\/(\d+)/);
        const videoId = match ? match[1] : null;

        if (!videoId) {
            return reject(new Error('Invalid Vimeo URL'));
        }

        // Use Vimeo's public OEmbed API to get duration
        https.get(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`, (res) => {
            let data = '';

            res.on('data', (chunk) => { data += chunk; });

            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    if (jsonData && jsonData.duration) {
                        const totalSeconds = parseInt(jsonData.duration, 10);
                        const h = Math.floor(totalSeconds / 3600);
                        const m = Math.floor((totalSeconds % 3600) / 60);
                        const s = Math.floor(totalSeconds % 60);
                        
                        let durationStr = "";
                        if (h > 0) {
                            durationStr = `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
                        } else {
                            durationStr = `${m}:${s < 10 ? '0' : ''}${s}`;
                        }
                        resolve(durationStr);
                    } else {
                        reject(new Error('Duration not found in Vimeo API'));
                    }
                } catch (e) {
                    reject(new Error('Failed to parse Vimeo API response'));
                }
            });
        }).on('error', (err) => reject(err));
    });
};
