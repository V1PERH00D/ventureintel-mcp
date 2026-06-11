import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import type { DelayedConsequenceItem } from "./constants";

const FALLBACK: DelayedConsequenceItem[] = [
  { fireAtRound: 4, description: "Infrastructure strain from aggressive growth push" },
  { fireAtRound: 5, description: "Investor audit triggered by marketing overspend" },
  { fireAtRound: 6, description: "Customer churn as support capacity breaks" },
];

export function ConsequenceTimeline({ consequences }: { consequences: DelayedConsequenceItem[] }) {
  const items = consequences.length > 0 ? consequences : FALLBACK;
  const sorted = [...items].sort((a, b) => a.fireAtRound - b.fireAtRound);

  return (
    <div className="glass-strong rounded-2xl p-6">
      <div className="flex items-center gap-2 text-sm font-semibold mb-6">
        <AlertTriangle className="size-4 text-warning" />
        Consequence Timeline
      </div>

      <div className="relative pl-8">
        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-warning/60 via-warning/30 to-transparent" />

        <div className="space-y-6">
          {sorted.map((item, i) => (
            <motion.div
              key={`${item.fireAtRound}-${i}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.12 }}
              className="relative flex gap-4"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 0 rgba(251,191,36,0)",
                    "0 0 20px rgba(251,191,36,0.6)",
                    "0 0 0 rgba(251,191,36,0)",
                  ],
                }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
                className="absolute -left-8 top-1 size-[22px] rounded-full border-2 border-warning bg-warning/20 flex items-center justify-center"
              >
                <span className="size-2 rounded-full bg-warning" />
              </motion.div>

              <div className="flex-1 rounded-xl border border-warning/20 bg-warning/5 px-4 py-3">
                <div className="text-xs font-bold uppercase tracking-widest text-warning">
                  Round {item.fireAtRound}
                </div>
                <div className="mt-1 text-sm text-foreground/90">{item.description}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
