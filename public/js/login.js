import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Your loged in successfully!');
      window.setInterval(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async (email, password) => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:3000/api/v1/users/logout',
    });
    if (res.data.status === 'success') location.assign('/');
    showAlert('success', 'Your now successfully loged out!');
  } catch (err) {
    showAlert('error', 'Error logging out! Try again');
  }
};

// export const pay = async (res, tid) => {
//   try {
//     const ress = await axios({
//       method: 'PATCH',
//       url: `http://localhost:3000/api/v1/bookings/pay/${tid}`,
//       data: {
//         paid: res === 'success',
//       },
//     });
//     console.log(ress);
//   } catch (err) {
//     console.log(err);
//   }
// };
