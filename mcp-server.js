import express from "express";
import axios from "axios";
import { z } from "zod";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const app = express();
app.use(express.json());

/* ==========================================================
   MCP SERVER
   ========================================================== */

const mcpServer = new McpServer({
  name: "venture-intel",
  version: "1.0.0",
});

/* ==========================================================
   STARTUP ANALYSIS TOOL
   ========================================================== */

mcpServer.tool(
  "startup_analysis",
  {
    startup_idea: z.string(),
    target_market: z.string(),
    founder_context: z.string().optional(),
    stage: z.string().optional(),
  },
  async ({
    startup_idea,
    target_market,
    founder_context,
    stage,
  }) => {
    try {
      console.log("startup_analysis tool called");

      // CHANGE THIS TO YOUR ANALYSIS BACKEND DIRECTLY
      const response = await axios.post(
        process.env.VENTURE_INTEL_ANALYZE_URL,
        {
          startup_idea,
          target_market,
          founder_context,
          stage,
        }
      );

      return {
        content: [
          {
            type: "text",
            text:
              typeof response.data === "string"
                ? response.data
                : JSON.stringify(response.data, null, 2),
          },
        ],
      };
    } catch (err) {
      console.error("startup_analysis failed:", err);

      return {
        content: [
          {
            type: "text",
            text: `Tool failed: ${err.message}`,
          },
        ],
      };
    }
  }
);

/* ==========================================================
   HEALTH CHECK
   ========================================================== */

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "venture-intel-mcp",
    tools: ["startup_analysis"],
  });
});

/* ==========================================================
   MCP ENDPOINT
   ========================================================== */

app.all("/mcp", async (req, res) => {
  console.log("MCP REQUEST:", req.method);

  try {
    const transport = new StreamableHTTPServerTransport();

    await mcpServer.connect(transport);

    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error("MCP ERROR:", err);

    res.status(500).json({
      error: err.message,
      stack: err.stack,
    });
  }
});

/* ==========================================================
   START SERVER
   ========================================================== */

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`MCP server running on port ${PORT}`);
});