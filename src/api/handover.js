import axios from 'axios';
import { getToken } from '../utils/token';

const BASE = `http://${window.location.hostname}:5180/api/handover`;

export async function logHandover(data) {
  const res = await axios.post(`${BASE}/log`, data, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.data;
}
