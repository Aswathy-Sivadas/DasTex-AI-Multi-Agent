import express from "express";
import { 
  createAgent, getAgents, getAgent, updateAgent, deleteAgent,
  sendMessage, getConversations, getConversation, deleteConversation,
  seedDefaultAgents
} from "../controllers/agent.controller.js";

const router = express.Router();

router.post("/agents/seed", seedDefaultAgents);

router.post("/agents", createAgent);
router.get("/agents", getAgents);
router.get("/agents/:id", getAgent);
router.put("/agents/:id", updateAgent);
router.delete("/agents/:id", deleteAgent);

router.post("/chat", sendMessage);
router.get("/conversations", getConversations);
router.get("/conversations/:id", getConversation);
router.delete("/conversations/:id", deleteConversation);

export default router;