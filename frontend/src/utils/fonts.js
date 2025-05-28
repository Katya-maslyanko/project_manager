const fs = require('fs');

function ttfToBase64(filePath) {
  const file = fs.readFileSync(filePath);
  return 'data:font/truetype;base64,' + file.toString('base64');
}

const regularBase64 = ttfToBase64('./NotoSerif-Regular.ttf');
const boldBase64 = ttfToBase64('./NotoSerif-Bold.ttf');

fs.writeFileSync('fontsBase64.js', `
export const notoSerifBase64 = '${regularBase64}';
export const notoSerifBoldBase64 = '${boldBase64}';
`);

console.log('Base64 strings generated and saved to fontsBase64.js');