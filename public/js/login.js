import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Your loged in successfully!');
      window.setInterval(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async (email, password) => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    if (res.data.status === 'success') location.assign('/');
    showAlert('success', 'Your now successfully loged out!');
  } catch (err) {
    showAlert('error', 'Error logging out! Try again');
  }
};

export const signup = async (name, email, password, passwordConfrim) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfrim,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Your signed in successfully!');
      window.setInterval(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
