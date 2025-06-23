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

// 1. Raise a tamper alert
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

// 2. Fetch alerts for a specific parcel
export const fetchAlertsForParcel = async (trackingId) => {
  try {
    const response = await axios.get(`${BASE_URL}/${trackingId}`, getAuthHeader());
    return response.data;
  } catch (err) {
    console.error('Error fetching tamper alerts for parcel:', err);
    throw err;
  }
};

// 3. Fetch alerts raised by current handler/admin
export const fetchMyAlerts = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/my`, getAuthHeader());
    return response.data;
  } catch (err) {
    console.error('Error fetching my tamper alerts:', err);
    throw err;
  }
};

// ✅ 4. Fetch all alerts with parcel data (admin view)
export const fetchAllAlertsWithParcelInfo = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/all`, getAuthHeader());
    return response.data;
  } catch (err) {
    console.error('Error fetching all enriched tamper alerts:', err);
    throw err;
  }
};