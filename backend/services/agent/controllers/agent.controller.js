import agentService from "../services/agentService.js";

export const createAgent = async (req, res) => {
  try {
    const agent = await agentService.createAgent(req.user.userId, req.body);
    res.status(201).json(agent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAgents = async (req, res) => {
  try {
    const agents = await agentService.getAgents(req.user.userId);
    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAgent = async (req, res) => {
  try {
    const agent = await agentService.getAgentById(req.params.id, req.user.userId);
    if (!agent) return res.status(404).json({ message: "Agent not found" });
    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAgent = async (req, res) => {
  try {
    const agent = await agentService.updateAgent(req.params.id, req.user.userId, req.body);
    if (!agent) return res.status(404).json({ message: "Agent not found" });
    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAgent = async (req, res) => {
  try {
    const agent = await agentService.deleteAgent(req.params.id, req.user.userId);
    if (!agent) return res.status(404).json({ message: "Agent not found" });
    res.json({ message: "Agent deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { message, conversationId, agentId, stream } = req.body;
    if (!message || !agentId) {
      return res.status(400).json({ message: "message and agentId required" });
    }
    const result = await agentService.sendMessage(req.user.userId, { message, conversationId, agentId, stream });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getConversations = async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const conversations = await agentService.getConversations(req.user.userId, { limit: Number(limit), offset: Number(offset) });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getConversation = async (req, res) => {
  try {
    const conversation = await agentService.getConversation(req.user.userId, req.params.id);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    await agentService.deleteConversation(req.user.userId, req.params.id);
    res.json({ message: "Conversation deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const seedDefaultAgents = async (req, res) => {
  try {
    const agents = await agentService.seedDefaultAgents(req.user.userId);
    res.json({ created: agents.length, agents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};