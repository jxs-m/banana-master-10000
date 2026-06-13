const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/i);
if (scriptMatch) {
  fs.writeFileSync('script_only.js', scriptMatch[1]);
  console.log("Extracted script");
}
