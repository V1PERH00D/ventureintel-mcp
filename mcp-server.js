import express from "express";
import axios from "axios";
import { randomUUID } from "crypto";
import * as z from "zod";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  console.log("HEADERS:", JSON.stringify(req.headers, null, 2));
  next();
});

/* ==========================================================
   CREATE MCP SERVER
   ========================================================== */

function createServer() {
  const server = new McpServer({
    name: "venture-intel",
    version: "1.0.0",
  });

  server.registerTool(
    "startup_analysis",
    {
      description: "Analyze a startup idea and return a venture intelligence report.",
      inputSchema: {
        startup_idea: z.string(),
        target_market: z.string(),
        founder_context: z.string().optional(),
        stage: z.string().optional(),
      },
    },
    async ({
      startup_idea,
      target_market,
      founder_context,
      stage,
    }) => {
      try {
        console.log("startup_analysis tool called");

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
        console.error(err);

        return {
          content: [
            {
              type: "text",
              text: `Tool failed: ${err.message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  return server;
}

/* ==========================================================
   SESSION TRANSPORTS
   ========================================================== */

const transports = {};

/* ==========================================================
   MCP ENDPOINT
   ========================================================== */

app.post("/mcp", async (req, res) => {
  try {
    const sessionId = req.headers["mcp-session-id"];

    let transport;

    if (sessionId && transports[sessionId]) {
      transport = transports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),

        onsessioninitialized: (sid) => {
          console.log("Session initialized:", sid);
          transports[sid] = transport;
        },
      });

      transport.onclose = () => {
        if (transport.sessionId) {
          delete transports[transport.sessionId];
        }
      };

      const server = createServer();

      await server.connect(transport);
    } else {
      return res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Bad Request: No valid session ID provided",
        },
        id: null,
      });
    }

    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error("MCP ERROR:", err);

    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: err.message,
        },
        id: null,
      });
    }
  }
});

/* ==========================================================
   OPTIONAL GET SUPPORT
   ========================================================== */

app.get("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];

  if (!sessionId || !transports[sessionId]) {
    return res.status(400).send("Invalid session");
  }

  await transports[sessionId].handleRequest(req, res);
});

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
   START SERVER
   ========================================================== */

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`MCP server running on port ${PORT}`);
});