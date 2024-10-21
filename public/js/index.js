console.log('parcel ready');

import { login, logout, signup } from './login';
import { displyMap } from './map';
import { updateSettings } from './updateSetings';
// DOM ELEMENTS
const map = document.getElementById('map');
const loginForm = document.querySelector('.formL');
const logOutBtn = document.querySelector('.nav__el--logout');
const updateForm = document.querySelector('.form-user-data');
const passwordForm = document.querySelector('.form-user-settings');
const signupForm = document.querySelector('.form--signup');

//DElGATION

if (map) {
  const locations = JSON.parse(map.dataset.locations);
  displyMap(locations);
}

if (signupForm) {
  console.log(signup, signupForm);
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.querySelector('#name').value;
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    const passwordConfrim = document.querySelector('#passwordConfirm').value;
    console.log(name, email);
    signup(name, email, password, passwordConfrim);
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    login(email, password);
  });
}
if (updateForm) {
  updateForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.querySelector('#name').value);
    form.append('email', document.querySelector('#email').value);
    form.append('photo', document.querySelector('#photo').files[0]);
    updateSettings(form, 'data');
  });
}

if (passwordForm) {
  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const saveBtn = document.querySelector('.btn--pass');
    saveBtn.textContent = '...Updating';
    const passwordCurrent = document.querySelector('#password-current');
    const newPassword = document.querySelector('#password');
    const passwordConfrim = document.querySelector('#password-confirm');

    await updateSettings(
      {
        passwordCurrent: passwordCurrent.value,
        newPassword: newPassword.value,
        passwordConfrim: passwordConfrim.value,
      },
      'password'
    );
    passwordCurrent.value = '';
    passwordConfrim.value = '';
    newPassword.value = '';
    saveBtn.textContent = 'Save Password';
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);
