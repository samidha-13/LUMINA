# LUMINA — “The mirror your thoughts never had.”

Ever felt like there’s so much going on inside you… but you just can’t explain it?
One day you’re fine.
Next day you feel off.
And sometimes… you don’t even know why.

💡 Let’s be real — ChatGPT or most emotional chatbots:
→ You type how you feel
→ They respond
→ And that moment is gone

They don’t remember you.
They don’t connect your experiences.
They don’t show you what’s happening inside you.

🧠 **LUMINA changes that completely:**
→ A live brain map of your emotions
→ Real-time emotion glowing as you speak
→ A talking avatar that adapts to your mood and tone
→ Your triggers, memories, and experiences all connected

📊 **And beyond the moment —**
A Spotify-style wrap-up of your emotional journey — your patterns, biggest triggers, and how you’ve truly been feeling.

So instead of just talking… you start seeing, understanding, and connecting everything.

This isn’t just another chatbot. This is a completely new way to understand yourself.
## Project Structure
- **Frontend**: React & Vite
- **Backend**: Node.js & Express (MongoDB for data persistence)
- **Emotion Engine**: Python & FastAPI (for sentiment analysis)

## Prerequisites
- Node.js & npm
- Python 3
- MongoDB (running locally or via MongoDB Atlas)
- Groq API Key

## How to Run Locally

You will need to open **three separate terminals** to run all services simultaneously.

### Terminal 1: Emotion Engine (Python)
This terminal runs the local sentiment analysis API.
```bash
cd backend/emotion-engine

# Install dependencies (only needed once)
pip install fastapi uvicorn pydantic transformers torch torchvision torchaudio

# Start the API
uvicorn emotion_api:app --reload --port 8000
```

### Terminal 2: Node.js Backend
This terminal runs the main backend server connecting to MongoDB and Groq.
```bash
cd backend

# Install dependencies
npm install

# Start the server
node server.js
```
*(Make sure your `backend/.env` file is properly configured with your `MONGO_URI` and `GROQ_API_KEY` before starting).*

### Terminal 3: React Frontend
This terminal runs the user interface.
```bash
# From the root project directory (lumina-mindscape)
npm install

# Start the Vite development server
npm run dev
```

Open your browser to the local address provided by Vite to explore your Mindscape!
