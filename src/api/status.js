import axios from 'axios';
import { getToken } from '../utils/token';

const BASE = 'http://localhost:5180/api/status';  

export async function fetchParcelStatusLogs(trackingId) {
  const res = await axios.get(`${BASE}/${trackingId}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.data;
}