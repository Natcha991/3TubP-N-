// models/Chat.ts
import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
  sessionId: String,
  chatLog: [
    {
      from: String,
      text: String,
      timestamp: String,
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Chat || mongoose.model("Chat", ChatSchema);
