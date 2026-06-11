import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { startupCreate, warRoomEvent, type StartupCreateInput, type WorldState } from "../lib/api";
import { isWarRoomResponse, normalizeWarRoomResponse, getRoundEvent } from "../lib/war-room-normalize";
import { mockWorld, evolveWorld } from "../lib/mock";
import { useApp } from "../lib/store";
import { Send, Sparkles, Zap } from "lucide-react";
import { BoardroomFeed } from "../components/war-room/BoardroomFeed";
import { CoalitionVisualizer } from "../components/war-room/CoalitionVisualizer";
import { ConsequenceTimeline } from "../components/war-room/ConsequenceTimeline";
import { MetricsPanel } from "../components/war-room/MetricsPanel";
import {
  getDelayedConsequences,
  getInfluenceMap,
  getOpposingCoalition,
  getPoliticalTensions,
  getWinningCoalition,
} from "../components/war-room/constants";

export const Route = createFileRoute("/war-room")({
  head: () => ({ meta: [{ title: "War Room — VentureOS" }] }),
  component: WarRoom,
});

function WarRoom() {
  const { world, setWorld, pushRound } = useApp();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<StartupCreateInput>({
    startup_name: "", industry: "", idea: "", budget: 1500000, runway: 18, team_size: 6, growth_strategy: "PLG",
  });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await startupCreate(form);
      const w = isWarRoomResponse(res) ? normalizeWarRoomResponse(res) : normalizeWarRoomResponse({ ...mockWorld(form.startup_name), ...(res as object) });
      setWorld(w);
      pushRound(w);
    } catch {
      const w = mockWorld(form.startup_name || "Acme");
      setWorld(w);
      pushRound(w);
    } finally {
      setCreating(false);
    }
  }

  if (!world) {
    return (
      <div className="mx-auto max-w-3xl px-6 pb-20">
        <div className="text-xs uppercase tracking-widest text-accent">Mode 02</div>
        <h1 className="mt-2 text-4xl md:text-5xl font-bold">Found your startup</h1>
        <p className="mt-3 text-muted-foreground">Define the parameters. Six AI agents will take it from here.</p>
        <form onSubmit={create} className="mt-8 glass-strong rounded-3xl p-8 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Startup Name"><input required value={form.startup_name} onChange={(e) => setForm({...form, startup_name: e.target.value})} className="input" /></Field>
            <Field label="Industry"><input required value={form.industry} onChange={(e) => setForm({...form, industry: e.target.value})} className="input" /></Field>
            <Field label="Budget ($)"><input type="number" required value={form.budget} onChange={(e) => setForm({...form, budget: +e.target.value})} className="input" /></Field>
            <Field label="Runway (months)"><input type="number" required value={form.runway} onChange={(e) => setForm({...form, runway: +e.target.value})} className="input" /></Field>
            <Field label="Team Size"><input type="number" required value={form.team_size} onChange={(e) => setForm({...form, team_size: +e.target.value})} className="input" /></Field>
            <Field label="Growth Strategy">
              <select value={form.growth_strategy} onChange={(e) => setForm({...form, growth_strategy: e.target.value})} className="input">
                {["PLG", "Sales-led", "Community", "Viral", "Enterprise"].map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Idea"><textarea required rows={3} value={form.idea} onChange={(e) => setForm({...form, idea: e.target.value})} className="input" /></Field>
          <button disabled={creating} className="w-full rounded-xl bg-primary px-6 py-4 font-semibold text-primary-foreground shadow-glow disabled:opacity-50">
            {creating ? "Convening boardroom..." : "Enter War Room"}
          </button>
        </form>
        <style>{`.input{width:100%;border-radius:12px;background:oklch(0.25 0.02 270 / 0.6);padding:12px 16px;outline:none}.input:focus{box-shadow:0 0 0 2px oklch(0.72 0.18 280)}`}</style>
      </div>
    );
  }

  return <Boardroom />;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><div className="mb-2 text-sm font-medium">{label}</div>{children}</label>;
}

function Boardroom() {
  const { world, setWorld, pushRound } = useApp();
  const [event, setEvent] = useState("");
  const [injecting, setInjecting] = useState(false);

  if (!world) return null;

  async function inject(text?: string) {
    const e = (text ?? event).trim();
    if (!e || !world) return;
    setInjecting(true);
    try {
      const res = await warRoomEvent({ event: e, world_state: world });
      const next = isWarRoomResponse(res) ? normalizeWarRoomResponse(res) : evolveWorld(world, e);
      setWorld(next);
      pushRound(next);
    } catch {
      const next = evolveWorld(world, e);
      setWorld(next);
      pushRound(next);
    } finally {
      setInjecting(false);
      setEvent("");
    }
  }

  const examples = ["Competitor raises $20M", "Massive outage", "Regulatory change", "Product goes viral"];

  return (
    <div className="mx-auto max-w-[1500px] px-6 pb-20">
      {/* Status */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{world.company?.name ?? world.startup?.name ?? "Boardroom"}</h1>
          <StatusBadge status={world.status} />
          <div className="text-sm text-muted-foreground">Round {world.simulationRound ?? world.round ?? 0}</div>
        </div>
        <div className="flex-1 max-w-2xl flex gap-2 ml-auto">
          <div className="flex-1 relative">
            <input value={event} onChange={(e) => setEvent(e.target.value)}
              placeholder="Inject an event..."
              onKeyDown={(e) => e.key === "Enter" && inject()}
              className="w-full rounded-full bg-input/60 px-5 py-3 outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <button onClick={() => inject()} disabled={injecting} className="rounded-full bg-primary text-primary-foreground px-5 py-3 font-medium shadow-glow disabled:opacity-50">
            <Send className="size-4" />
          </button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {examples.map((ex) => (
          <button key={ex} onClick={() => inject(ex)} className="rounded-full glass px-3 py-1 text-xs hover:bg-white/10">
            <Sparkles className="inline size-3 mr-1" /> {ex}
          </button>
        ))}
      </div>

      <EventDecisionHeader world={world} />

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(280px,320px)_1fr_minmax(260px,300px)]">
        <BoardroomFeed world={world} />
        <div className="space-y-5 min-w-0">
          <CoalitionVisualizer
            winningCoalition={getWinningCoalition(world)}
            opposingCoalition={getOpposingCoalition(world)}
            influence={getInfluenceMap(world)}
          />
        </div>
        <MetricsPanel world={world} />
      </div>

      <div className="mt-6">
        <ConsequenceTimeline consequences={getDelayedConsequences(world)} />
      </div>

      <DecisionTimeline />
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, string> = {
    OPERATING: "bg-success/20 text-success border-success/30",
    CRITICAL: "bg-warning/20 text-warning border-warning/30",
    BANKRUPT: "bg-destructive/20 text-destructive border-destructive/30",
  };
  return (
    <motion.span
      animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${map[status ?? "OPERATING"] ?? map.OPERATING}`}
    >
      <span className="size-1.5 rounded-full bg-current animate-pulse" /> {status ?? "OPERATING"}
    </motion.span>
  );
}

function EventDecisionHeader({ world }: { world: WorldState }) {
  const currentEvent = getRoundEvent(world);
  const decision = world.decision ?? "Awaiting coalition consensus";
  const round = world.simulationRound ?? world.round ?? 0;
  const tensions = getPoliticalTensions(world);

  return (
    <div className="mt-6 glass-strong rounded-2xl p-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={round}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="grid gap-5 md:grid-cols-2"
        >
          <div>
            <div className="text-xs uppercase tracking-widest text-accent">Current Event</div>
            <div className="mt-2 text-xl md:text-2xl font-semibold leading-snug">{currentEvent}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Decision</div>
            <div className="mt-2 text-lg md:text-xl leading-snug">{decision}</div>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="mt-5">
        <div className="flex justify-between text-xs">
          <span>Political Tensions</span>
          <span>{Math.round(tensions * 100)}%</span>
        </div>
        <div className="mt-1 h-2 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            animate={{ width: `${Math.min(100, tensions * 100)}%` }}
            className="h-full bg-gradient-to-r from-warning to-destructive"
          />
        </div>
      </div>
    </div>
  );
}

function DecisionTimeline() {
  const { rounds } = useApp();
  if (rounds.length === 0) return null;
  return (
    <div className="mt-8 glass-strong rounded-2xl p-6">
      <div className="text-sm font-semibold mb-4 flex items-center gap-2"><Zap className="size-4" /> Decision Timeline</div>
      <div className="space-y-3 max-h-96 overflow-auto">
        {rounds.slice().reverse().map((r, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="flex gap-4 rounded-xl bg-white/5 p-4"
          >
            <div className="size-10 shrink-0 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: "var(--gradient-primary)" }}>
              {r.round ?? 0}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium">{getRoundEvent(r)}</div>
              <div className="text-sm text-muted-foreground">→ {r.decision}</div>
              <div className="mt-1 text-xs italic text-muted-foreground">{r.narrative}</div>
            </div>
            <StatusBadge status={r.status} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

