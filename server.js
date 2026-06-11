import { config } from "dotenv";
config();

import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/streamableHttp.js"; // ← critical
import { z } from "zod";
import axios from "axios";
import crypto from "crypto";

const VENTURE_INTEL_URL = process.env.VENTURE_INTEL_ANALYZE_URL;
if (!VENTURE_INTEL_URL) {
  console.error("VENTURE_INTEL_ANALYZE_URL missing in .env");
  process.exit(1);
}

// Use the official Express app builder
const app = createMcpExpressApp();

// Map of transports, keyed by sessionId
const transports = {};

function createServer() {
  const server = new McpServer({
    name: "venture-intel",
    version: "1.0.0",
  });

  server.tool(
    "startup_analysis",
    "Analyze a startup idea and return investment-grade intelligence with market sizing, competitive analysis, risk assessment, and execution playbook",
    {
      startup_idea: z.string().min(20),
      target_market: z.string().min(1),
      founder_context: z.string().optional().default(""),
      stage: z.string().default("Idea"),
      industry: z.string().optional().default(""),
      geography: z.string().default("Global"),
    },
    async (params) => {
      console.log(`Analysis started: ${params.startup_idea.slice(0, 50)}...`);
      try {
        const response = await axios.post(VENTURE_INTEL_URL, params, { timeout: 180000 });
        console.log("Analysis succeeded");
        return { content: [{ type: "text", text: JSON.stringify(response.data) }] };
      } catch (error) {
        console.error("Analysis failed:", error.message);
        return {
          content: [{ type: "text", text: `Analysis error: ${error.message}` }],
          isError: true,
        };
      }
    }
  );

  return server;
}

app.all("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];

  if (sessionId && transports[sessionId]) {
    // Existing session – reuse transport
    await transports[sessionId].handleRequest(req, res);
  } else if (!sessionId) {
    // New session – first request must be an initialize
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => crypto.randomUUID(),
    });

    const server = createServer();
    await server.connect(transport);

    // Handle the request (sets session header automatically)
    await transport.handleRequest(req, res);

    // Store transport for later use
    transports[transport.sessionId] = transport;

    transport.onclose = () => {
      delete transports[transport.sessionId];
      server.close().catch(console.error);
    };
  } else {
    // Session ID provided but not found – invalid
    res.status(400).json({ error: "Invalid session" });
  }
});

// Health check (required by Vertex / Render)
app.get("/", (req, res) => res.send("OK"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MCP server (StreamableHTTP) running on port ${PORT}`);
});