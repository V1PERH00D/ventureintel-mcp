import { createFileRoute } from '@tanstack/react-router'
import { Fragment } from "react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ventureAnalyze, ventureChat, type VentureAnalyzeInput } from "../lib/api";
import { normalizeVentureAnalysis } from "../lib/venture-normalize";
import { mockAnalysis } from "../lib/mock";
import { useApp } from "../lib/store";
import {
  Brain, TrendingUp, Shield, Target, Send, Copy, Download, FileText, Printer,
  MessageSquare, X, CheckCircle2,
} from "lucide-react";
import { RadialBarChart, RadialBar, PolarAngleAxis, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";

export const Route = createFileRoute("/venture-intel")({
  head: () => ({ meta: [{ title: "Venture Intel — VentureOS" }] }),
  component: VentureIntel,
});

const ANALYSTS = [
  { name: "Market Analyst", icon: TrendingUp, color: "from-cyan-500 to-blue-500", tasks: ["Sizing TAM/SAM", "Growth dynamics", "Segment mapping"] },
  { name: "Competitive Intelligence", icon: Target, color: "from-fuchsia-500 to-purple-500", tasks: ["Competitor scan", "Moat analysis", "Threat modeling"] },
  { name: "Risk Assessment", icon: Shield, color: "from-amber-500 to-red-500", tasks: ["Risk heatmap", "Mitigations", "Downside cases"] },
  { name: "Startup Advisor", icon: Brain, color: "from-emerald-500 to-teal-500", tasks: ["GTM strategy", "Fundraising path", "Milestone plan"] },
];

function VentureIntel() {
  const { analysis, setAnalysis } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<VentureAnalyzeInput>({
    startup_idea: "",
    target_market: "",
    founder_context: "",
    stage: "Idea",
    industry: "",
    geography: "Global",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const started = Date.now();
    const minLoadMs = 12000;
    const mock = mockAnalysis(form.startup_idea, form.target_market);

    try {
      const res = await ventureAnalyze(form);
      const normalized = normalizeVentureAnalysis(res, mock);
      const wait = minLoadMs - (Date.now() - started);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      setAnalysis(normalized);
    } catch {
      const wait = minLoadMs - (Date.now() - started);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      setError("Live backend unavailable — showing demo analysis.");
      setAnalysis(mock);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingExperience />;
  if (analysis) return <Results onReset={() => setAnalysis(null)} />;

  return (
    <div className="mx-auto max-w-4xl px-6 pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-xs uppercase tracking-widest text-accent">Venture Intel</div>
        <h1 className="mt-2 text-4xl md:text-5xl font-bold">Tell us about your startup</h1>
        <p className="mt-3 text-muted-foreground">Four AI analysts will deliver a venture-grade report.</p>
      </motion.div>

      <form onSubmit={submit} className="mt-10 glass-strong rounded-3xl p-8 space-y-5">
        <Field label="Startup Idea *" hint="At least 20 characters">
          <textarea required minLength={20} rows={3} value={form.startup_idea}
            onChange={(e) => setForm({ ...form, startup_idea: e.target.value })}
            className="w-full rounded-xl bg-input/60 px-4 py-3 outline-none focus:ring-2 focus:ring-primary" />
        </Field>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Target Market *">
            <input required value={form.target_market}
              onChange={(e) => setForm({ ...form, target_market: e.target.value })}
              className="w-full rounded-xl bg-input/60 px-4 py-3 outline-none focus:ring-2 focus:ring-primary" />
          </Field>
          <Field label="Industry">
            <input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })}
              className="w-full rounded-xl bg-input/60 px-4 py-3 outline-none focus:ring-2 focus:ring-primary" />
          </Field>
          <Field label="Stage">
            <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}
              className="w-full rounded-xl bg-input/60 px-4 py-3 outline-none focus:ring-2 focus:ring-primary">
              {["Idea", "Pre-seed", "Seed", "Series A", "Series B+"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Geography">
            <input value={form.geography} onChange={(e) => setForm({ ...form, geography: e.target.value })}
              className="w-full rounded-xl bg-input/60 px-4 py-3 outline-none focus:ring-2 focus:ring-primary" />
          </Field>
        </div>
        <Field label="Founder Context">
          <textarea rows={2} value={form.founder_context}
            onChange={(e) => setForm({ ...form, founder_context: e.target.value })}
            className="w-full rounded-xl bg-input/60 px-4 py-3 outline-none focus:ring-2 focus:ring-primary" />
        </Field>
        {error && <div className="text-sm text-warning">{error}</div>}
        <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 font-semibold text-primary-foreground shadow-glow hover:opacity-90 transition">
          Generate Analysis
        </button>
      </form>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

function LoadingExperience() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [completed, setCompleted] = useState<boolean[]>([false, false, false, false]);
  const [progress, setProgress] = useState<number[]>([0, 0, 0, 0]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    ANALYSTS.forEach((_, i) => {
      timers.push(
        setTimeout(() => setActiveIndex(i), i * 3200),
      );
      timers.push(
        setTimeout(() => {
          setProgress((p) => {
            const next = [...p];
            next[i] = 100;
            return next;
          });
          setCompleted((c) => {
            const next = [...c];
            next[i] = true;
            return next;
          });
        }, i * 3200 + 2800),
      );
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (activeIndex >= ANALYSTS.length) return;
    if (completed[activeIndex]) return;

    const interval = setInterval(() => {
      setProgress((p) => {
        const next = [...p];
        if (next[activeIndex] < 92) next[activeIndex] += 4 + Math.random() * 6;
        return next;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [activeIndex, completed]);

  const allDone = completed.every(Boolean);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold">Our analysts are at work</h2>
        <p className="mt-2 text-muted-foreground">
          {allDone ? "Synthesizing final report..." : "Sequential deep-dive in progress"}
        </p>
      </motion.div>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {ANALYSTS.map((a, i) => {
          const isActive = i === activeIndex && !completed[i];
          const isComplete = completed[i];
          const isPending = i > activeIndex && !completed[i];

          return (
            <motion.div
              key={a.name}
              initial={{ opacity: 0, y: 24 }}
              animate={{
                opacity: isPending ? 0.45 : 1,
                y: 0,
                scale: isActive ? 1.02 : 1,
              }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
              className={`glass-strong rounded-2xl p-6 border transition-colors ${
                isActive ? "border-primary/50 shadow-glow" : isComplete ? "border-success/30" : "border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={isActive ? { rotate: [0, 3, -3, 0] } : {}}
                  transition={{ duration: 0.6, repeat: isActive ? Infinity : 0 }}
                  className={`size-12 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center`}
                >
                  <a.icon className="size-6 text-white" />
                </motion.div>
                <div className="flex-1">
                  <div className="font-semibold">{a.name}</div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isComplete ? "done" : isActive ? "active" : "wait"}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs text-muted-foreground"
                    >
                      {isComplete
                        ? "Analysis complete"
                        : isActive
                          ? a.tasks[Math.floor((progress[i] / 100) * a.tasks.length)] ?? "Analyzing..."
                          : "Queued"}
                    </motion.div>
                  </AnimatePresence>
                </div>
                {isComplete ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                    <CheckCircle2 className="size-5 text-success" />
                  </motion.div>
                ) : isActive ? (
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="size-2 rounded-full bg-accent"
                  />
                ) : null}
              </div>

              <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: isComplete
                      ? "oklch(0.72 0.18 150)"
                      : "var(--gradient-primary)",
                  }}
                  animate={{ width: `${progress[i]}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {isActive && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 flex flex-wrap gap-1.5"
                >
                  {a.tasks.map((task, ti) => (
                    <span
                      key={task}
                      className={`rounded-full px-2 py-0.5 text-[10px] ${
                        progress[i] > (ti + 1) * 30 ? "bg-success/20 text-success" : "bg-white/5 text-muted-foreground"
                      }`}
                    >
                      {task}
                    </span>
                  ))}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

const TABS = ["Overview", "Market", "Competition", "Risk", "Strategy", "Raw Report"] as const;

function Results({ onReset }: { onReset: () => void }) {
  const { analysis } = useApp();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const [chatOpen, setChatOpen] = useState(false);

  if (!analysis) return null;

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-widest text-accent">Analysis Report</div>
          <h1 className="mt-1 text-3xl font-bold">Your venture report</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setChatOpen(true)} className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm hover:bg-white/10">
            <MessageSquare className="size-4" /> Ask AI
          </button>
          <button onClick={onReset} className="rounded-full glass px-4 py-2 text-sm hover:bg-white/10">New analysis</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 glass-strong rounded-full p-1 inline-flex flex-wrap">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm transition ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="mt-8">
        <AnimatePresence mode="wait">
          <motion.div key={tab}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {tab === "Overview" && <Overview />}
            {tab === "Market" && <Market />}
            {tab === "Competition" && <Competition />}
            {tab === "Risk" && <Risk />}
            {tab === "Strategy" && <Strategy />}
            {tab === "Raw Report" && <RawReport />}
          </motion.div>
        </AnimatePresence>
      </div>

      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  const data = [{ name: label, value, fill: "url(#g1)" }];
  return (
    <div className="glass-strong rounded-2xl p-5">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="h-32 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="70%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
            <defs>
              <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.72 0.18 280)" />
                <stop offset="100%" stopColor="oklch(0.7 0.2 200)" />
              </linearGradient>
            </defs>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" cornerRadius={20} background={{ fill: "oklch(1 0 0 / 0.05)" }} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center -mt-20 text-3xl font-bold">{value}</div>
      <div className="mt-16" />
    </div>
  );
}

function Overview() {
  const { analysis } = useApp();
  const s = analysis?.scores ?? {};
  return (
    <div className="grid gap-5 md:grid-cols-3">
      <ScoreCard label="Overall" value={s.overall ?? 0} />
      <ScoreCard label="Confidence" value={s.confidence ?? 0} />
      <ScoreCard label="Market" value={s.market ?? 0} />
      <ScoreCard label="Competitive" value={s.competitive ?? 0} />
      <ScoreCard label="Risk" value={s.risk ?? 0} />
      <ScoreCard label="Strategic" value={s.strategic ?? 0} />
    </div>
  );
}

function Market() {
  const { analysis } = useApp();
  const m = analysis?.market ?? {};
  const segments = m.segments ?? [];
  const COLORS = ["#a78bfa", "#22d3ee", "#34d399", "#fbbf24"];
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {["tam", "sam", "som"].map((k) => (
        <div key={k} className="glass-strong rounded-2xl p-6">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">{k}</div>
          <div className="mt-3 text-4xl font-bold text-gradient">{m[k] ?? "—"}</div>
        </div>
      ))}
      <div className="glass-strong rounded-2xl p-6 md:col-span-2">
        <div className="text-sm font-semibold mb-3">Customer segments</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={segments} dataKey="size" nameKey="name" innerRadius={50} outerRadius={90}>
                {segments.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "oklch(0.2 0.02 270)", border: "none", borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="glass-strong rounded-2xl p-6">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Growth</div>
        <div className="mt-3 text-3xl font-bold">{m.growth ?? "—"}</div>
      </div>
    </div>
  );
}

function Competition() {
  const { analysis } = useApp();
  const c = analysis?.competition ?? {};
  return (
    <div className="space-y-5">
      <div className="glass-strong rounded-2xl p-6">
        <div className="text-sm font-semibold mb-4">Competitors</div>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={c.competitors ?? []}>
              <XAxis dataKey="name" stroke="oklch(0.68 0.02 270)" />
              <YAxis stroke="oklch(0.68 0.02 270)" />
              <Tooltip contentStyle={{ background: "oklch(0.2 0.02 270)", border: "none", borderRadius: 12 }} />
              <Bar dataKey="strength" fill="oklch(0.72 0.18 280)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="glass-strong rounded-2xl p-6">
          <div className="text-sm font-semibold mb-3">Moats</div>
          <ul className="space-y-2">{(c.moats ?? []).map((m: string) => <li key={m} className="rounded-lg bg-white/5 px-3 py-2 text-sm">{m}</li>)}</ul>
        </div>
        <div className="glass-strong rounded-2xl p-6">
          <div className="text-sm font-semibold mb-3">Threats</div>
          <ul className="space-y-2">{(c.threats ?? []).map((t: string) => <li key={t} className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{t}</li>)}</ul>
        </div>
        <div className="glass-strong rounded-2xl p-6 md:col-span-2">
          <div className="text-sm font-semibold mb-2">Differentiation</div>
          <p className="text-muted-foreground">{c.differentiation}</p>
        </div>
      </div>
    </div>
  );
}

function Risk() {
  const { analysis } = useApp();
  const r = analysis?.risk ?? {};
  const items = r.items ?? [];
  return (
    <div className="grid gap-5 md:grid-cols-3">
      <div className="md:col-span-2 glass-strong rounded-2xl p-6">
        <div className="text-sm font-semibold mb-3">Risk heatmap</div>
        <div className="grid grid-cols-6 gap-1 text-xs">
          <div></div>
          {[1,2,3,4,5].map((i) => <div key={i} className="text-center text-muted-foreground">L{i}</div>)}
          {[5,4,3,2,1].map((imp) => (
            <Fragment key={`row-${imp}`}>
              <div className="text-muted-foreground self-center">I{imp}</div>
              {[1,2,3,4,5].map((lik) => {
                const hit = items.find((x: any) => x.likelihood === lik && x.impact === imp);
                const intensity = (lik * imp) / 25;
                return (
                  <div key={`${lik}-${imp}`}
                    className="aspect-square rounded-md flex items-center justify-center text-[10px] text-center p-1"
                    style={{ background: `oklch(0.65 0.24 ${25 + (1 - intensity) * 130} / ${0.15 + intensity * 0.55})` }}
                  >{hit?.name}</div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
      <div className="glass-strong rounded-2xl p-6">
        <div className="text-sm font-semibold mb-3">Mitigations</div>
        <ul className="space-y-2">{(r.mitigations ?? []).map((m: string) => <li key={m} className="rounded-lg bg-success/10 text-success/90 px-3 py-2 text-sm">{m}</li>)}</ul>
      </div>
    </div>
  );
}

function Strategy() {
  const { analysis } = useApp();
  const s = analysis?.strategy ?? {};
  const sections: [string, any][] = [
    ["MVP Plan", s.mvp], ["Go-to-Market", s.gtm], ["Pricing", s.pricing],
    ["Fundraising", s.fundraising],
  ];
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {sections.map(([k, v]) => (
        <div key={k} className="glass-strong rounded-2xl p-6">
          <div className="text-sm font-semibold mb-2">{k}</div>
          <p className="text-muted-foreground">{v ?? "—"}</p>
        </div>
      ))}
      <div className="glass-strong rounded-2xl p-6 md:col-span-2">
        <div className="text-sm font-semibold mb-3">Roadmap</div>
        <div className="flex flex-wrap gap-2">
          {(s.roadmap ?? []).map((r: string, i: number) => (
            <div key={i} className="rounded-full bg-primary/20 text-primary-foreground px-4 py-2 text-sm">{i + 1}. {r}</div>
          ))}
        </div>
        <div className="mt-5 text-sm font-semibold mb-2">Milestones</div>
        <ul className="space-y-2">{(s.milestones ?? []).map((m: string) => <li key={m} className="rounded-lg bg-white/5 px-3 py-2 text-sm">✦ {m}</li>)}</ul>
      </div>
    </div>
  );
}

function RawReport() {
  const { analysis } = useApp();
  const text =
    analysis?.raw_report ??
    analysis?.report?.final_synthesis ??
    JSON.stringify(analysis, null, 2);
  const copy = () => navigator.clipboard.writeText(text);
  const download = (name: string) => {
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="glass-strong rounded-2xl p-6">
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={copy} className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm hover:bg-white/10"><Copy className="size-4" /> Copy</button>
        <button onClick={() => download("report.md")} className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm hover:bg-white/10"><Download className="size-4" /> Download</button>
        <button onClick={() => download("investor-memo.md")} className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm hover:bg-white/10"><FileText className="size-4" /> Investor Memo</button>
        <button onClick={() => download("exec-summary.md")} className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm hover:bg-white/10"><FileText className="size-4" /> Exec Summary</button>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm hover:bg-white/10"><Printer className="size-4" /> Print</button>
      </div>
      <pre className="whitespace-pre-wrap text-sm font-mono text-muted-foreground max-h-[600px] overflow-auto">{text}</pre>
    </div>
  );
}

function ChatPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { analysis, chatHistory, appendChat } = useApp();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const prompts = ["What's our biggest risk?", "How should we approach fundraising?", "Who are our top 3 competitors?"];

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg) return;
    appendChat({ role: "user", content: msg });
    setInput("");
    setSending(true);
    try {
      const res = await ventureChat({
        session_id: analysis?.session_id,
        message: msg,
        history: chatHistory,
      });
      const reply = res.reply || res.message || res.response || JSON.stringify(res);
      // streaming sim
      let acc = "";
      appendChat({ role: "assistant", content: "" });
      for (const ch of reply) {
        acc += ch;
        useApp.setState((s) => ({
          chatHistory: s.chatHistory.map((m, i) => i === s.chatHistory.length - 1 ? { ...m, content: acc } : m),
        }));
        await new Promise((r) => setTimeout(r, 8));
      }
    } catch {
      appendChat({ role: "assistant", content: "I'm offline right now, but based on the report, focus on validating market fit first." });
    } finally {
      setSending(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }}
          transition={{ type: "spring", damping: 25 }}
          className="fixed top-0 right-0 bottom-0 w-full max-w-md z-50 glass-strong border-l border-border/50 flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <div className="font-semibold">Ask your analysis</div>
            <button onClick={onClose} className="rounded-full p-2 hover:bg-white/10"><X className="size-4" /></button>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {chatHistory.length === 0 && (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Suggested</div>
                {prompts.map((p) => (
                  <button key={p} onClick={() => send(p)} className="block w-full text-left rounded-xl glass px-3 py-2 text-sm hover:bg-white/10">{p}</button>
                ))}
              </div>
            )}
            {chatHistory.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "glass"}`}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="p-4 border-t border-border/50 flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about your analysis..."
              className="flex-1 rounded-full bg-input/60 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
            <button disabled={sending} className="rounded-full bg-primary text-primary-foreground p-2.5 disabled:opacity-50"><Send className="size-4" /></button>
          </form>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
