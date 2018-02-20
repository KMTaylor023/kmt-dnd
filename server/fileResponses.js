const http = require('http');
const fs = require('fs');


const index = fs.readFileSync(`${__dirname}/../hosted/index.html`);
const bundle = fs.readFileSync(`${__dirname}/../hosted/bundle.js`);

const sendResponse = (request, response, content, type, code){
  response.writeHead(code, { 'Content-Type': type });
  response.write(content);
  response.end();
}

const getIndex = (request, response) =>{
  sendResponse(request, response, index, 'text/html', 200);
};

const getBundle = (request, response) =>{
  sendResponse(request, response, bundle, 'application/json', 200);
};

const getBundle = (request, response) =>{
  sendResponse(request, response, "<p>file not found</p>", 'text/html', 404);
};

module.exports = {
  getIndex,
  getBundle,
  notFound,
}