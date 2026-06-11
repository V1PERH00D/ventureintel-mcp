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
   TAVILY DEEP MARKET SEARCH (ADDED)
   ========================================== */
app.post("/search", async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Missing required parameter: query" });
  }

  try {
    const response = await axios.post("https://api.tavily.com/search", {
      api_key: process.env.TAVILY_API_KEY,
      query: query,
      search_depth: "basic",
      max_results: 5,
    });
    
    res.json(response.data);
  } catch (err) {
    console.error("Tavily Search Failed:", err.message);
    res.status(500).json({
      error: "market_search_failed",
      details: err.response?.data || err.message,
    });
  }
});
/* ==========================================
   VENTURE INTEL ANALYZE
   ========================================== */
app.post("/venture_intel_analyze", async (req, res) => {
  try {
    const response = await axios.post(
      process.env.VENTURE_INTEL_ANALYZE_URL,
      req.body
    );
    res.json(response.data);
  } catch (err) {
    console.error(err.message);

    // Show upstream status + URL for easier debugging
    const upstreamStatus = err.response?.status;
    const upstreamData = err.response?.data;

    res.status(500).json({
      error: "venture_intel_analyze_failed",
      details: err.message,
      upstream_status: upstreamStatus,       // e.g. 404
      upstream_response: upstreamData,        // actual error from target
      target_url: process.env.VENTURE_INTEL_ANALYZE_URL ?? "NOT SET", // reveals missing var
    });
  }
});

/* ==========================================
   VENTURE INTEL CHAT
   ========================================== */
app.post("/venture_intel_chat", async (req, res) => {
  try {
    const response = await axios.post(
      process.env.VENTURE_INTEL_CHAT_URL,
      req.body
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.message);

    res.status(500).json({
      error: "venture_intel_chat_failed",
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
    integratedRoutes: [
  "/startup_create",
  "/war_room_engine",
  "/venture_intel_pipeline",
  "/venture_intel_analyze",
  "/venture_intel_chat",
  "/search"
]
  });
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`MCP bridge running on port ${PORT}`);
});