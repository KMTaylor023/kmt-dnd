const parseJSON = (xhr, content) => {
  
  console.log(xhr);
  const obj = JSON.parse(xhr.response);
  if(obj.id){
    content.innerHTML = `<b>${obj.id}</b>`
  }
  if(obj.msg) {
    const p = document.createElement('p');
    p.textContent = obj.msg;
    content.appendChild(p);
  }
  if(obj.users) {
    const userList = document.createElement('p');
    const users = JSON.stringify(obj.users);
    userList.textContent = users;
    content.appendChild(userList);
  }
};

const handleResponse = (xhr, parseContent) => {
  const error = document.querySelector('#errorMsg');
  switch(xhr.status) {
    case 400: 
      error.innerHTML = `<b>Bad Request</b>`;
      return;
    case 404: 
      error.innerHTML = `<b>Not Found</b>`;
      return;
  }
  
  if(parseContent) {
    parseJSON(xhr, content);
  }
};

const sendPost = (e, charForm) => {
  const nameAction = charForm.getAttribute('action');
  const nameMethod = charForm.getAttribute('method');
  const nameField = charForm.querySelector('#nameField');
  const farmNameField = charForm.querySelector('#farmNameField');
  const favoriteField = charForm.querySelector('#favoriteField');
  const farmSelect = charForm.querySelector('#farmSelect');
  const genderSelect = charForm.querySelector('#genderSelect');
  const animalSelect = charForm.querySelector('#animalSelect');
  
  const xhr = new XMLHttpRequest();
  
  xhr.open(nameMethod, nameAction);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader ('Accept', 'application/json');
  xhr.onload = () => handleResponse(xhr, true);
  
  const formData = `name=${nameField.value}&farm=${farmNameField.value}`;
  fomrData = `${formData}&fav=${favoriteField.value}&type=${farmSelect.value}`;
  fomrData = `${formData}&gender=${genderSelect.value}&animal=${animalSelect.value}`;
  
  xhr.send(formData);
  
  e.preventDefault();
  return false;
};

const init = () => {
  const characterForm = document.querySelector('#characterForm');
  const addCharacter = (e) => sendPost(e, characterForm);
  
  characterForm.addEventListener('submit', addCharacter);
};

window.onload = init;
