import axios from 'axios';

const BASE = 'http://localhost:5180/api/auth';

export async function login(data) {
  const res = await axios.post(`${BASE}/login`, data);
  return res.data.token;
}

export async function register(data) {
  const res = await axios.post(`${BASE}/register`, data);
  return res.data.token;
}
