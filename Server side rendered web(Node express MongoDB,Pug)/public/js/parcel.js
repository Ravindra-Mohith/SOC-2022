import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './mapbox';

const form = document.querySelector('.form--login');
const mapBox = document.getElementById('map');
const logOut = document.querySelector('.nav__el--logout');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (logOut) {
  logOut.addEventListener('click', logout);
}
