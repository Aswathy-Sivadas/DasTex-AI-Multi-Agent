import mongoose from "mongoose";

const toolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  parameters: { type: mongoose.Schema.Types.Mixed, required: true },
  handler: { type: String, required: false },
  enabled: { type: Boolean, default: true },
});

const agentSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  description: { type: String, default: "" },
  systemPrompt: { type: String, required: true },
  model: { type: String, enum: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"], default: "gpt-4o-mini" },
  temperature: { type: Number, default: 0.7, min: 0, max: 2 },
  maxTokens: { type: Number, default: 2000, min: 100, max: 8000 },
  tools: [toolSchema],
  capabilities: [{
    type: String,
    enum: ["web_search", "code_execution", "file_operations", "data_analysis", "image_generation", "custom"],
  }],
  isDefault: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  metadata: {
    totalConversations: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    avgResponseTime: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

agentSchema.index({ userId: 1, isDefault: 1 });

export const Agent = mongoose.model("Agent", agentSchema);