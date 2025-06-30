import mongoose from "mongoose";

const ChatMessageSchema = new mongoose.Schema({
  from: { type: String, enum: ["user", "ai"], required: true },
  text: { type: String, required: true },
  timestamp: { type: String, required: true },
});

const ChatSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  chatLog: [ChatMessageSchema],
  createdAt: { type: Date, default: Date.now },
});

export const ChatModel = mongoose.models.Chat || mongoose.model("Chat", ChatSessionSchema);
