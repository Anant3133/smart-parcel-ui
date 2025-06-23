import axios from 'axios';
import { getToken } from '../utils/token';

const BASE = 'http://localhost:5180/api/admin';

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export async function fetchUsers() {
  const res = await axios.get(`${BASE}/users`, authHeader());
  return res.data;
}

export async function fetchParcels() {
  const res = await axios.get(`${BASE}/parcels`, authHeader());
  return res.data;
}

export async function fetchAlerts() {
  const res = await axios.get(`${BASE}/alerts`, authHeader());
  return res.data;
}

export async function fetchStats() {
  const res = await axios.get(`${BASE}/stats`, authHeader());
  return res.data;
}
