import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Swords, LineChart, Sparkles, Zap, Network } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VentureOS — Build. Analyze. Simulate." },
      { name: "description", content: "AI operating system for founders, investors, and startup teams." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="overflow-hidden">
      {/* HERO */}
      <section className="relative min-h-[calc(100vh-6rem)] grid-bg bg-hero">
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute size-1 rounded-full bg-white/40"
              style={{ left: `${(i * 53) % 100}%`, top: `${(i * 37) % 100}%` }}
              animate={{ y: [0, -20, 0], opacity: [0.2, 0.7, 0.2] }}
              transition={{ duration: 4 + (i % 5), repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </div>

        <div className="relative mx-auto max-w-5xl px-6 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground"
          >
            <Sparkles className="size-3.5" /> Now in private beta
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-6 text-5xl md:text-7xl font-bold tracking-tight"
          >
            <span className="text-gradient">Build. Analyze. Simulate.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
          >
            An AI operating system for founders, investors, and startup teams. Get venture-grade analysis and run multi-agent boardroom simulations.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 flex flex-wrap justify-center gap-3"
          >
            <Link to="/venture-intel" className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground shadow-glow transition hover:opacity-90">
              Launch Venture Intel <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link to="/war-room" className="inline-flex items-center gap-2 rounded-full glass px-6 py-3 font-medium hover:bg-white/10 transition">
              Enter War Room <Swords className="size-4" />
            </Link>
          </motion.div>

          {/* floating cards */}
          <div className="mt-20 grid gap-4 md:grid-cols-3 text-left">
            {[
              { icon: Brain, title: "Venture Intel", body: "AI analyst that scores your startup across market, competition, risk and strategy." },
              { icon: Swords, title: "War Room", body: "Six AI agents debate every decision. Coalitions form. Consequences ripple." },
              { icon: LineChart, title: "Timelapse", body: "Replay your startup's history with cinematic playback controls." },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6"
              >
                <f.icon className="size-6 text-accent" />
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* VENTURE INTEL */}
      <Section
        eyebrow="Mode 01"
        title="Venture-grade analysis in minutes"
        body="Submit your idea and watch four AI analysts dissect the market, surface competitors, map risks, and architect strategy."
        icon={Brain}
        ctaTo="/venture-intel"
        ctaLabel="Try Venture Intel"
      />

      {/* WAR ROOM */}
      <Section
        eyebrow="Mode 02"
        title="A boardroom that argues back"
        body="Six AI agents — CEO, CTO, PM, Marketing, Finance, Investor — debate every event. Their relationships, moods and influence shape outcomes."
        icon={Network}
        ctaTo="/war-room"
        ctaLabel="Enter War Room"
        reverse
      />

      {/* TIMELINE */}
      <Section
        eyebrow="Replay"
        title="Cinematic timelapse"
        body="Watch your startup's evolution play back. Scrub through rounds, decisions, and consequences."
        icon={Zap}
        ctaTo="/timelapse"
        ctaLabel="View Timelapse"
      />

      {/* CTA */}
      <section className="px-6 py-32">
        <div className="mx-auto max-w-3xl text-center glass-strong rounded-3xl p-12 shadow-glow">
          <h2 className="text-4xl font-bold">Ready to operate at venture speed?</h2>
          <p className="mt-4 text-muted-foreground">Start a free analysis. No signup required.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/venture-intel" className="rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground shadow-glow">
              Launch Venture Intel
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 px-6 py-10 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} VentureOS · Built for founders
      </footer>
    </div>
  );
}

function Section({
  eyebrow, title, body, icon: Icon, ctaTo, ctaLabel, reverse,
}: {
  eyebrow: string; title: string; body: string; icon: any; ctaTo: string; ctaLabel: string; reverse?: boolean;
}) {
  return (
    <section className="px-6 py-32">
      <div className={`mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2 ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}>
        <motion.div
          initial={{ opacity: 0, x: reverse ? 40 : -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-accent">
            <Icon className="size-4" /> {eyebrow}
          </div>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">{title}</h2>
          <p className="mt-4 text-muted-foreground text-lg">{body}</p>
          <Link to={ctaTo as any} className="mt-8 inline-flex items-center gap-2 rounded-full glass px-5 py-2.5 font-medium hover:bg-white/10 transition">
            {ctaLabel} <ArrowRight className="size-4" />
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="glass-strong aspect-square rounded-3xl p-8 shadow-elegant grid-bg"
        >
          <div className="size-full rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center">
            <Icon className="size-24 text-white/80" strokeWidth={1} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
