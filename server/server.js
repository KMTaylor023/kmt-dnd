const http = require('http');
const fs = require('fs');
const url = require('url');
const fileHandler = require('./fileResponses.js');
const characterHandler = require('./characterResponses.js');


const port = process.env.PORT || process.env.NODE_PORT || 3000;


const characters = {};


const apiFunctions = {
  '/' : fileHandler.getIndex,
  '/bundle.js' : fileHandler.getBundle,
  '/getCharacters' : characterHandler.getCharacters,
  notFound : fileHandler.notFound(),
};


const onRequest = (request, response) => {
  const parsedURL = url.parse(request.url);
  
  if(apiFunctions[parsedURL.pathname]){
    apiFunctions[parsedURL.pathname](request, response, request.method);
  } else {
    apiFunctions.notFound(request, response);
  }
};

http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1:${port}`);

