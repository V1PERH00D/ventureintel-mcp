import { motion } from "framer-motion";
import { Crown, Swords } from "lucide-react";
import { agentStyle } from "./constants";

interface CoalitionVisualizerProps {
  winningCoalition: string[];
  opposingCoalition: string[];
  influence: Record<string, number>;
}

function coalitionTotal(members: string[], influence: Record<string, number>) {
  return members.reduce((sum, m) => sum + (influence[m] ?? 50), 0);
}

function CoalitionSide({
  title,
  members,
  total,
  variant,
  delay,
}: {
  title: string;
  members: string[];
  total: number;
  variant: "win" | "opp";
  delay: number;
}) {
  const isWin = variant === "win";
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
      className={`flex-1 rounded-2xl border p-6 ${
        isWin
          ? "border-success/40 bg-success/5 shadow-[0_0_40px_rgba(34,197,94,0.15)]"
          : "border-destructive/40 bg-destructive/5 shadow-[0_0_40px_rgba(239,68,68,0.12)]"
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        {isWin ? <Crown className="size-5 text-success" /> : <Swords className="size-5 text-destructive" />}
        <h3 className={`text-lg font-bold ${isWin ? "text-success" : "text-destructive"}`}>{title}</h3>
      </div>

      <div className="space-y-2 mb-6">
        {members.map((agent, i) => {
          const style = agentStyle(agent);
          const inf = influence[agent] ?? 50;
          return (
            <motion.div
              key={agent}
              initial={{ opacity: 0, x: isWin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.08 * i }}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 ${style.bg} ${style.border}`}
            >
              <div className="flex items-center gap-3">
                <div className={`size-9 rounded-lg flex items-center justify-center font-bold text-sm ${style.text}`}>
                  {agent[0]}
                </div>
                <span className={`font-semibold ${style.text}`}>{agent}</span>
              </div>
              <span className="text-xs text-muted-foreground">Inf {inf}</span>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: delay + 0.3 }}
        className="rounded-xl bg-black/20 px-4 py-3 text-center"
      >
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Total Influence</div>
        <motion.div
          key={total}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className={`text-4xl font-bold mt-1 ${isWin ? "text-success" : "text-destructive"}`}
        >
          {total}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function CoalitionVisualizer({ winningCoalition, opposingCoalition, influence }: CoalitionVisualizerProps) {
  const winTotal = coalitionTotal(winningCoalition, influence);
  const oppTotal = coalitionTotal(opposingCoalition, influence);
  const winPct = winTotal + oppTotal > 0 ? (winTotal / (winTotal + oppTotal)) * 100 : 50;

  return (
    <div className="glass-strong rounded-3xl p-6 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-destructive/5 pointer-events-none" />

      <div className="relative">
        <div className="text-center mb-6">
          <div className="text-xs uppercase tracking-[0.2em] text-accent">Power Struggle</div>
          <h2 className="text-2xl md:text-3xl font-bold mt-1">Coalition Battle</h2>
          <div className="mt-3 mx-auto max-w-md h-2 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-success to-destructive"
              initial={{ width: 0 }}
              animate={{ width: `${winPct}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch gap-4 lg:gap-6">
          <CoalitionSide
            title="Winning Coalition"
            members={winningCoalition}
            total={winTotal}
            variant="win"
            delay={0.1}
          />

          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            className="flex items-center justify-center shrink-0"
          >
            <div className="size-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-black text-xl text-muted-foreground">
              VS
            </div>
          </motion.div>

          <CoalitionSide
            title="Opposing Coalition"
            members={opposingCoalition}
            total={oppTotal}
            variant="opp"
            delay={0.2}
          />
        </div>
      </div>
    </div>
  );
}
