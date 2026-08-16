const https = require('https');

exports.getYoutubeDuration = (url) => {
    return new Promise((resolve, reject) => {
        let videoId = '';
        if (url.includes('v=')) {
            videoId = url.split('v=')[1].split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        }

        if (!videoId) {
            return reject(new Error('Invalid YouTube URL'));
        }

        const req = https.get(`https://www.youtube.com/watch?v=${videoId}`, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                // Look for "lengthSeconds":"XXX"
                const match = data.match(/"lengthSeconds":"(\d+)"/);
                if (match && match[1]) {
                    const totalSeconds = parseInt(match[1], 10);
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
                    reject(new Error('Duration not found in the page'));
                }
            });
        });

        req.on('error', (err) => reject(err));
    });
};
