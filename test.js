import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const transport = new StreamableHTTPClientTransport(
  new URL("http://localhost:3000/mcp")
);
const client = new Client({ name: "test", version: "1.0.0" });

try {
  console.log("Connecting...");
  await client.connect(transport);
  console.log("Connected. Listing tools...");

  const { tools } = await client.listTools();
  console.log("Tools:", tools.map(t => t.name).join(", "));

  console.log("Calling startup_analysis...");
  const result = await client.callTool({
    name: "startup_analysis",
    arguments: {
      startup_idea: "AI recruiting platform for SMBs",
      target_market: "North American small businesses"
    }
  });

  console.log("Result:", JSON.stringify(result, null, 2));
} catch (e) {
  console.error("Test failed:", e.message);
} finally {
  await client.close();
  console.log("Closed.");
}