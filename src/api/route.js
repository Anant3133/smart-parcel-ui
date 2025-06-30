// src/api/route.js
import axios from "axios";
import { getToken } from "../utils/token";

const BASE_URL = `http://${window.location.hostname}:5180/api/route`;

export async function fetchRouteByTrackingId(trackingId) {
  const res = await axios.get(`${BASE_URL}/${trackingId}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.data; 
}