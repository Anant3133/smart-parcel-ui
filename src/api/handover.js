import axios from 'axios';
import { getToken } from '../utils/token';

const BASE = `http://${window.location.hostname}:5180/api/handover`;

const authHeader = () => {
  const token = getToken();
  console.log('🔐 Token being used in handler API:', token); 
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export async function logHandover(data) {
  const res = await axios.post(`${BASE}/log`, data, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.data;
}

export async function fetchParcels() {
  const res = await axios.get(`${BASE}/parcels`, authHeader());
  return res.data;
}
