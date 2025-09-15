import axios from "axios";
import { getToken } from "../util/storage";

const BASE_URL = require("./api_url.json").api_url;
const API_URL = BASE_URL + "/api/supplements";


// --- LOOKUP FUNCTION ---
export async function lookup(upc) {
  const token = await getToken();
  try {
    const res = await axios.post(
      `${API_URL}/lookup`,
      { barcode: upc },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Immediate partial response (fast)
    return res.data; 
  } catch (e) {
    throw e.response?.data?.msg || "Lookup failed";
  }
}

export async function search(query) {
  const token = await getToken();
  try {
    const res = await axios.post(
      `${API_URL}/search`,
      { q: query },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Immediate partial response (fast)
    return res.data.hits; 
  } catch (e) {
    throw e.response?.data?.msg || "Lookup failed";
  }
}

// --- LOOKUP FUNCTION ---
export async function lookupbyid(id) {
  const token = await getToken();
  try {
    const res = await axios.post(
      `${API_URL}/lookupbyid`,
      { dsld_id: id },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Immediate partial response (fast)
    return true; 
  } catch (e) {
    throw e.response?.data?.msg || "Lookup failed";
  }
}