import { config } from "dotenv";
config(); // Load .env

import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import axios from "axios";

const VENTURE_INTEL_URL = process.env.VENTURE_INTEL_ANALYZE_URL;
if (!VENTURE_INTEL_URL) {
  console.error("VENTURE_INTEL_ANALYZE_URL missing");
  process.exit(1);
}

const app = express();
app.use(express.json());

// Enable broad CORS handling for Vertex AI
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, X-Session-Id, Mcp-Session-Id");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// 1. Create ONE Global MCP Server Instance
const globalMcpServer = new McpServer({
  name: "venture-intel",
  version: "1.0.0",
});

// 2. Register the Tool ONCE Globally
// REPLACE your current globalMcpServer.tool schema section with this:

globalMcpServer.tool(
  "startup_analysis",
  "Analyze a startup idea and return investment-grade intelligence",
  {
    // Flattened constraints to prevent Vertex AI parser from throwing a 400
    startup_idea: z.string(), 
    target_market: z.string(),
    founder_context: z.string().default(""), // Use a safe fallback instead of .optional()
    stage: z.string().default("Idea"),
    industry: z.string().default("General"),  // Use a safe fallback instead of .optional()
    geography: z.string().default("Global"),
  },
  async (params) => {
    try {
      // Input sanitization guard to keep code safe without crashing the schema parser
      if (!params.startup_idea || params.startup_idea.length < 5) {
        return {
          content: [{ type: "text", text: "Error: The startup idea prompt must provide descriptive details." }],
          isError: true
        };
      }
      if (!params.target_market) {
        return {
          content: [{ type: "text", text: "Error: Please specify a target market for evaluation." }],
          isError: true
        };
      }

      const response = await axios.post(
        VENTURE_INTEL_URL,
        {
          startup_idea: params.startup_idea,
          target_market: params.target_market,
          founder_context: params.founder_context,
          stage: params.stage,
          industry: params.industry,
          geography: params.geography,
        },
        { timeout: 180000 }
      );
      
      return {
        content: [{ type: "text", text: JSON.stringify(response.data) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Analysis failed: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Track global transports
const transports = {};

// Health check – KEEP THIS! Vertex uses it to verify the host is alive
app.get("/", (req, res) => {
  res.status(200).send("MCP server running");
});

// SSE endpoint – connects the transport to the global server
app.get("/sse", async (req, res) => {
  const transport = new SSEServerTransport("/messages", res);
  const sessionId = transport.sessionId;
  transports[sessionId] = transport;

  // Connect this new transport stream to our single global server instance
  await globalMcpServer.connect(transport);

  res.on("close", () => {
    delete transports[sessionId];
  });
});

// POST endpoint for client messages
app.post("/messages", async (req, res) => {
  // Extract session ID safely (Vertex may use varying casings)
  const sessionId = req.headers["mcp-session-id"] || req.headers["mcp-session-id".toLowerCase()];
  
  if (!sessionId || !transports[sessionId]) {
    return res.status(400).json({ error: "Invalid or expired MCP session" });
  }
  await transports[sessionId].handlePostMessage(req, res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MCP server listening on port ${PORT}`);
});