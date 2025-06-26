import axios from 'axios';
import { getToken } from '../utils/token';

const BASE = `http://${window.location.hostname}:5180/api/profile`;

export async function fetchProfile() {
  const res = await axios.get(`${BASE}/userinfo`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.data;
}

export async function updateProfile(data) {
  const res = await axios.put(`${BASE}`, data, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.data;
}