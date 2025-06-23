import axios from 'axios';

const BASE_URL = 'http://localhost:5180/api/TamperAlert';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const raiseTamperAlert = async ({ parcelTrackingId, message }) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/raise`,
      { parcelTrackingId, message },
      getAuthHeader()
    );
    return response.data;
  } catch (err) {
    console.error('Error raising tamper alert:', err);
    throw err;
  }
};

export const getTamperAlerts = async () => {
  try {
    const response = await axios.get(`${BASE_URL}`, getAuthHeader());
    return response.data;
  } catch (err) {
    console.error('Error fetching tamper alerts:', err);
    throw err;
  }
};