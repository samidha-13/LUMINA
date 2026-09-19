import axios from "axios";

const testChat = async () => {
  try {
    const res = await axios.post("http://localhost:5000/chat", {
      userId: "test_pinecone_user_1",
      message: "I feel stressed because my manager criticized my work."
    });
    console.log("Response 1:", res.data.reply);
    console.log("Pattern Insight:", res.data.patternInsight);
    
    // Give it a second to upsert
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const res2 = await axios.post("http://localhost:5000/chat", {
      userId: "test_pinecone_user_1",
      message: "My supervisor keeps making me doubt myself."
    });
    console.log("Response 2:", res2.data.reply);
    
  } catch (err) {
    console.error("Test failed:", err.response ? err.response.data : err.message);
  }
};

testChat();
