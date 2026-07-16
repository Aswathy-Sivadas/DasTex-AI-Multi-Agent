import OpenAI from "openai";
import { Agent } from "../models/agent.model.js";
import { Conversation } from "../models/conversation.model.js";
import ToolExecutor from "./toolExecutor.js";

class AgentService {
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.toolExecutor = new ToolExecutor(this.openai);
  }

  async createAgent(userId, agentData) {
    if (agentData.isDefault) {
      await Agent.updateMany({ userId, isDefault: true }, { isDefault: false });
    }
    const agent = await Agent.create({ ...agentData, userId });
    return agent;
  }

  async getAgents(userId) {
    return Agent.find({ userId, isActive: true }).sort({ createdAt: -1 });
  }

  async getDefaultAgent(userId) {
    return Agent.findOne({ userId, isDefault: true, isActive: true });
  }

  async getAgentById(agentId, userId) {
    return Agent.findOne({ _id: agentId, userId });
  }

  async updateAgent(agentId, userId, updates) {
    if (updates.isDefault) {
      await Agent.updateMany({ userId, isDefault: true }, { isDefault: false });
    }
    return Agent.findOneAndUpdate({ _id: agentId, userId }, updates, { new: true });
  }

  async deleteAgent(agentId, userId) {
    return Agent.findOneAndDelete({ _id: agentId, userId });
  }

  async getOrCreateConversation(userId, conversationId, agentId) {
    if (conversationId) {
      const conv = await Conversation.findOne({ _id: conversationId, userId });
      if (conv) return conv;
    }
    return Conversation.create({ userId, activeAgentId: agentId });
  }

  async sendMessage(userId, { message, conversationId, agentId, stream = false }) {
    const agent = await this.getAgentById(agentId, userId);
    if (!agent) throw new Error("Agent not found");

    const conversation = await this.getOrCreateConversation(userId, conversationId, agent._id);
    
    conversation.messages.push({
      role: "user",
      content: message,
      metadata: { agentId: agent._id.toString(), agentName: agent.name },
    });

    const messages = this.buildMessages(agent, conversation);
    const tools = agent.tools.filter(t => t.enabled).map(t => ({
      type: "function",
      function: { name: t.name, description: t.description, parameters: t.parameters },
    }));

    const startTime = Date.now();
    let response;
    let toolCalls = [];

    if (stream) {
      response = await this.streamResponse(messages, tools, agent);
    } else {
      const completion = await this.openai.chat.completions.create({
        model: agent.model,
        messages,
        tools: tools.length ? tools : undefined,
        tool_choice: tools.length ? "auto" : undefined,
        temperature: agent.temperature,
        max_tokens: agent.maxTokens,
      });
      response = completion.choices[0].message;
      toolCalls = response.tool_calls || [];
    }

    for (const toolCall of toolCalls) {
      const result = await this.toolExecutor.execute(toolCall.function.name, JSON.parse(toolCall.function.arguments));
      conversation.messages.push({
        role: "tool",
        content: JSON.stringify(result),
        toolCalls: [{ id: toolCall.id, name: toolCall.function.name, arguments: toolCall.function.arguments, result: JSON.stringify(result) }],
      });
    }

    const finalMessages = this.buildMessages(agent, conversation);
    const finalCompletion = await this.openai.chat.completions.create({
      model: agent.model,
      messages: finalMessages,
      temperature: agent.temperature,
      max_tokens: agent.maxTokens,
    });

    const assistantMessage = finalCompletion.choices[0].message;
    conversation.messages.push({
      role: "assistant",
      content: assistantMessage.content,
      metadata: {
        agentId: agent._id.toString(),
        agentName: agent.name,
        tokensUsed: finalCompletion.usage?.total_tokens,
        model: agent.model,
        duration: Date.now() - startTime,
      },
    });

    conversation.metadata.messageCount = conversation.messages.length;
    conversation.metadata.totalTokens += finalCompletion.usage?.total_tokens || 0;
    conversation.activeAgentId = agent._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    agent.metadata.totalConversations += 1;
    agent.metadata.totalTokens += finalCompletion.usage?.total_tokens || 0;
    agent.metadata.avgResponseTime = (agent.metadata.avgResponseTime + (Date.now() - startTime)) / 2;
    await agent.save();

    return {
      message: assistantMessage.content,
      conversationId: conversation._id,
      tokensUsed: finalCompletion.usage?.total_tokens,
    };
  }

  buildMessages(agent, conversation) {
    return [
      { role: "system", content: agent.systemPrompt },
      ...conversation.messages.map(m => ({
        role: m.role,
        content: m.content,
        ...(m.toolCalls?.length ? { tool_calls: m.toolCalls } : {}),
      })),
    ];
  }

  async streamResponse(messages, tools, agent) {
    // Implementation for streaming - return async generator
    const stream = await this.openai.chat.completions.create({
      model: agent.model,
      messages,
      tools: tools.length ? tools : undefined,
      tool_choice: tools.length ? "auto" : undefined,
      temperature: agent.temperature,
      max_tokens: agent.maxTokens,
      stream: true,
    });
    return stream;
  }

  async getConversations(userId, { limit = 20, offset = 0 } = {}) {
    return Conversation.find({ userId })
      .sort({ updatedAt: -1 })
      .skip(offset)
      .limit(limit)
      .select("-messages");
  }

  async getConversation(userId, conversationId) {
    return Conversation.findOne({ _id: conversationId, userId });
  }

  async deleteConversation(userId, conversationId) {
    return Conversation.findOneAndDelete({ _id: conversationId, userId });
  }

  async seedDefaultAgents(userId) {
    const { DEFAULT_AGENT_TEMPLATES } = await import("../config/tools.js");
    const existing = await Agent.countDocuments({ userId });
    if (existing > 0) return [];

    const agents = await Agent.insertMany(
      DEFAULT_AGENT_TEMPLATES.map(t => ({ ...t, userId, tools: t.capabilities.map(c => this.toolExecutor.getToolSchema(c)).filter(Boolean) }))
    );
    return agents;
  }
}

export default new AgentService();