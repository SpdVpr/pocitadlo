import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fontUrl = 'https://github.com/google/fonts/raw/refs/heads/main/apache/roboto/static/Roboto-Regular.ttf';
const outputPath = path.join(__dirname, '../public/fonts/Roboto-Regular.ttf');

https.get(fontUrl, (response) => {
  if (response.statusCode === 302 || response.statusCode === 301) {
    https.get(response.headers.location, (redirectResponse) => {
      const fileStream = fs.createWriteStream(outputPath);
      redirectResponse.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        console.log('Font downloaded successfully!');
      });
    });
  } else {
    const fileStream = fs.createWriteStream(outputPath);
    response.pipe(fileStream);
    fileStream.on('finish', () => {
      fileStream.close();
      console.log('Font downloaded successfully!');
    });
  }
}).on('error', (err) => {
  console.error('Error downloading font:', err.message);
});
