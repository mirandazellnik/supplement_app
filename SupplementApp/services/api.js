const API_BASE_URL = "http://192.168.1.207:5000"; // Change to your backend IP and port

async function safeFetch(url, options) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
}

export async function getRecommendations(query) {
  return safeFetch(`${API_BASE_URL}/api/supplements/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
}