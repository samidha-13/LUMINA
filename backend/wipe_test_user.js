import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    // We wipe ALL test users as instructed by the user
    await User.deleteMany({ userId: "test123" });
    await User.deleteMany({ email: "test@test.com" });
    console.log("🔥 Successfully wiped test users from MongoDB cluster.");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
