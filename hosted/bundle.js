'use strict';

/* eslint-env browser */

var handleResponse = function handleResponse(xhr, callback) {
  var error = document.querySelector('#errorMsg');
  switch (xhr.status) {
    case 400:
      error.innerHTML = '<b>Bad Request</b>';
      return;
    case 404:
      error.innerHTML = '<b>Not Found</b>';
      return;
    default:
      if (callback) {
        callback(xhr);
      }
      break;
  }
};

var getFormData = {
  '/addCharacter': function addCharacter(form) {
    var nameField = form.querySelector('#nameField');
    var farmNameField = form.querySelector('#farmNameField');
    var favoriteField = form.querySelector('#favoriteField');
    var farmSelect = form.querySelector('#farmSelect');
    var genderSelect = form.querySelector('#genderSelect');
    var animalSelect = form.querySelector('#animalSelect');

    var formData = 'name=' + nameField.value + '&farm=' + farmNameField.value;
    formData = formData + '&fav=' + favoriteField.value + '&type=' + farmSelect.value;
    formData = formData + '&sex=' + genderSelect.value + '&pet=' + animalSelect.value;

    return formData;
  }
};

// TODO: one xhr for all sends, gets heads etc

var showSection = function showSection(name) {
  var sections = document.querySelectorAll('.section');
  var section = document.querySelector('#' + name);

  for (var i = 0; i < sections.length; i++) {
    sections[i].style.display = 'none';
  }

  section.style.display = 'block';
};

var sendPost = function sendPost(e, form, callback) {
  var action = form.getAttribute('action');
  var method = form.getAttribute('method');

  var xhr = new XMLHttpRequest();

  xhr.open(method, action);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.onload = function () {
    return handleResponse(xhr, callback);
  };

  var formData = getFormData[action](form);

  xhr.send(formData);

  e.preventDefault();
  return false;
};

var sendOther = function sendOther(method, action, callback) {
  var xhr = new XMLHttpRequest();

  xhr.open(method, action);
  xhr.setRequestHeader('Accept', 'application/json');

  xhr.onload = function () {
    return handleResponse(xhr, callback);
  };

  xhr.send();
};

var loadCharacter = function loadCharacter(name) {
  sendOther('GET', '/getCharacter?name=' + name, function (xhr) {
    var content = JSON.parse(xhr.response);

    showSection('currentCharacter');

    var currentCharacter = document.querySelector('#currentCharacter');
    currentCharacter.querySelector('#characterName').innerHTML = 'Name: ' + content.name;
    currentCharacter.querySelector('#currentDate').innerHTML = 'Day: ' + content.day;
    currentCharacter.querySelector('#characterFarmName').innerHTML = 'Farm: ' + content.farm;
    currentCharacter.querySelector('#characterFavoriteThing').innerHTML = 'Favorite Thing: ' + content.fav;
    currentCharacter.querySelector('#characterSex').innerHTML = 'Sex: ' + content.sex;
    currentCharacter.querySelector('#characterPetType').innerHTML = 'Pet Type: ' + content.petType;
    currentCharacter.querySelector('#characterMoney').innerHTML = 'Money: ' + content.money;
  });
};

var setupLists = function setupLists(xhr) {
  var content = JSON.parse(xhr.response);

  var s = document.querySelector('#listSelect');
  if (s) {
    s.parentNode.removeChild(s);
  }

  var select = document.createElement('select');
  select.id = 'listSelect';
  select.setAttribute('lastModified', content.lastModified);

  var list = content.names;
  list.unshift('');

  console.dir(content.names);

  for (var i = 0; i < list.length; i++) {
    console.log(list[i]);
    var option = document.createElement('option');
    option.setAttribute('value', list[i]);
    option.innerHTML = list[i];

    select.appendChild(option);
  }

  select.onchange = function (e) {
    if (e.target.value) {
      loadCharacter(e.target.value);
    }
  };

  document.querySelector('#characterList').appendChild(select);
};

var showList = function showList() {
  sendOther('GET', '/getCharacterList', setupLists);
  showSection('characterList');
};

var init = function init() {
  var characterForm = document.querySelector('#characterForm');
  var addCharacter = function addCharacter(e) {
    return sendPost(e, characterForm, function () {
      loadCharacter(e.target.querySelector('#nameField').value);
    });
  };

  // const endDayForm = document.querySelector('#dayForm');
  // const endDay = e => sendPost(e, endDayForm);

  var listButton = document.querySelector('#viewListButton');
  var createButton = document.querySelector('#beginCreateButton');

  createButton.onclick = function () {
    showSection('createNew');
  };

  listButton.onclick = showList;

  characterForm.addEventListener('submit', addCharacter);
};

window.onload = init;
