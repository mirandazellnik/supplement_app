import axios from "axios";
import { getToken } from "../util/storage";

const API_URL = "http://192.168.1.207:5000/api/users"; // adjust your server IP

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
