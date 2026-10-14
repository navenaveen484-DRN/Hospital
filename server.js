const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=UTF-8',
  '.xml': 'application/xml; charset=UTF-8',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

function handleRequest(req, res) {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (!reqPath || reqPath === '/') reqPath = '/index.html';
  
  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  
  const searchDirs = [
    __dirname,
    process.cwd(),
    path.join(__dirname, 'public'),
    path.join(process.cwd(), 'public'),
    path.join(__dirname, 'dist'),
    path.join(process.cwd(), 'dist')
  ];
  
  let foundFile = null;
  for (const dir of searchDirs) {
    const candidate = path.join(dir, safePath);
    try {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        foundFile = candidate;
        break;
      }
    } catch (e) {}
  }

  // Fallback to index.html for SPA routing if path has no file extension
  if (!foundFile && !path.extname(safePath)) {
    for (const dir of searchDirs) {
      const candidate = path.join(dir, 'index.html');
      try {
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
          foundFile = candidate;
          break;
        }
      } catch (e) {}
    }
  }

  if (!foundFile) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
    res.end('<h1>404 Not Found</h1><p>Requested resource could not be found.</p>');
    return;
  }

  const ext = path.extname(foundFile).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  const isHtml = ext === '.html';
  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': isHtml ? 'no-cache, no-store, must-revalidate' : 'public, max-age=86400',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https:; frame-ancestors 'self';"
  });

  const stream = fs.createReadStream(foundFile);
  stream.pipe(res);
}

const server = http.createServer(handleRequest);

// Export for Vercel Serverless Function
module.exports = handleRequest;

// Run standalone server when executed locally
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🏥 Healthcare Administrative Agent Platform`);
    console.log(`🚀 Server running at: http://localhost:${PORT}`);
    console.log(`✨ Open your browser and explore the autonomous agent!`);
    console.log(`======================================================\n`);
  });
}
