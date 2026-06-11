import { useEffect, useState } from "react";

export function Counter({ value, duration = 800, format }: { value: number; duration?: number; format?: (n: number) => string }) {
  const [n, setN] = useState(value);
  useEffect(() => {
    const start = n;
    const delta = value - start;
    const startT = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - startT) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(start + delta * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <span>{format ? format(n) : n.toLocaleString()}</span>;
}
