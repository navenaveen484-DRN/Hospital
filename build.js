const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const targets = ['dist', 'public'];

const itemsToCopy = ['index.html', 'favicon.ico', 'css', 'js', 'assets'];

for (const target of targets) {
  const targetDir = path.join(rootDir, target);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  for (const item of itemsToCopy) {
    const src = path.join(rootDir, item);
    const dest = path.join(targetDir, item);
    if (fs.existsSync(src)) {
      fs.cpSync(src, dest, { recursive: true });
    }
  }
}

console.log('Build completed successfully. Generated dist/ and public/ static bundles.');
