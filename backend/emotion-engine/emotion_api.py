from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI()

print("Loading emotion model...")

emotion_model = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    return_all_scores=False
)

print("Emotion model loaded")

class Message(BaseModel):
    text: str


@app.get("/detect-emotion")
def detect_emotion_get(text: str):
    """Detect emotion using a GET request.

    Example: /detect-emotion?text=I%20feel%20happy
    """

    result = emotion_model(text)

    emotion = result[0]["label"]
    confidence = result[0]["score"]

    return {
        "emotion": emotion,
        "confidence": confidence
    }


@app.post("/detect-emotion")
def detect_emotion(data: Message):

    result = emotion_model(data.text)

    emotion = result[0]["label"]
    confidence = result[0]["score"]

    return {
        "emotion": emotion,
        "confidence": confidence
    }