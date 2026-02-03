import axios from "axios";

// ✅ ONLY backend URL (ONE SOURCE OF TRUTH)
const API_URL = "https://backend-hostel-sigma.vercel.app/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Token handler
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};
