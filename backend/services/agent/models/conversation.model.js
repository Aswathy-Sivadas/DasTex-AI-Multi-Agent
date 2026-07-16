import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant", "system", "tool"], required: true },
  content: { type: String, required: true },
  toolCalls: [{
    id: String,
    name: String,
    arguments: String,
    result: String,
  }],
  metadata: {
    agentId: String,
    agentName: String,
    tokensUsed: Number,
    model: String,
    duration: Number,
  },
  createdAt: { type: Date, default: Date.now },
});

const conversationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, default: "New Conversation" },
  messages: [messageSchema],
  activeAgentId: { type: String },
  metadata: {
    totalTokens: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    messageCount: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

conversationSchema.index({ userId: 1, updatedAt: -1 });

export const Conversation = mongoose.model("Conversation", conversationSchema);