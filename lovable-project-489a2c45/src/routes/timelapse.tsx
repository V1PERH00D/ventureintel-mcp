import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { timelapseFetch, type WorldState } from "../lib/api";
import { getRoundEvent } from "../lib/war-room-normalize";
import { getCompanyMetrics } from "../components/war-room/constants";
import { useApp } from "../lib/store";
import { Play, Pause, SkipBack, SkipForward, Gauge } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Counter } from "../components/Counter";

export const Route = createFileRoute("/timelapse")({
  head: () => ({ meta: [{ title: "Timelapse — VentureOS" }] }),
  component: Timelapse,
});

function Timelapse() {
  const { rounds, world } = useApp();
  const [serverRounds, setServerRounds] = useState<WorldState[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (!world) return;
    timelapseFetch({ world_state: world, months: 6 })
      .then((r) => r?.rounds?.length && setServerRounds(r.rounds))
      .catch(() => {});
  }, [world]);

  const data = serverRounds ?? rounds;

  useEffect(() => {
    if (!playing || data.length === 0) return;
    const interval = setInterval(() => {
      setIdx((i) => (i + 1) % data.length);
    }, 1500 / speed);
    return () => clearInterval(interval);
  }, [playing, speed, data.length]);

  if (data.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="text-3xl font-bold">No timelapse yet</h1>
        <p className="mt-3 text-muted-foreground">Run a War Room session first — your rounds will appear here.</p>
      </div>
    );
  }

  const cur = data[idx];
  const curMetrics = getCompanyMetrics(cur);
  const chart = data.map((r, i) => {
    const m = getCompanyMetrics(r);
    return {
      round: i,
      morale: m.morale,
      growth: m.growth,
      confidence: m.investorConfidence,
    };
  });

  return (
    <div className="mx-auto max-w-6xl px-6 pb-20">
      <div className="text-xs uppercase tracking-widest text-accent">Timelapse</div>
      <h1 className="mt-2 text-4xl md:text-5xl font-bold">Replay the journey</h1>

      <div className="mt-8 glass-strong rounded-3xl p-8">
        <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Round {cur.simulationRound ?? cur.round ?? idx}</div>
          <div className="mt-2 text-2xl font-semibold">{getRoundEvent(cur)}</div>
          <div className="mt-1 text-muted-foreground">{cur.decision}</div>
          <div className="mt-4 rounded-xl bg-white/5 p-4 italic">"{cur.narrative}"</div>
        </motion.div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {(
            [
              ["budget", curMetrics.budget, (n: number) => "$" + n.toLocaleString()],
              ["growth", curMetrics.growth, (n: number) => n + "%"],
              ["morale", curMetrics.morale, (n: number) => n + "%"],
              ["market fit", curMetrics.marketFit, (n: number) => n + "%"],
            ] as const
          ).map(([label, value, fmt]) => (
            <div key={label} className="rounded-xl bg-white/5 p-4">
              <div className="text-xs uppercase text-muted-foreground">{label}</div>
              <div className="mt-1 text-2xl font-bold">
                <Counter value={value} format={fmt} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 h-56">
          <ResponsiveContainer>
            <LineChart data={chart}>
              <XAxis dataKey="round" stroke="oklch(0.68 0.02 270)" />
              <YAxis stroke="oklch(0.68 0.02 270)" />
              <Tooltip contentStyle={{ background: "oklch(0.2 0.02 270)", border: "none", borderRadius: 12 }} />
              <Line type="monotone" dataKey="morale" stroke="oklch(0.72 0.18 280)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="growth" stroke="oklch(0.7 0.2 200)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="confidence" stroke="oklch(0.72 0.18 150)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button onClick={() => setIdx(Math.max(0, idx - 1))} className="glass rounded-full p-2.5 hover:bg-white/10"><SkipBack className="size-4" /></button>
          <button onClick={() => setPlaying(!playing)} className="rounded-full bg-primary text-primary-foreground p-3 shadow-glow">
            {playing ? <Pause className="size-5" /> : <Play className="size-5" />}
          </button>
          <button onClick={() => setIdx(Math.min(data.length - 1, idx + 1))} className="glass rounded-full p-2.5 hover:bg-white/10"><SkipForward className="size-4" /></button>
          <input type="range" min={0} max={data.length - 1} value={idx} onChange={(e) => setIdx(+e.target.value)} className="flex-1 accent-primary" />
          <div className="flex items-center gap-1 glass rounded-full p-1">
            {[1, 2, 5].map((s) => (
              <button key={s} onClick={() => setSpeed(s)}
                className={`rounded-full px-3 py-1 text-xs ${speed === s ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                <Gauge className="inline size-3 mr-1" />{s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
