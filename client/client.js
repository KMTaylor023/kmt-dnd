/* eslint-env browser */

let currentCharacter = '';

let totalMoneyChangeTemp = 0;

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
  '/addCharacter': (form) =>{
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
  '/endCharacterDay': (form) =>{
    const madeField = form.querySelector('#madeField');
    const spentField = form.querySelector('#spentField');
    
    
    let formData = `name=${currentCharacter}&made=${madeField.value}&spent=${spentField.value}`;
    
    totalMoneyChangeTemp = (+madeField.value) - (+spentField.value);
    
    madeField.value = "";
    spentField.value = "";
    
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
    
    currentCharacter = content.name;
    
    showSection('currentCharacter');

    const currentChar = document.querySelector('#currentCharacter');
    currentChar.querySelector('#characterName').innerHTML = `Name: ${content.name}`;
    currentChar.querySelector('#currentDate').innerHTML = `Day: ${content.day}`;
    currentChar.querySelector('#characterFarmName').innerHTML = `Farm: ${content.farm}`;
    currentChar.querySelector('#characterFavoriteThing').innerHTML = `Favorite Thing: ${content.fav}`;
    currentChar.querySelector('#characterSex').innerHTML = `Sex: ${content.sex}`;
    currentChar.querySelector('#characterPetType').innerHTML = `Pet Type: ${content.petType}`;
    currentChar.querySelector('#characterMoney').innerHTML = `Money: ${content.money}`;
  });
};

const setupLists = (xhr) => {
  const content = JSON.parse(xhr.response);
  

  const newChar = document.querySelector('#newChar');
  const ul = newChar.parentElement;
  
  
  const curUpdate = +ul.getAttribute('lastModified');
  if(curUpdate > content.lastModified){
    return;
  }
  
  while(ul.firstChild){
    ul.removeChild(ul.firstChild)
  }
  
  ul.appendChild(newChar);

  ul.setAttribute('lastModified', content.lastModified);

  const list = content.names;

  for (let i = 0; i < list.length; i++) {
    const char = newChar.cloneNode(true);
    char.querySelector('h1').innerHTML = list[i];
    
    char.onclick = () => loadCharacter(list[i]);

    ul.appendChild(char);
  }
};

const showList = () => {
  sendOther('GET', '/getCharacterList', setupLists);
  showSection('characterList');
};

const navButton = (e,section) =>{
  showSection(section);
  
  e.preventDefault();
  return false;
};

const setNavigation = () =>{
  let navas = document.querySelectorAll('.nava');
  for(let i = 0; i < navas.length; i++){
    switch(navas[i].innerHTML){
      case 'Character':
        navas[i].onclick = (e) =>navButton(e,'currentCharacter');
        break;
      default:
        navas[i].onclick = (e) =>{
          showList()
          e.preventDefault();
          return false;
        };
        break;
    }
  }
};

const init = () => {
  const characterForm = document.querySelector('#characterForm');
  const addCharacter = e => sendPost(e, characterForm, () => {
    loadCharacter(e.target.querySelector('#nameField').value);
  });

  const endDayForm = document.querySelector('#dayForm');
  const endDay = e => sendPost(e, endDayForm, () => {
    const date = document.querySelector('#currentDate');
    const money = document.querySelector('#characterMoney');
    
    const dateStuff = date.innerHTML.split(' ');
    const moneyStuff = money.innerHTML.split(' ');
    
    const mun = +moneyStuff[1];
    
    let moneyTotal = mun + totalMoneyChangeTemp;
    
    const num = +dateStuff[1];
    date.innerHTML = `${dateStuff[0]} ${num + 1}`;
    money.innerHTML = `${moneyStuff[0]} ${moneyTotal}`;
  });
  
  const createButton = document.querySelector('#newChar');


  createButton.onclick = () => {
    showSection('createNew');
  };

  characterForm.addEventListener('submit', addCharacter);
  endDayForm.addEventListener('submit', endDay);
  
  setNavigation();
  
  showList();
};

window.onload = init;
