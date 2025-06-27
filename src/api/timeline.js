import axios from 'axios';
import { getToken } from '../utils/token';

const BASE = `http://${window.location.hostname}:5180/api/Timeline`;

export async function fetchTimeline(trackingId) {
  const res = await axios.get(`${BASE}/${trackingId}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.data;
}