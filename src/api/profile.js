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

// Upload profile picture
export const uploadProfilePicture = async (imageUrl) => {
  const res = await fetch('/api/profile/upload-profile-picture', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl }),
  });
  if (!res.ok) throw new Error('Upload failed');
  return await res.json();
};

// Upload banner image
export const uploadBannerImage = async (imageUrl) => {
  const res = await fetch('/api/profile/upload-banner-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl }),
  });
  if (!res.ok) throw new Error('Upload failed');
  return await res.json();
};
