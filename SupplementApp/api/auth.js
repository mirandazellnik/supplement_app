import axios from "axios";

const API_URL = "http://192.168.3.196:5000/api/auth";
const URL2 = require('./api_url.json').api_url;
console.log(URL2)

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