const fs = require('fs');
const path = require('path');

const regularPath = path.join(__dirname, '../public/fonts/Roboto-Regular.ttf');
const boldPath = path.join(__dirname, '../public/fonts/Roboto-Bold.ttf');
const outputPath = path.join(__dirname, '../lib/roboto-font.ts');

const regularBuffer = fs.readFileSync(regularPath);
const boldBuffer = fs.readFileSync(boldPath);

const regularBase64 = regularBuffer.toString('base64');
const boldBase64 = boldBuffer.toString('base64');

const content = `export const robotoRegularBase64 = '${regularBase64}';

export const robotoBoldBase64 = '${boldBase64}';
`;

fs.writeFileSync(outputPath, content);
console.log('Fonts converted successfully to lib/roboto-font.ts');
