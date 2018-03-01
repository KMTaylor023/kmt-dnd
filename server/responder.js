// sends a response with content
const sendResponse = (request, response, content, type, code) => {
  response.writeHead(code, { 'Content-Type': type });
  response.write(content);
  response.end();
};

// sends a no content response
const sendResponseMeta = (request, response, type, code, modified, length) => {
  const headers = { 'Content-Type': type };

  if (Number.isInteger(length)) {
    headers['Content-Length'] = length;
  }
  if (Number.isInteger(modified)) {
    headers['Last-Modified'] = modified;
  }
  response.writeHead(code, headers);
  response.end();
};

// creates a json response string, with an id if provided
const createJSON = (msg, id) => {
  const json = { msg };
  if (id) {
    json.id = id;
  }

  return JSON.stringify(json);
};

// responds with a json message
const respondJson = (request, response, content, status) => {
  const msg = JSON.stringify(content);
  sendResponse(request, response, msg, 'application/json', status);
};

// responds with a json message from a string
const respondJsonFromString = (request, response, msg, id, status) => {
  const content = createJSON(msg, id);
  sendResponse(request, response, content, 'application/json', status);
};

// sends a method not allowed error
const methodNotAllowed = (request, response, method, pathname) => {
  const msg = `The ${method} method is not allowed for the path ${pathname}`;
  const content = createJSON(msg, 'MethodNotAllowed');

  respondJson(request, response, content, 405);
};

const badRequest = (request, response) => {
  response.statusCode = 400;
  response.end();
};

module.exports = {
  sendResponse,
  sendResponseMeta,
  methodNotAllowed,
  respondJson,
  respondJsonFromString,
  createJSON,
  badRequest,
};
