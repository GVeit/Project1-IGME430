const fs = require('fs'); // pull in the file system module
const path = require('path');
const css = fs.readFileSync(`${__dirname}/client/style.css`);
const index = fs.readFileSync(`${__dirname}/client/client.html`);
//const logo = fs.readFileSync(`${__dirname}/client/eclipseLogo.png`);

function loadFile(request, response, url, fileType) {
  const file = path.resolve(__dirname, url);

  fs.stat(file, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        response.writeHead(404);
      }
      return response.end(err);
    }

    let { range } = request.headers;

    if (!range) {
      range = 'bytes=0-';
    }

    const positions = range.replace(/bytes=/, '').split('-');

    let start = parseInt(positions[0], 10);

    const total = stats.size;
    const end = positions[1] ? parseInt(positions[1], 10) : total - 1;

    if (start > end) {
      start = end - 1;
    }

    const chunksize = (end - start) + 1;

    response.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': fileType,
    });

    const stream = fs.createReadStream(file, { start, end });

    stream.on('open', () => {
      stream.pipe(response);
    });

    stream.on('error', (streamErr) => {
      response.end(streamErr);
    });

    return stream;
  });
}


const getIndex = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

const getCSS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(css);
  response.end();
};

const getLogo = (request, response) => {
  //response.writeHead(200, { 'Content-Type': 'image/png' });
 // response.write(logo);
//  response.end();
  loadFile(request, response, 'client/eclipseLogo.png', 'image/png');
};

module.exports = {
    getIndex,
    getCSS,
    getLogo
};
