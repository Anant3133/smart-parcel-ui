import axios from 'axios';
import { getToken } from '../utils/token';

const BASE = 'http://localhost:5180/api/parcel';
const HANDOVER_BASE = 'http://localhost:5180/api/handover';

export async function createParcel(data) {
  const res = await axios.post(`${BASE}/create`, data, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.data;
}

export async function fetchMyParcels() {
  const res = await axios.get(`${BASE}/my`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.data;
}

export async function getParcelsHandledByHandler() {
  const res = await axios.get(`${BASE}/handled`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.data;
}

export async function updateParcelStatus(trackingId, newStatus, location) {
  const res = await axios.post(
    `${HANDOVER_BASE}/log`,
    {
      parcelTrackingId: trackingId,
      action: newStatus,
      location: location,
    },
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
  return res.data;
}