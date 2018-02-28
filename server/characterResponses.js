const responder = require('./responder.js');

const FARM_TYPES = ['Standard', 'Riverland', 'Forest', 'Hill Top', 'Wilderness'];
const START_MONEY = 500;
const MAX_MONEY = 99999999;

const characters = {};

const characterLogs = {};

let charactersLastModified = 0;

const updateTime = (time) => {
  charactersLastModified = time;
};

const badRequest = (request, response, msg) => {
  responder.respondJsonFromString(request, response, msg, 'badRequest', 400);
};

const endCharacterDay = (request, response, body) => {
  let msg = 'name, made, and spent are required params';
  if (!body.name || !body.spent || !body.made) {
    return badRequest(request, response, msg);
  }

  msg = `no character with name ${body.name}`;
  if (!characters[body.name]) {
    return badRequest(request, response, msg);
  }

  msg = `made and spent must be integers from 0-${MAX_MONEY}`;
  if (!Number.isInteger(+body.spent) || +body.spent < 0 || +body.spent >= MAX_MONEY
      || !Number.isInteger(+body.made) || +body.made < 0 || +body.made >= MAX_MONEY) {
    return badRequest(request, response, msg);
  }
  
  const character = characters[body.name];
  const moneyLog = characterLogs[body.name].money;

  moneyLog[character.day] = { made: +body.made, spent: +body.spent };

  character.day++;
  character.money += (+body.made - +body.spent);
  character.lastModified = new Date().getTime();

  if (character.money < 0) { character.money = 0; }
  if (character.money > MAX_MONEY) { character.money = MAX_MONEY; }

  updateTime(character.lastModified);

  return responder.sendResponseMeta(request, response,'application/json', 204);
};

const getCharacter = (request, response, query) => {
  if (!query.name) { return badRequest(request, response, 'mssing name query parameter'); }

  if (!characters[query.name]) { return badRequest(request, response, `No Character with name '${query.name}'`); }

  return responder.respondJson(request, response, characters[query.name], 200);
};

const addCharacter = (request, response, body) => {
  let msg = 'name, farm, fav, type, sex, and pet are required params';
  if (!body.name || !body.farm || !body.fav || !body.type
      || !body.sex || !body.pet) {
    badRequest(request, response, msg);
  }

  msg = `valid options: type[0-${FARM_TYPES.length - 1}], sex[m,f], pet[c,d]`;
  if (!Number.isInteger(+body.type) || !FARM_TYPES[+body.type] || (body.sex !== 'm'
      && body.sex !== 'f') || (body.pet !== 'c' && body.pet !== 'd')) {
    badRequest(request, response, msg);
  }

  msg = `character with name ${body.name} already exists. use update instead`;
  if (characters[body.name]) {
    badRequest(request, response, msg);
  }

  const character = {};

  character.name = body.name;
  character.farmType = FARM_TYPES[+body.type];
  character.fav = body.fav;
  character.farm = body.farm;
  character.sex = body.sex;
  character.petType = body.pet;
  character.money = START_MONEY;
  character.day = 1;
  character.lastModified = new Date().getTime();

  // character.notes = {}; maybe later

  characters[character.name] = character;
  characterLogs[character.name] = { money: [{ spent: 0, made: START_MONEY }] };

  updateTime(character.lastModified);

  return responder.sendResponseMeta(request, response, 'application/json', 201);
};

const getCharacterList = (request, response) => {
  const chars = Object.keys(characters);
  const json = { names: chars, lastModified: charactersLastModified };
  return responder.respondJson(request, response, json, 200);
};

const getCharacterListMeta = (request, response) => responder.sendResponseMeta(
  request,
  response,
  'application/json',
  200,
  charactersLastModified
);

module.exports = {
  addCharacter,
  getCharacter,
  getCharacterList,
  getCharacterListMeta,
  endCharacterDay,
};
