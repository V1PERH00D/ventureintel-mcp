import type { VentureAnalysis, WorldState } from "./api";
import { reconstructWorldState } from "./war-room-normalize";

export const mockAnalysis = (idea: string, market: string): VentureAnalysis => ({
  session_id: "mock_" + Date.now(),
  scores: {
    overall: 78,
    confidence: 82,
    market: 84,
    competitive: 71,
    risk: 65,
    strategic: 80,
  },
  market: {
    tam: "$48B",
    sam: "$12B",
    som: "$840M",
    growth: "23% CAGR",
    segments: [
      { name: "SMB", size: 42 },
      { name: "Mid-Market", size: 33 },
      { name: "Enterprise", size: 25 },
    ],
  },
  competition: {
    competitors: [
      { name: "Incumbent A", strength: 80, weakness: "Legacy stack" },
      { name: "Startup B", strength: 60, weakness: "Limited distribution" },
      { name: "Startup C", strength: 55, weakness: "Weak UX" },
    ],
    moats: ["Network effects", "Proprietary dataset", "Brand"],
    differentiation: "AI-native workflow + 10x faster onboarding",
    threats: ["Big tech entry", "Commoditization"],
  },
  risk: {
    items: [
      { name: "Regulatory", likelihood: 3, impact: 4 },
      { name: "Technical", likelihood: 2, impact: 3 },
      { name: "Market", likelihood: 3, impact: 5 },
      { name: "Funding", likelihood: 4, impact: 4 },
      { name: "Team", likelihood: 2, impact: 4 },
    ],
    mitigations: ["Hire compliance counsel early", "Diversify funding sources", "Build technical moats"],
  },
  strategy: {
    mvp: "Launch focused MVP in 8 weeks targeting design partners.",
    gtm: "Bottom-up PLG with founder-led sales for first 10 customers.",
    pricing: "Tiered SaaS: $49 / $199 / Enterprise",
    roadmap: ["MVP", "First 10 customers", "Series Seed", "Scale GTM"],
    fundraising: "Raise $2M pre-seed → $10M seed at 18 months",
    milestones: ["10 design partners", "$10k MRR", "Product-market fit signal"],
  },
  raw_report: `# Analysis Report\n\n**Idea:** ${idea}\n\n**Market:** ${market}\n\nThis is a mock report shown when the backend is unreachable.`,
});

export const mockWorld = (name = "Acme"): WorldState => ({
  startup_id: "mock-" + Date.now(),
  status: "OPERATING",
  round: 0,
  simulationRound: 1,
  startup: { name, industry: "SaaS" },
  company: {
    name,
    budget: 1_500_000,
    runway: 18,
    growth: 12,
    morale: 85,
    investorConfidence: 70,
    technicalDebt: 10,
    brandReputation: 40,
    productQuality: 60,
    marketFit: 25,
  },
  influence: { CEO: 85, CTO: 72, PM: 60, Marketing: 55, Finance: 65, Investor: 78 },
  winningCoalition: ["CEO", "CTO"],
  opposingCoalition: ["Finance"],
  agentVoices: [
    { agent: "CEO", stance: "Aggressive growth", summary: "We need to move now before the window closes. Speed beats perfection at this stage." },
    { agent: "Finance", stance: "Conservative", summary: "I will support measured bets, but I will veto any spend that doesn't show ROI within two quarters.", rebuttal: "Growth without discipline is just a faster path to zero runway." },
    { agent: "Marketing", stance: "Brand-led offense", summary: "If we go quiet, we surrender mindshare. NovaAI is already buying the narrative." },
    { agent: "Investor", stance: "Demand traction", summary: "Show me metrics that justify the next check — not another strategy deck." },
  ],
  agentMemory: {
    CEO: { learnings: ["Competitor funding accelerates market clock"], stance: "Offense wins when runway > 8mo" },
    Finance: { concern: "Burn rate sensitivity", stance: "Every campaign must tie to CAC payback" },
  },
  delayedConsequences: [
    { fireAtRound: 4, description: "Infrastructure strain from aggressive growth push" },
    { fireAtRound: 5, description: "Investor audit triggered by marketing overspend" },
    { fireAtRound: 6, description: "Customer churn as support capacity breaks" },
  ],
  current_event: "Founding meeting convened.",
  decision: "Establish product vision and roadmap.",
  narrative: "The team gathers. Energy is high. The road ahead is uncertain but full of promise.",
  winning_coalition: ["CEO", "CTO"],
  opposing_coalition: ["Finance"],
  political_tensions: 0.2,
  metrics: {
    budget: 1500000,
    runway: 18,
    mrr: 0,
    arr: 0,
    growth: 0,
    morale: 85,
    investor_confidence: 70,
    technical_debt: 10,
    brand_reputation: 40,
    product_quality: 60,
    market_fit: 25,
    team_size: 6,
  },
  agents: [
    { name: "CEO", influence: 85, credibility: 78, wins: 0, losses: 0, stance: "Aggressive growth", mood: "Focused", confidence: 80,
      personality: { risk_tolerance: 75, aggressiveness: 70, optimism: 80, paranoia: 30, confidence: 80 } },
    { name: "CTO", influence: 72, credibility: 82, wins: 0, losses: 0, stance: "Build for scale", mood: "Calm", confidence: 75,
      personality: { risk_tolerance: 50, aggressiveness: 40, optimism: 65, paranoia: 55, confidence: 78 } },
    { name: "PM", influence: 60, credibility: 68, wins: 0, losses: 0, stance: "Customer first", mood: "Optimistic", confidence: 70,
      personality: { risk_tolerance: 55, aggressiveness: 45, optimism: 75, paranoia: 35, confidence: 65 } },
    { name: "Marketing", influence: 55, credibility: 60, wins: 0, losses: 0, stance: "Brand-led", mood: "Energetic", confidence: 68,
      personality: { risk_tolerance: 65, aggressiveness: 60, optimism: 80, paranoia: 25, confidence: 70 } },
    { name: "Finance", influence: 65, credibility: 80, wins: 0, losses: 0, stance: "Conserve runway", mood: "Cautious", confidence: 72,
      personality: { risk_tolerance: 25, aggressiveness: 30, optimism: 40, paranoia: 70, confidence: 75 } },
    { name: "Investor", influence: 78, credibility: 85, wins: 0, losses: 0, stance: "Demand traction", mood: "Watchful", confidence: 70,
      personality: { risk_tolerance: 55, aggressiveness: 65, optimism: 55, paranoia: 60, confidence: 80 } },
  ],
  delayed_consequences: [
    { id: "c1", description: "Hiring spree impacts burn", activates_in: 3 },
  ],
  history: [],
});

export function evolveWorld(prev: WorldState, event: string): WorldState {
  const round = (prev.round ?? 0) + 1;
  const prevCompany = prev.company ?? {};
  const prevMetrics = prev.metrics ?? {};
  const metrics = { ...prevMetrics };
  const company = {
    ...prevCompany,
    budget: prevCompany.budget ?? prevMetrics.budget ?? 0,
    runway: prevCompany.runway ?? prevMetrics.runway ?? 0,
    growth: prevCompany.growth ?? prevMetrics.growth ?? 0,
    morale: prevCompany.morale ?? prevMetrics.morale ?? 0,
    investorConfidence: prevCompany.investorConfidence ?? prevMetrics.investor_confidence ?? 0,
    technicalDebt: prevCompany.technicalDebt ?? prevMetrics.technical_debt ?? 0,
    brandReputation: prevCompany.brandReputation ?? prevMetrics.brand_reputation ?? 0,
    productQuality: prevCompany.productQuality ?? prevMetrics.product_quality ?? 0,
    marketFit: prevCompany.marketFit ?? prevMetrics.market_fit ?? 0,
  };
  const delta = (k: keyof typeof company, v: number) => {
    company[k] = Math.max(0, (company[k] as number) + v) as never;
  };
  const deltaMetric = (k: string, v: number) => { metrics[k] = Math.max(0, (metrics[k] ?? 0) + v); };

  delta("budget", -Math.round(40000 + Math.random() * 80000));
  delta("runway", -1);
  deltaMetric("budget", company.budget);
  deltaMetric("runway", company.runway);
  deltaMetric("mrr", Math.round(Math.random() * 8000));
  metrics.arr = (metrics.mrr ?? 0) * 12;
  delta("morale", Math.round(Math.random() * 10 - 4));
  delta("investorConfidence", Math.round(Math.random() * 10 - 3));
  delta("marketFit", Math.round(Math.random() * 6 - 1));
  deltaMetric("morale", company.morale);
  deltaMetric("investor_confidence", company.investorConfidence);
  deltaMetric("market_fit", company.marketFit);
  const agents = (prev.agents ?? []).map((a) => ({
    ...a,
    influence: Math.min(100, Math.max(0, a.influence + Math.round(Math.random() * 8 - 4))),
    confidence: Math.min(100, Math.max(0, a.confidence + Math.round(Math.random() * 10 - 5))),
    wins: a.wins + (Math.random() > 0.7 ? 1 : 0),
    losses: a.losses + (Math.random() > 0.85 ? 1 : 0),
  }));
  const status: WorldState["status"] =
    (company.budget ?? 0) <= 0 ? "BANKRUPT" : (company.runway ?? 0) < 4 ? "CRITICAL" : "OPERATING";
  const winning = agents.slice(0, 2).map((a) => a.name);
  const opposing = agents.slice(-2).map((a) => a.name);
  const decision = ["Pivot product", "Double down on GTM", "Raise emergency round", "Cut burn"][Math.floor(Math.random() * 4)];
  const narrative = `Round ${round}: ${event}. The boardroom erupts — alliances shift and tempers flare.`;
  const influence = { ...(prev.influence ?? {}) };
  for (const a of agents) influence[a.name] = a.influence;

  const worldState = {
    ...reconstructWorldState(prev),
    company,
    status,
    simulationRound: round + 1,
    round,
    lastEvent: event,
    decision,
    narrative,
    influence,
    delayedConsequences: prev.delayedConsequences ?? prev.delayed_consequences ?? [],
    agentMemory: prev.agentMemory ?? {},
  };

  return {
    ...prev,
    round,
    simulationRound: round + 1,
    worldState,
    company,
    metrics,
    agents,
    influence,
    status,
    event,
    current_event: event,
    currentEvent: event,
    decision,
    narrative,
    winning_coalition: winning,
    opposing_coalition: opposing,
    winningCoalition: winning,
    opposingCoalition: opposing,
    agentVoices: agents.map((a) => ({
      agent: a.name,
      stance: a.stance,
      summary: `${a.stance}. Confidence at ${a.confidence}%.`,
      rebuttal: Math.random() > 0.5 ? `I disagree — ${a.name} pushes back on the prevailing consensus.` : undefined,
    })),
    rebuttalFeed: agents
      .filter(() => Math.random() > 0.5)
      .map((a) => `${a.name}: Pushes back on the prevailing consensus.`),
    political_tensions: Math.min(1, (prev.political_tensions ?? 0.2) + (Math.random() * 0.2 - 0.1)),
    tensionLevel: Math.min(100, ((prev.political_tensions ?? 0.2) + Math.random() * 0.2) * 100),
    delayedConsequences: prev.delayedConsequences ?? prev.delayed_consequences ?? [],
    history: [
      ...(prev.history ?? []),
      { round, event, decision, outcome: status, narrative },
    ],
  };
}
