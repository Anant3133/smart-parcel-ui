import axios from 'axios';
import { getToken } from '../utils/token';

const BASE = `http://${window.location.hostname}:5180/api/password`;

export const changePassword = async ({ OldPassword, NewPassword }) => {
  const res = await axios.post(
    `${BASE}/change`,
    { OldPassword, NewPassword },
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
  return res.data;
};

export const forgotPassword = async (email) => {
  const res = await axios.post(`${BASE}/forgot`, { email });
  return res.data; // includes token in dev/test
};

export const resetPassword = async ({ email, token, newPassword }) => {
  const res = await axios.post(`${BASE}/reset`, {
    email,
    token,
    newPassword,
  });
  return res.data;
};
