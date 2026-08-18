const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

function downloadFile(url, dest) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close(() => resolve(true));
        });
      } else {
        file.close(() => {
          if (fs.existsSync(dest)) fs.unlinkSync(dest);
          resolve(false);
        });
      }
    }).on('error', () => {
      file.close(() => {
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        resolve(false);
      });
    });
  });
}

async function testImages() {
  const assetsDir = path.join(__dirname, 'assets');
  const postersDir = path.join(assetsDir, 'posters');
  const heroDir = path.join(assetsDir, 'hero');

  if (!fs.existsSync(postersDir)) fs.mkdirSync(postersDir, { recursive: true });
  if (!fs.existsSync(heroDir)) fs.mkdirSync(heroDir, { recursive: true });

  console.log('Testing image downloads...');
}

testImages();
