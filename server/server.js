const http = require('http');
const url = require('url');
const query = require('querystring');
const fileHandler = require('./fileResponses.js');
const characterHandler = require('./characterResponses.js');
const responder = require('./responder.js');


const port = process.env.PORT || process.env.NODE_PORT || 3000;

const apiFunctions = {
  '/': {
    GET: fileHandler.getIndex,
    HEAD: fileHandler.getIndexMeta,
  },
  '/style.css': {
    GET: fileHandler.getStyle,
    HEAD: fileHandler.getStyleMeta,
  },
  '/bundle.js': {
    GET: fileHandler.getBundle,
    HEAD: fileHandler.getBundleMeta,
  },
  '/getCharacter': {
    GET: characterHandler.getCharacter,
  },
  '/getCharacterList': {
    GET: characterHandler.getCharacterList,
    HEAD: characterHandler.getCharacterListMeta,
  },
  '/addCharacter': {
    POST: characterHandler.addCharacter,
  },
  '/endCharacterDay': {
    POST: characterHandler.endCharacterDay,
  },
  notFound: {
    GET: fileHandler.notFound,
  },
};


const postRequest = (request, response, parsedURL) => {
  const body = [];

  request.on('err', () => {
    responder.badRequest(request, response);
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();

    const bodyParams = query.parse(bodyString);

    return apiFunctions[parsedURL.pathname][request.method](request, response, bodyParams);
  });
};


const onRequest = (request, response) => {
  const parsedURL = url.parse(request.url);

  if (apiFunctions[parsedURL.pathname]) {
    if (!apiFunctions[parsedURL.pathname][request.method]) {
      return responder.methodNotAllowed(request, response, parsedURL.pathname);
    }

    if (request.method === 'POST') {
      return postRequest(request, response, parsedURL);
    }
    const queryString = query.parse(parsedURL.query);
    return apiFunctions[parsedURL.pathname][request.method](request, response, queryString);
  }
  return apiFunctions.notFound.GET(request, response);
};

http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1:${port}`);

