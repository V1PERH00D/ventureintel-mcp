import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Flame } from "lucide-react";
import type { WorldState } from "../../lib/api";
import { agentStyle } from "./constants";

interface FeedEntry {
  id: string;
  agent: string;
  stance?: string;
  message: string;
  tone?: "stance" | "rebuttal" | "memory" | "narrative";
}

const FALLBACK_DEBATE: FeedEntry[] = [
  { id: "f1", agent: "CEO", stance: "Offensive", message: "We cannot sit still while competitors buy the market. Speed is our only moat.", tone: "stance" },
  { id: "f2", agent: "Finance", stance: "Conservative", message: "Every dollar we burn on panic-spend is a month off our runway. Show me ROI first.", tone: "rebuttal" },
  { id: "f3", agent: "Marketing", stance: "Aggressive", message: "Finance is treating growth like a luxury. If we go quiet, we are invisible by Q3.", tone: "rebuttal" },
  { id: "f4", agent: "Investor", stance: "Watchful", message: "I did not write checks for a company that debates while the window closes.", tone: "rebuttal" },
  { id: "f5", agent: "CTO", stance: "Measured", message: "We can ship the flagship sprint in six weeks — but only if we stop thrashing priorities.", tone: "stance" },
  { id: "f6", agent: "PM", stance: "User-first", message: "Our users don't care about competitor funding. They care that we solve their pain today.", tone: "stance" },
];

function parseFeedLine(line: string): { agent: string; message: string } {
  const match = line.match(/^([A-Za-z]+)\s*:\s*(.+)$/);
  if (match) return { agent: match[1], message: match[2] };
  return { agent: "Board", message: line };
}

function pushEntry(entries: FeedEntry[], entry: FeedEntry) {
  if (!entry.message?.trim()) return;
  if (entries.some((e) => e.id === entry.id)) return;
  entries.push(entry);
}

function buildFeed(world: WorldState | null | undefined): FeedEntry[] {
  if (!world) return FALLBACK_DEBATE;

  const entries: FeedEntry[] = [];

  for (const line of world.liveDebateFeed ?? []) {
    if (typeof line === "string") {
      const { agent, message } = parseFeedLine(line);
      pushEntry(entries, { id: `live-${agent}-${entries.length}`, agent, message, tone: "rebuttal" });
    }
  }

  for (const v of world.agentVoices ?? []) {
    const agent = v.agent ?? v.name ?? "Agent";
    if (v.summary) {
      pushEntry(entries, {
        id: `voice-${agent}-summary`,
        agent,
        stance: v.stance,
        message: v.summary,
        tone: "stance",
      });
    }
    if (v.rebuttal) {
      pushEntry(entries, {
        id: `voice-${agent}-rebuttal`,
        agent,
        stance: v.stance,
        message: typeof v.rebuttal === "string" ? v.rebuttal : v.rebuttal.rebuttal ?? "",
        tone: "rebuttal",
      });
    }
  }

  const rebuttals = world.rebuttalOutputs ?? world.rebuttalFeed ?? [];
  for (const r of rebuttals) {
    if (typeof r === "string") {
      const { agent, message } = parseFeedLine(r);
      pushEntry(entries, { id: `feed-${agent}-${entries.length}`, agent, message, tone: "rebuttal" });
      continue;
    }
    const agent = r.agent ?? "Agent";
    const text = r.rebuttal ?? r.message ?? r.text;
    pushEntry(entries, { id: `reb-${agent}`, agent, message: text, tone: "rebuttal" });
  }

  const memory = world.agentMemory ?? world.worldState?.agentMemory ?? {};
  for (const [agent, mem] of Object.entries(memory)) {
    const m = mem as any;
    const learnings = m?.learnings ?? [];
    const concerns = m?.recentConcerns ?? m?.concerns ?? [];
    const memText =
      learnings[learnings.length - 1] ??
      concerns[concerns.length - 1] ??
      m?.currentStance ??
      m?.stance ??
      m?.concern;
    if (memText) {
      pushEntry(entries, {
        id: `mem-${agent}`,
        agent,
        message: String(memText),
        tone: "memory",
      });
    }
  }

  if (world.narrative) {
    pushEntry(entries, {
      id: "narrative",
      agent: "Board",
      message: world.narrative,
      tone: "narrative",
    });
  }

  if (entries.length === 0) {
    for (const a of world.agents ?? []) {
      if (a.stance) {
        pushEntry(entries, {
          id: `agent-${a.name}`,
          agent: a.name,
          stance: a.stance,
          message: `${a.stance}. Mood: ${a.mood ?? "focused"}. Confidence at ${a.confidence}%.`,
          tone: "stance",
        });
      }
    }
  }

  return entries.length > 0 ? entries : FALLBACK_DEBATE;
}

export function BoardroomFeed({ world }: { world: WorldState | null | undefined }) {
  const feed = useMemo(() => buildFeed(world), [world]);

  return (
    <div className="glass-strong rounded-2xl p-4 flex flex-col h-full min-h-[520px]">
      <div className="flex items-center gap-2 text-sm font-semibold mb-3">
        <MessageSquare className="size-4 text-accent" />
        Boardroom Feed
        <span className="ml-auto flex items-center gap-1 text-[10px] text-warning font-normal">
          <Flame className="size-3" /> LIVE DEBATE
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[640px]">
        <AnimatePresence initial={false}>
          {feed.map((entry, i) => {
            const style = agentStyle(entry.agent);
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -24, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ delay: i * 0.04, type: "spring", stiffness: 260, damping: 22 }}
                className={`rounded-xl border p-3 ${style.bg} ${style.border} ${style.ring}`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`size-7 rounded-lg flex items-center justify-center text-xs font-bold ${style.text} bg-black/20`}>
                    {entry.agent[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold ${style.text}`}>{entry.agent}</div>
                    {entry.stance && (
                      <div className="text-[10px] text-muted-foreground truncate">{entry.stance}</div>
                    )}
                  </div>
                  {entry.tone === "rebuttal" && (
                    <span className="text-[9px] uppercase tracking-wider text-destructive font-semibold">Rebuttal</span>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">{entry.message}</p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
