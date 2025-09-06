import axios from "axios";
import io from "socket.io-client";
import { getToken } from "../util/storage";


const BASE_URL = require("./api_url.json").api_url;
const API_URL = BASE_URL + "/api/essentials";

// --- LOOKUP FUNCTION ---
export async function get_essential(essentialName) {
  const token = await getToken();
  try {
    const res = await axios.post(
      `${API_URL}/lookup`,
      { name: essentialName },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Immediate partial response (fast)
    return res.data; 
  } catch (e) {
    throw e.response?.data?.msg || "Essntialinfo failed";
  }
}