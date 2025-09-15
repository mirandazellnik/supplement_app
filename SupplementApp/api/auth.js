import axios from "axios";

const BASE_URL = require('./api_url.json').api_url;
const API_URL = BASE_URL + "/api/auth";

console.log("API URL:", API_URL); // Debugging line to check the API URL

export async function login(username, password) {
  try {
    const res = await axios.post(`${API_URL}/login`, { username, password });
    return res.data; // contains access_token and user
  } catch (e) {
    throw e.response?.data?.msg || "Login failed, please try again.";
  }
}

export async function register(username, name, password) {
  try {
    const res = await axios.post(`${API_URL}/register`, { username, name, password });
    return res.data; // success message
  } catch (e) {
    throw e.response?.data?.msg || "Registration failed, please try again.";
  }
}

export async function check_whether_user_exists(username) {
  try {
    const res = await axios.post(`${API_URL}/check_whether_user_exists`, { username });
    return res.data.exists; // true or false
  } catch (e) {
    throw e.response?.data?.msg || "Registration failed, please try again.";
  }
}
