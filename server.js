import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/* ==========================================
   STARTUP CREATE
   ========================================== */
app.post("/startup_create", async (req, res) => {
  try {
    const response = await axios.post(
      process.env.STARTUP_CREATE_URL,
      req.body
    );
    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      error: "startup_create_failed",
      details: err.message,
    });
  }
});

/* ==========================================
   WAR ROOM ENGINE
   ========================================== */
app.post("/war_room_engine", async (req, res) => {
  try {
    const response = await axios.post(
      process.env.WAR_ROOM_URL,
      req.body
    );
    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      error: "war_room_engine_failed",
      details: err.message,
    });
  }
});

/* ==========================================
   VENTURE INTEL
   ========================================== */
app.post("/venture_intel_pipeline", async (req, res) => {
  try {
    const response = await axios.post(
      process.env.VENTURE_INTEL_URL,
      req.body
    );
    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      error: "venture_intel_failed",
      details: err.message,
    });
  }
});

/* ==========================================
   HEALTH CHECK
   ========================================== */
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "ventureintel-mcp",
  });
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`MCP bridge running on port ${PORT}`);
});