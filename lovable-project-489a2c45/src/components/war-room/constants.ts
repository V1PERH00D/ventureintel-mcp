import type { WorldState } from "../../lib/api";

export const AGENT_COLORS: Record<string, { bg: string; border: string; text: string; ring: string }> = {
  CEO: { bg: "bg-blue-500/15", border: "border-blue-500/40", text: "text-blue-400", ring: "shadow-[0_0_20px_rgba(59,130,246,0.35)]" },
  CTO: { bg: "bg-purple-500/15", border: "border-purple-500/40", text: "text-purple-400", ring: "shadow-[0_0_20px_rgba(168,85,247,0.35)]" },
  PM: { bg: "bg-cyan-500/15", border: "border-cyan-500/40", text: "text-cyan-400", ring: "shadow-[0_0_20px_rgba(34,211,238,0.35)]" },
  Marketing: { bg: "bg-pink-500/15", border: "border-pink-500/40", text: "text-pink-400", ring: "shadow-[0_0_20px_rgba(236,72,153,0.35)]" },
  Finance: { bg: "bg-orange-500/15", border: "border-orange-500/40", text: "text-orange-400", ring: "shadow-[0_0_20px_rgba(249,115,22,0.35)]" },
  Investor: { bg: "bg-red-500/15", border: "border-red-500/40", text: "text-red-400", ring: "shadow-[0_0_20px_rgba(239,68,68,0.35)]" },
};

export function agentStyle(agent: string) {
  const key = Object.keys(AGENT_COLORS).find((k) => agent?.includes(k)) ?? "CEO";
  return AGENT_COLORS[key];
}

export function getCompanyMetrics(world: WorldState | null | undefined) {
  const ws = world?.worldState ?? {};
  const c = { ...ws.company, ...world?.company, ...(typeof world?.metrics === "object" && !Array.isArray(world.metrics) ? world.metrics : {}) };
  const m = world?.metrics ?? {};
  return {
    budget: c.budget ?? m.budget ?? 1_500_000,
    runway: c.runway ?? m.runway ?? 18,
    growth: c.growth ?? m.growth ?? 12,
    morale: c.morale ?? m.morale ?? 75,
    investorConfidence: c.investorConfidence ?? m.investor_confidence ?? 65,
    technicalDebt: c.technicalDebt ?? m.technical_debt ?? 20,
    marketFit: c.marketFit ?? m.market_fit ?? 40,
    productQuality: c.productQuality ?? m.product_quality ?? 55,
    brandReputation: c.brandReputation ?? m.brand_reputation ?? 45,
  };
}

export function getPoliticalTensions(world: WorldState | null | undefined): number {
  const raw =
    world?.political_tensions ??
    world?.politicalTensions ??
    world?.tensionLevel ??
    world?.worldState?.tensionLevel ??
    world?.worldState?.politicalTensions;
  if (raw == null) return 0.3;
  const n = Number(raw);
  if (Number.isNaN(n)) return 0.3;
  return n > 1 ? Math.min(1, n / 100) : Math.min(1, Math.max(0, n));
}

export function getInfluenceMap(world: WorldState | null | undefined): Record<string, number> {
  const map = { ...(world?.worldState?.influence ?? {}), ...(world?.influence ?? {}) };
  for (const a of world?.agents ?? []) {
    if (a.name && map[a.name] == null) map[a.name] = a.influence;
  }
  for (const v of world?.agentVoices ?? []) {
    const name = v.agent ?? v.name;
    if (name && map[name] == null) map[name] = Math.round((v.confidence ?? 0.7) * 100);
  }
  if (Object.keys(map).length === 0) {
    return { CEO: 85, CTO: 70, PM: 60, Marketing: 55, Finance: 65, Investor: 78 };
  }
  return map;
}

export function getWinningCoalition(world: WorldState | null | undefined): string[] {
  return world?.winningCoalition ?? world?.winning_coalition ?? ["CEO", "Marketing", "PM"];
}

export function getOpposingCoalition(world: WorldState | null | undefined): string[] {
  return world?.opposingCoalition ?? world?.opposing_coalition ?? ["Finance", "Investor"];
}

export interface DelayedConsequenceItem {
  fireAtRound: number;
  description: string;
}

export function getDelayedConsequences(world: WorldState | null | undefined): DelayedConsequenceItem[] {
  const raw =
    world?.delayedConsequences ??
    world?.delayed_consequences ??
    world?.worldState?.delayedConsequences ??
    [];
  const round = world?.simulationRound ?? world?.round ?? 1;
  return raw.map((c: any, i: number) => ({
    fireAtRound: c.fireAtRound ?? (round + (c.activates_in ?? i + 3)),
    description: c.description ?? "Pending consequence",
  }));
}
