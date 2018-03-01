// I believe this file is rather self explanatory

const fs = require('fs');
const responder = require('./responder.js');


const index = fs.readFileSync(`${__dirname}/../hosted/index.html`);
const bundle = fs.readFileSync(`${__dirname}/../hosted/bundle.js`);
const css = fs.readFileSync(`${__dirname}/../hosted/style.css`);

const getIndex = (request, response) => responder.sendResponse(request, response, index, 'text/html', 200);

const getIndexMeta = (request, response) => responder.sendResponseMeta(request, response, 'text/html', 200);

const getStyle = (request, response) => responder.sendResponse(request, response, css, 'text/css', 200);

const getStyleMeta = (request, response) => responder.sendResponseMeta(request, response, 'text/css', 200);

const getBundle = (request, response) => responder.sendResponse(request, response, bundle, 'application/json', 200);

const getBundleMeta = (request, response) => responder.sendResponseMeta(request, response, 'application/json', 200);

const notFound = (request, response) => responder.sendResponse(request, response, '<p>file not found</p>', 'text/html', 404);

const notFoundMeta = (request, response) => responder.sendResponseMeta(request, response, 'text/html', 404);

module.exports = {
  getIndex,
  getStyle,
  getBundle,
  notFound,
  getIndexMeta,
  getStyleMeta,
  getBundleMeta,
  notFoundMeta,
};
