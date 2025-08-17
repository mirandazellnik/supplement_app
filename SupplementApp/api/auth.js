import axios from "axios";

const BASE_URL = require('./api_url.json').api_url;
const API_URL = BASE_URL + "/api/auth";

export async function login(username, password) {
  try {
    const res = await axios.post(`${API_URL}/login`, { username, password });
    return res.data; // contains access_token and user
  } catch (e) {
    throw e.response?.data?.msg || "Login failed";
  }
}

export async function register(username, password) {
  try {
    const res = await axios.post(`${API_URL}/register`, { username, password });
    return res.data; // success message
  } catch (e) {
    throw e.response?.data?.msg || "Registration failed";
  }
}