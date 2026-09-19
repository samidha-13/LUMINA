import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const MemoryNode = mongoose.model("MemoryNode", new mongoose.Schema({ userId: String, label: String, snapshotData: Object }, { strict: false }));
    const snapshotNode = await MemoryNode.findOne({ userId: "test123", label: "__brain_snapshot__" }).lean();
    console.log("SNAPSHOT NODE:", JSON.stringify(snapshotNode, null, 2));
    process.exit(0);
});
