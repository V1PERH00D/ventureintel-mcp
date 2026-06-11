import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const server = new McpServer({
  name: "venture-intel",
  version: "1.0.0"
});

server.tool(
  "startup_analysis",
  {
    startup_idea: z.string(),
    target_market: z.string(),
    founder_context: z.string().optional(),
    stage: z.string().optional()
  },
  async ({ startup_idea, target_market, founder_context, stage }) => {

    const response = await axios.post(
      "https://ventureintel-mcp.onrender.com/venture_intel_analyze",
      {
        startup_idea,
        target_market,
        founder_context,
        stage
      }
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(response.data)
        }
      ]
    };
  }
);

app.all("/mcp", async (req, res) => {
  const transport = new StreamableHTTPServerTransport();
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.listen(3002, () => {
  console.log("MCP server running");
});