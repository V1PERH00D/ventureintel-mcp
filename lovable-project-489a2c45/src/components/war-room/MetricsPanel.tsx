import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { Counter } from "../Counter";
import { getCompanyMetrics } from "./constants";
import type { WorldState } from "../../lib/api";

export function MetricsPanel({ world }: { world: WorldState | null | undefined }) {
  const m = getCompanyMetrics(world);

  const items: { key: string; label: string; value: number; fmt: (n: number) => string; bar?: boolean }[] = [
    { key: "budget", label: "Budget", value: m.budget, fmt: (n) => "$" + n.toLocaleString() },
    { key: "runway", label: "Runway (mo)", value: m.runway, fmt: (n) => String(n) },
    { key: "growth", label: "Growth", value: m.growth, fmt: (n) => n + "%", bar: true },
    { key: "morale", label: "Morale", value: m.morale, fmt: (n) => n + "%", bar: true },
    { key: "investorConfidence", label: "Investor Conf.", value: m.investorConfidence, fmt: (n) => n + "%", bar: true },
    { key: "technicalDebt", label: "Tech Debt", value: m.technicalDebt, fmt: (n) => n + "%", bar: true },
    { key: "marketFit", label: "Market Fit", value: m.marketFit, fmt: (n) => n + "%", bar: true },
    { key: "productQuality", label: "Product Quality", value: m.productQuality, fmt: (n) => n + "%", bar: true },
    { key: "brandReputation", label: "Brand Rep.", value: m.brandReputation, fmt: (n) => n + "%", bar: true },
  ];

  return (
    <div className="glass-strong rounded-2xl p-4 h-full min-h-[520px]">
      <div className="flex items-center gap-2 text-sm font-semibold mb-3">
        <BarChart3 className="size-4 text-accent" />
        Company Metrics
      </div>

      <div className="space-y-2">
        {items.map((item, i) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-lg bg-white/5 px-3 py-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{item.label}</span>
              <span className="text-sm font-semibold">
                <Counter value={item.value} format={item.fmt} />
              </span>
            </div>
            {item.bar && (
              <div className="mt-1.5 h-1 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.max(0, item.value))}%` }}
                  transition={{ duration: 0.8, delay: i * 0.05 }}
                  className="h-full"
                  style={{
                    background:
                      item.key === "technicalDebt"
                        ? "linear-gradient(90deg, oklch(0.78 0.18 80), oklch(0.65 0.24 25))"
                        : "var(--gradient-primary)",
                  }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
