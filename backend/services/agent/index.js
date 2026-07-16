import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/agent.route.js";
import protect from "../../../middleware/auth.middleware.js";

const port = process.env.PORT;
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

app.use(protect);
app.use("/", router);

app.get("/", (req, res) => {
  res.json({ message: "Agent Service running" });
});

app.listen(port, () => {
  console.log(`Agent Service running on port ${port}`);
  connectDB();
});