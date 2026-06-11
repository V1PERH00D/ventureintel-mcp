import type { AgentState, StartupCreateInput, WorldState } from "./api";

function companyToMetrics(c: Record<string, any>): Record<string, number> {
  return {
    budget: c.budget ?? 0,
    runway: c.runway ?? 0,
    growth: c.growth ?? 0,
    morale: c.morale ?? 0,
    investor_confidence: c.investorConfidence ?? c.investor_confidence ?? 0,
    technical_debt: c.technicalDebt ?? c.technical_debt ?? 0,
    brand_reputation: c.brandReputation ?? c.brand_reputation ?? 0,
    product_quality: c.productQuality ?? c.product_quality ?? 0,
    market_fit: c.marketFit ?? c.market_fit ?? 0,
    mrr: c.mrr ?? 0,
    arr: c.arr ?? 0,
    team_size: c.teamSize ?? c.team_size ?? 0,
  };
}

function normalizeTension(raw: unknown): number {
  if (raw == null || raw === "") return 0.3;
  const n = Number(raw);
  if (Number.isNaN(n)) return 0.3;
  return n > 1 ? Math.min(1, n / 100) : Math.min(1, Math.max(0, n));
}

function buildAgents(voices: any[] | undefined, influence: Record<string, number>): AgentState[] | undefined {
  if (!voices?.length) return undefined;
  return voices.map((v) => ({
    name: v.agent ?? v.name ?? "Agent",
    influence: influence[v.agent] ?? influence[v.name] ?? Math.round((v.confidence ?? 0.7) * 100),
    credibility: Math.round((v.confidence ?? 0.75) * 100),
    wins: 0,
    losses: 0,
    stance: v.stance,
    mood: v.urgency ?? "Focused",
    confidence: Math.round((v.confidence ?? 0.7) * 100),
  }));
}

export function isWarRoomResponse(raw: unknown): boolean {
  if (!raw || typeof raw !== "object") return false;
  const r = raw as Record<string, unknown>;
  return !!(
    r.worldState ||
    r.agentVoices ||
    r.winningCoalition ||
    r.winning_coalition ||
    r.agents ||
    (r.metrics && typeof r.metrics === "object") ||
    (r.company && typeof r.company === "object")
  );
}

export function reconstructWorldState(world: WorldState): Record<string, unknown> {
  if (world.worldState && typeof world.worldState === "object") {
    return { ...world.worldState };
  }
  const company = world.company ?? {};
  return {
    startupId: world.startup_id ?? world.startupId,
    company: {
      ...company,
      name: company.name ?? world.startup?.name,
      industry: company.industry ?? world.startup?.industry,
    },
    status: world.status,
    simulationRound: world.simulationRound ?? world.round ?? 1,
    round: world.round,
    influence: world.influence ?? {},
    relationships: world.relationships ?? {},
    agentMemory: world.agentMemory ?? {},
    delayedConsequences: world.delayedConsequences ?? world.delayed_consequences ?? [],
    personalityVectors: world.personalityVectors ?? {},
    eventHistory: world.eventHistory ?? [],
    pendingEvents: world.pendingEvents ?? [],
    marketSentiment: world.marketSentiment,
    lastEvent: world.event ?? world.current_event ?? world.currentEvent,
    narrative: world.narrative,
    decision: world.decision,
    tensionLevel: world.tensionLevel ?? (world.political_tensions != null ? world.political_tensions * 100 : undefined),
  };
}

export function normalizeWarRoomResponse(raw: unknown): WorldState {
  if (!raw || typeof raw !== "object") return (raw ?? {}) as WorldState;

  const r = raw as Record<string, any>;
  const ws = r.worldState && typeof r.worldState === "object" ? r.worldState : r;
  const company = { ...(ws.company ?? {}), ...(r.metrics && typeof r.metrics === "object" ? r.metrics : {}) };
  if (!company.name && r.startup?.name) company.name = r.startup.name;

  const influence = { ...(ws.influence ?? {}), ...(r.influence ?? {}) };
  const event =
    r.event ??
    ws.lastEvent ??
    ws.currentEvent ??
    r.current_event ??
    ws.current_event ??
    r.currentEvent ??
    "";

  const round = r.round ?? ws.round ?? ws.simulationRound ?? 0;
  const simulationRound = r.simulationRound ?? ws.simulationRound ?? round;
  const politicalTensions = normalizeTension(
    r.tensionLevel ?? ws.tensionLevel ?? r.politicalTensions ?? ws.politicalTensions ?? r.political_tensions ?? ws.political_tensions,
  );

  const winning =
    r.winningCoalition ?? ws.winningCoalition ?? r.winning_coalition ?? ws.winning_coalition ?? [];
  const opposing =
    r.opposingCoalition ?? ws.opposingCoalition ?? r.opposing_coalition ?? ws.opposing_coalition ?? [];

  const agentVoices = r.agentVoices ?? ws.agentVoices ?? [];
  const agents = r.agents ?? ws.agents ?? buildAgents(agentVoices, influence);

  const normalized: WorldState = {
    ...ws,
    worldState: ws,
    startup_id: r.startupId ?? ws.startupId ?? r.startup_id ?? ws.startup_id,
    startupId: r.startupId ?? ws.startupId ?? r.startup_id,
    startup: {
      name: company.name ?? r.startup?.name ?? "Startup",
      industry: company.industry ?? r.startup?.industry ?? "Tech",
    },
    company,
    metrics: companyToMetrics(company),
    status: r.status ?? ws.status ?? "OPERATING",
    round,
    simulationRound,
    current_event: event,
    currentEvent: event,
    event,
    decision: r.decision ?? ws.decision ?? "",
    narrative: r.narrative ?? ws.narrative ?? "",
    winningCoalition: winning,
    opposingCoalition: opposing,
    winning_coalition: winning,
    opposing_coalition: opposing,
    agentVoices,
    rebuttalOutputs: r.rebuttalOutputs ?? ws.rebuttalOutputs ?? [],
    rebuttalFeed: r.rebuttalFeed ?? ws.rebuttalFeed ?? [],
    liveDebateFeed: r.liveDebateFeed ?? ws.liveDebateFeed ?? [],
    agentMemory: r.agentMemory ?? ws.agentMemory ?? {},
    influence,
    delayedConsequences: r.delayedConsequences ?? ws.delayedConsequences ?? r.delayed_consequences ?? ws.delayed_consequences ?? [],
    delayed_consequences: r.delayedConsequences ?? ws.delayedConsequences ?? r.delayed_consequences ?? ws.delayed_consequences ?? [],
    political_tensions: politicalTensions,
    politicalTensions,
    tensionLevel: r.tensionLevel ?? ws.tensionLevel ?? politicalTensions * 100,
    agents,
  };

  return normalized;
}

export function toBackendCreatePayload(input: StartupCreateInput) {
  return {
    name: input.startup_name,
    industry: input.industry,
    idea: input.idea,
    budget: input.budget,
    runway: input.runway,
    teamSize: input.team_size,
    growthStrategy: input.growth_strategy,
  };
}

export function toBackendEventPayload(world: WorldState, event: string) {
  return {
    event,
    worldState: reconstructWorldState(world),
    startupId: world.startup_id ?? world.startupId,
  };
}

export function toBackendTimelapsePayload(world: WorldState, months = 6) {
  return {
    worldState: reconstructWorldState(world),
    months,
  };
}

export function normalizeTimelapseResponse(raw: unknown): WorldState[] {
  if (!raw || typeof raw !== "object") return [];
  const r = raw as Record<string, any>;
  if (Array.isArray(r.rounds)) return r.rounds.map(normalizeWarRoomResponse);
  if (Array.isArray(r.roundSummaries)) {
    return r.roundSummaries.map((s: unknown) => normalizeWarRoomResponse(s));
  }
  if (r.finalWorldState) return [normalizeWarRoomResponse(r.finalWorldState)];
  return [];
}

export function getRoundEvent(world: WorldState): string {
  return (
    world.current_event ??
    world.currentEvent ??
    world.event ??
    world.lastEvent ??
    "Boardroom session"
  );
}
