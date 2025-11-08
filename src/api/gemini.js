// This function reads the API key securely from your .env.local file
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

export async function callGemini(payload) {
  if (!apiKey || apiKey.includes("YOUR_API_KEY")) {
    throw new Error("API key not configured. Please add VITE_GEMINI_API_KEY to your .env.local file.");
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const data = await response.json();

    if (payload.generationConfig && payload.generationConfig.responseMimeType === "application/json") {
      const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (jsonText) {
        return JSON.parse(jsonText);
      }
    } else {
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text.trim();
      }
    }

    throw new Error("No content received from API.");
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw error; // Re-throw the error to be caught by the component
  }
}