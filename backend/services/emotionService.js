import axios from "axios";

const EMOTION_API_URL = "http://127.0.0.1:8000";

export const loadEmotionModel = async () => {
  console.log("Emotion model loaded via Python API");
  // No actual loading needed - the Python server handles it
};

export const detectEmotion = async (text) => {
  try {
    const response = await axios.post(`${EMOTION_API_URL}/detect-emotion`, {
      text: text
    });

    return response.data;
  } catch (error) {
    console.error("Error detecting emotion:", error.message);
    throw new Error("Emotion detection failed");
  }
};