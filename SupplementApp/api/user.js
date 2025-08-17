import axios from "axios";
import { getToken } from "../util/storage";

const BASE_URL = require('./api_url.json').api_url;
const API_URL = BASE_URL + "/api/users";

export async function submitSetup(data) {
  try {
    const token = await getToken();
    const res = await axios.post(`${API_URL}/setup`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (e) {
    throw e.response?.data?.msg || "Failed to submit setup";
  }
}

export async function getWhetherSetupComplete() {
  try {
    const token = await getToken();
    const res = await axios.put(`${API_URL}/is_setup`, { }, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (e) {
    throw e.response?.data?.msg || "Failed to check setup status";
  }
}
