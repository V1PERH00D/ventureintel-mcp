import type { VentureAnalysis } from "./api";

export function normalizeVentureAnalysis(raw: unknown, fallback?: VentureAnalysis): VentureAnalysis {
  const base = fallback ?? {};
  if (!raw || typeof raw !== "object") return base;

  const r = raw as Record<string, any>;
  const scores = r.scores ?? {};
  const report = r.report ?? {};
  const sections = report.sections ?? r.report_sections ?? {};
  const synthesis =
    report.final_synthesis ??
    r.final_report ??
    r.raw_report ??
    sections.executive_summary ??
    base.raw_report ??
    "";

  return {
    ...base,
    session_id: r.session_id ?? base.session_id,
    verdict: r.verdict ?? base.verdict,
    startup_idea: r.startup_idea ?? base.startup_idea,
    target_market: r.target_market ?? base.target_market,
    scores: {
      overall: scores.overall ?? scores.composite ?? base.scores?.overall ?? 0,
      confidence: scores.confidence ?? scores.timing ?? base.scores?.confidence ?? 70,
      market: scores.market ?? base.scores?.market ?? 0,
      competitive: scores.competitive ?? scores.competition ?? base.scores?.competitive ?? 0,
      risk: scores.risk ?? base.scores?.risk ?? 0,
      strategic: scores.strategic ?? scores.execution ?? base.scores?.strategic ?? 0,
    },
    market: r.market?.tam ? r.market : base.market,
    competition: r.competition?.competitors ? r.competition : base.competition,
    risk: r.risk?.items ? r.risk : base.risk,
    strategy: r.strategy?.mvp ? r.strategy : base.strategy,
    raw_report: synthesis,
    report,
    sections,
  };
}
