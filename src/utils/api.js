import axios from "axios";

// Use your public backend URL
const API_URL = "https://backend-hostel-sigma.vercel.app/api";

export const api = axios.create({
  baseURL: API_URL,
});

// Add token automatically for authenticated requests
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};
