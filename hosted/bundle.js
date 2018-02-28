'use strict';

/* eslint-env browser */

var currentCharacter = '';

var totalMoneyChangeTemp = 0;

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
  },
  '/endCharacterDay': function endCharacterDay(form) {
    var madeField = form.querySelector('#madeField');
    var spentField = form.querySelector('#spentField');

    var formData = 'name=' + currentCharacter + '&made=' + madeField.value + '&spent=' + spentField.value;

    totalMoneyChangeTemp = +madeField.value - +spentField.value;

    madeField.value = "";
    spentField.value = "";

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

    currentCharacter = content.name;

    showSection('currentCharacter');

    var currentChar = document.querySelector('#currentCharacter');
    currentChar.querySelector('#characterName').innerHTML = 'Name: ' + content.name;
    currentChar.querySelector('#currentDate').innerHTML = 'Day: ' + content.day;
    currentChar.querySelector('#characterFarmName').innerHTML = 'Farm: ' + content.farm;
    currentChar.querySelector('#characterFavoriteThing').innerHTML = 'Favorite Thing: ' + content.fav;
    currentChar.querySelector('#characterSex').innerHTML = 'Sex: ' + content.sex;
    currentChar.querySelector('#characterPetType').innerHTML = 'Pet Type: ' + content.petType;
    currentChar.querySelector('#characterMoney').innerHTML = 'Money: ' + content.money;
  });
};

var setupLists = function setupLists(xhr) {
  var content = JSON.parse(xhr.response);

  var newChar = document.querySelector('#newChar');
  var ul = newChar.parentElement;

  var curUpdate = +ul.getAttribute('lastModified');
  if (curUpdate > content.lastModified) {
    return;
  }

  while (ul.firstChild) {
    ul.removeChild(ul.firstChild);
  }

  ul.appendChild(newChar);

  ul.setAttribute('lastModified', content.lastModified);

  var list = content.names;

  var _loop = function _loop(i) {
    var char = newChar.cloneNode(true);
    char.querySelector('h1').innerHTML = list[i];

    char.onclick = function () {
      return loadCharacter(list[i]);
    };

    ul.appendChild(char);
  };

  for (var i = 0; i < list.length; i++) {
    _loop(i);
  }
};

var showList = function showList() {
  sendOther('GET', '/getCharacterList', setupLists);
  showSection('characterList');
};

var navButton = function navButton(e, section) {
  showSection(section);

  e.preventDefault();
  return false;
};

var setNavigation = function setNavigation() {
  var navas = document.querySelectorAll('.nava');
  for (var i = 0; i < navas.length; i++) {
    switch (navas[i].innerHTML) {
      case 'Character':
        navas[i].onclick = function (e) {
          return navButton(e, 'currentCharacter');
        };
        break;
      default:
        navas[i].onclick = function (e) {
          showList();
          e.preventDefault();
          return false;
        };
        break;
    }
  }
};

var init = function init() {
  var characterForm = document.querySelector('#characterForm');
  var addCharacter = function addCharacter(e) {
    return sendPost(e, characterForm, function () {
      loadCharacter(e.target.querySelector('#nameField').value);
    });
  };

  var endDayForm = document.querySelector('#dayForm');
  var endDay = function endDay(e) {
    return sendPost(e, endDayForm, function () {
      var date = document.querySelector('#currentDate');
      var money = document.querySelector('#characterMoney');

      var dateStuff = date.innerHTML.split(' ');
      var moneyStuff = money.innerHTML.split(' ');

      var mun = +moneyStuff[1];

      var moneyTotal = mun + totalMoneyChangeTemp;

      var num = +dateStuff[1];
      date.innerHTML = dateStuff[0] + ' ' + (num + 1);
      money.innerHTML = moneyStuff[0] + ' ' + moneyTotal;
    });
  };

  var createButton = document.querySelector('#newChar');

  createButton.onclick = function () {
    showSection('createNew');
  };

  characterForm.addEventListener('submit', addCharacter);
  endDayForm.addEventListener('submit', endDay);

  setNavigation();

  showList();
};

window.onload = init;
