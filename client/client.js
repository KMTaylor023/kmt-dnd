/* eslint-env browser */
/* global d3 */

let currentCharacter = '';

let totalMoneyChangeTemp = 0;

// Handles response returns, populating error if neccesary
const handleResponse = (xhr, callback) => {
  const error = document.querySelector('#errorMsg');
  console.log('status: xhr.status');
  switch (xhr.status) {
    case 400:
      error.innerHTML = `<b>Bad Request: ${xhr.response}</b>`;
      return;
    case 404:
      error.innerHTML = '<b>Not Found</b>';
      return;
    default:
      error.innerHTML = '';
      if (callback) {
        callback(xhr);
      }
      break;
  }
};

// structure for the two forms to create their post data
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
  '/endCharacterDay': (form) => {
    const madeField = form.querySelector('#madeField');
    const spentField = form.querySelector('#spentField');


    const formData = `name=${currentCharacter}&made=${madeField.value}&spent=${spentField.value}`;

    totalMoneyChangeTemp = (+madeField.value) - (+spentField.value);

    madeField.value = '';
    spentField.value = '';

    return formData;
  },
};


// shows a section and hides all others
const showSection = (name) => {
  const sections = document.querySelectorAll('.section');
  const section = document.querySelector(`#${name}`);

  for (let i = 0; i < sections.length; i++) {
    sections[i].style.display = 'none';
  }

  section.style.display = 'block';
};

// sends xhr post requests, and calls callback on success
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

// sends get requests usually
const sendOther = (method, action, callback) => {
  const xhr = new XMLHttpRequest();

  xhr.open(method, action);
  xhr.setRequestHeader('Accept', 'application/json');


  xhr.onload = () => handleResponse(xhr, callback);

  xhr.send();
};

// Loads a character from the server
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


// sets up the list of characters to show
const setupLists = (xhr) => {
  const content = JSON.parse(xhr.response);


  const newChar = document.querySelector('.newChar');
  const ul = newChar.parentElement;


  const curUpdate = +ul.getAttribute('lastModified');
  if (curUpdate > content.lastModified) {
    return;
  }

  while (ul.firstChild) {
    ul.removeChild(ul.firstChild);
  }

  ul.appendChild(newChar);

  ul.setAttribute('lastModified', content.lastModified);

  const list = content.names;

  for (let i = 0; i < list.length; i++) {
    const char = newChar.cloneNode(true);
    char.setAttribute('class', 'char');
    char.querySelector('h1').innerHTML = list[i];

    char.onclick = () => loadCharacter(list[i]);

    ul.appendChild(char);
  }
};

// shows lists by calling the getCharacterList api
const showList = () => {
  sendOther('GET', '/getCharacterList', setupLists);
  showSection('characterList');
};


// sets two of the navigations
const setNavigation = () => {
  document.querySelector('#charnav').onclick = (e) => {
    if (currentCharacter !== '') { showSection('currentCharacter'); }
    e.preventDefault();
    return false;
  };
  document.querySelector('#homenav').onclick = (e) => {
    showList();
    e.preventDefault();
    return false;
  };
};


/* +++ D3 +++ */
/* thanks for help from https://bl.ocks.org/d3noob/402dd382a51a4f6eea487f9a35566de0 */


// initalises all d3 related code, including setting up graph nav button
const initD3 = () => {
  const x = d3.scaleLinear().range([70, 500]);
  const y = d3.scaleLinear().range([500, 0]);


  const svg = d3.select('#graphSection').append('svg')
    .attr('width', 500)
    .attr('height', 500);

  d3.select('#graphnav').on('click', () => {
    if (currentCharacter === '') { return; }
    sendOther('GET', `/getLog?name=${currentCharacter}`, (xhr) => {
      const content = JSON.parse(xhr.response);

      const s = document.querySelector('svg');
      while (s.firstChild) {
        s.removeChild(s.firstChild);
      }

      svg.append('g');

      x.domain([0, content.length]);
      y.domain([0, d3.max(content, (d) => {
        if (d.made > d.spent) { return d.made; }
        return d.spent;
      })]);

      const spentline = d3.line()
        .x(d => x(d.day))
        .y(d => y(d.spent));

      const madeline = d3.line()
        .x(d => x(d.day))
        .y(d => y(d.made));

      svg.selectAll('.madepath')
        .data(content)
        .enter()
        .append('path')
        .attr('d', madeline(content))
        .classed('madepath', true)
        .classed('path', true);

      svg.selectAll('.spentpath')
        .data(content)
        .enter()
        .append('path')
        .attr('d', spentline(content))
        .classed('spentpath', true)
        .classed('path', true);

      svg.append('g')
        .call(d3.axisLeft(y))
        .attr('transform', 'translate(70,10)');

      showSection('graphSection');
    });
  });
};

/* --- D3 --- */

// Initialises most forms and buttons
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

    const moneyTotal = mun + totalMoneyChangeTemp;

    const num = +dateStuff[1];
    date.innerHTML = `${dateStuff[0]} ${num + 1}`;
    money.innerHTML = `${moneyStuff[0]} ${moneyTotal}`;
  });

  const createButton = document.querySelector('.newChar');


  createButton.onclick = () => {
    showSection('createNew');
  };

  characterForm.addEventListener('submit', addCharacter);
  endDayForm.addEventListener('submit', endDay);

  setNavigation();

  showList();

  initD3();
};

window.onload = init;
