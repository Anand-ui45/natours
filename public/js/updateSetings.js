import axios from 'axios';
import { showAlert } from './alert';

export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/changepassword'
        : '/api/v1/users/updateMe';
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    if (res.data.status === 'success') {
      showAlert(
        'success',
        `You updated your ${type.toUpperCase()} successfully!`
      );
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};
