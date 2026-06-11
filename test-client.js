import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

const transport = new SSEClientTransport(
  new URL("http://localhost:3000/sse")
);

const client = new Client({
  name: "test-client",
  version: "1.0.0",
});

async function run() {
  try {
    console.log("Connecting...");
    await client.connect(transport);
    console.log("✅ Connected to MCP server\n");

    // List tools
    const tools = await client.listTools();
    console.log("Available tools:");
    tools.tools.forEach(tool => {
      console.log(`  - ${tool.name}: ${tool.description}`);
    });

    // Call startup_analysis
    console.log("\n📊 Running startup analysis (this may take 30-60 seconds)...\n");
    
    const result = await client.callTool({
      name: "startup_analysis",
      arguments: {
        startup_idea: "AI-powered recruiting platform that automates candidate screening for small businesses",
        target_market: "Small and medium businesses in North America with 10-200 employees",
        founder_context: "Ex-HR tech founders with previous exit to Workday",
        stage: "Idea",
        industry: "HR Technology",
        geography: "North America"
      }
    });

    console.log("✅ Analysis complete!");
    console.log("\nResult preview:");
    const content = result.content[0]?.text;
    if (content) {
      const parsed = JSON.parse(content);
      console.log(`  Session ID: ${parsed.session_id}`);
      console.log(`  Verdict: ${parsed.verdict}`);
      console.log(`  Scores:`, parsed.scores);
    }
    
  } catch (err) {
    console.error("❌ Test failed:", err.message);
    if (err.stack) console.error(err.stack);
  } finally {
    console.log("\nClosing connection...");
    await client.close();
    console.log("Done.");
  }
}

run();