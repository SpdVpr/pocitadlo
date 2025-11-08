const https = require('https');
const fs = require('fs');
const path = require('path');

const fonts = [
  {
    url: 'https://raw.githubusercontent.com/googlefonts/roboto-2/main/src/hinted/Roboto-Regular.ttf',
    output: path.join(__dirname, '../public/fonts/Roboto-Regular.ttf')
  },
  {
    url: 'https://raw.githubusercontent.com/googlefonts/roboto-2/main/src/hinted/Roboto-Bold.ttf',
    output: path.join(__dirname, '../public/fonts/Roboto-Bold.ttf')
  }
];

function follow(url, outputPath) {
  https.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0'
    }
  }, (response) => {
    if (response.statusCode === 302 || response.statusCode === 301) {
      follow(response.headers.location, outputPath);
    } else {
      const fileStream = fs.createWriteStream(outputPath);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        console.log('Font downloaded successfully to:', outputPath);
      });
    }
  }).on('error', (err) => {
    console.error('Error downloading font:', err.message);
  });
}

fonts.forEach(font => follow(font.url, font.output));
