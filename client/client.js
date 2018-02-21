/* eslint-env browser */

const handleResponse = (xhr, callback) => {
  const error = document.querySelector('#errorMsg');
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

const getFormData = {
  '/addCharacter': (form) => {
    const nameField = form.querySelector('#nameField');
    const farmNameField = form.querySelector('#farmNameField');
    const favoriteField = form.querySelector('#favoriteField');
    const farmSelect = form.querySelector('#farmSelect');
    const genderSelect = form.querySelector('#genderSelect');
    const animalSelect = form.querySelector('#animalSelect');

    let formData = `name=${nameField.value}&farm=${farmNameField.value}`;
    formData = `${formData}&fav=${favoriteField.value}&type=${farmSelect.value}`;
    formData = `${formData}&sex=${genderSelect.value}&pet=${animalSelect.value}`;

    return formData;
  },
};

// TODO: one xhr for all sends, gets heads etc

const showSection = (name) => {
  const sections = document.querySelectorAll('.section');
  const section = document.querySelector(`#${name}`);

  for (let i = 0; i < sections.length; i++) {
    sections[i].style.display = 'none';
  }

  section.style.display = 'block';
};

const sendPost = (e, form, callback) => {
  const action = form.getAttribute('action');
  const method = form.getAttribute('method');

  const xhr = new XMLHttpRequest();

  xhr.open(method, action);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.onload = () => handleResponse(xhr, callback);

  const formData = getFormData[action](form);

  xhr.send(formData);

  e.preventDefault();
  return false;
};

const sendOther = (method, action, callback) => {
  const xhr = new XMLHttpRequest();

  xhr.open(method, action);
  xhr.setRequestHeader('Accept', 'application/json');


  xhr.onload = () => handleResponse(xhr, callback);

  xhr.send();
};

const loadCharacter = (name) => {
  sendOther('GET', `/getCharacter?name=${name}`, (xhr) => {
    const content = JSON.parse(xhr.response);

    showSection('currentCharacter');

    const currentCharacter = document.querySelector('#currentCharacter');
    currentCharacter.querySelector('#characterName').innerHTML = `Name: ${content.name}`;
    currentCharacter.querySelector('#currentDate').innerHTML = `Day: ${content.day}`;
    currentCharacter.querySelector('#characterFarmName').innerHTML = `Farm: ${content.farm}`;
    currentCharacter.querySelector('#characterFavoriteThing').innerHTML = `Favorite Thing: ${content.fav}`;
    currentCharacter.querySelector('#characterSex').innerHTML = `Sex: ${content.sex}`;
    currentCharacter.querySelector('#characterPetType').innerHTML = `Pet Type: ${content.petType}`;
    currentCharacter.querySelector('#characterMoney').innerHTML = `Money: ${content.money}`;
  });
};

const setupLists = (xhr) => {
  const content = JSON.parse(xhr.response);


  const s = document.querySelector('#listSelect');
  if (s) {
    s.parentNode.removeChild(s);
  }

  const select = document.createElement('select');
  select.id = 'listSelect';
  select.setAttribute('lastModified', content.lastModified);

  const list = content.names;
  list.unshift('');

  console.dir(content.names);

  for (let i = 0; i < list.length; i++) {
    console.log(list[i]);
    const option = document.createElement('option');
    option.setAttribute('value', list[i]);
    option.innerHTML = list[i];

    select.appendChild(option);
  }

  select.onchange = (e) => {
    if (e.target.value) { loadCharacter(e.target.value); }
  };

  document.querySelector('#characterList').appendChild(select);
};

const showList = () => {
  sendOther('GET', '/getCharacterList', setupLists);
  showSection('characterList');
};

const init = () => {
  const characterForm = document.querySelector('#characterForm');
  const addCharacter = e => sendPost(e, characterForm, () => {
    loadCharacter(e.target.querySelector('#nameField').value);
  });

  // const endDayForm = document.querySelector('#dayForm');
  // const endDay = e => sendPost(e, endDayForm);

  const listButton = document.querySelector('#viewListButton');
  const createButton = document.querySelector('#beginCreateButton');


  createButton.onclick = () => {
    showSection('createNew');
  };

  listButton.onclick = showList;

  characterForm.addEventListener('submit', addCharacter);
};

window.onload = init;
