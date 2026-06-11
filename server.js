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

// Create the Express app using the official helper
const app = express();
// Note: createMcpExpressApp() is not directly exported; we'll mimic its behavior.
// Ensure JSON parsing and CORS are enabled manually.
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Mcp-Session-Id");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Health check – REQUIRED for Vertex connectivity probe
app.get("/", (req, res) => {
  res.status(200).send("MCP server running");
});

// Store transports by session ID
const transports = {};

// SSE endpoint – initiates the stream
app.get("/sse", async (req, res) => {
  const transport = new SSEServerTransport("/messages", res);
  const sessionId = transport.sessionId;
  transports[sessionId] = transport;

  // Create the MCP server on demand for this session
  const server = new McpServer({
    name: "venture-intel",
    version: "1.0.0",
  });

  // Define the tool
  server.tool(
    "startup_analysis",
    "Analyze a startup idea and return investment-grade intelligence",
    {
      startup_idea: z.string().min(20),
      target_market: z.string().min(1),
      founder_context: z.string().optional(),
      stage: z.string().default("Idea"),
      industry: z.string().optional(),
      geography: z.string().default("Global"),
    },
    async (params) => {
      try {
        const response = await axios.post(
          VENTURE_INTEL_URL,
          {
            startup_idea: params.startup_idea,
            target_market: params.target_market,
            founder_context: params.founder_context || "",
            stage: params.stage,
            industry: params.industry || "",
            geography: params.geography,
          },
          { timeout: 180000 } // 3 minutes
        );
        return {
          content: [{ type: "text", text: JSON.stringify(response.data) }],
        };
      } catch (error) {
        return {
          content: [
            { type: "text", text: `Analysis failed: ${error.message}` },
          ],
          isError: true,
        };
      }
    }
  );

  // Connect the transport to the server
  await server.connect(transport);

  res.on("close", () => {
    delete transports[sessionId];
    server.close().catch(console.error);
  });
});

// POST endpoint for client-to-server messages
app.post("/messages", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  if (!sessionId || !transports[sessionId]) {
    return res.status(400).json({ error: "Invalid or missing session" });
  }
  await transports[sessionId].handlePostMessage(req, res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MCP server listening on port ${PORT}`);
});