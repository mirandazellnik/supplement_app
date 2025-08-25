import axios from "axios";

const BASE_URL = require('./api_url.json').local_api_url;
const API_URL = BASE_URL + "/api/supplements";

export async function lookup(barcode) {
  try {
    const res = await axios.post(`${API_URL}/lookup`, { barcode });
    return res.data; // contains access_token and user
  } catch (e) {
    throw e.response?.data?.msg || "Lookup failed";
  }
}
