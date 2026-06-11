import { Link } from "@tanstack/react-router";
import { Github } from "lucide-react";

export function Nav() {
  const links = [
    { to: "/", label: "Home" },
    { to: "/venture-intel", label: "Venture Intel" },
    { to: "/war-room", label: "War Room" },
    { to: "/timelapse", label: "Timeline" },
  ];
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="glass-strong mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-full px-5 py-2.5">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-7 rounded-lg" style={{ background: "var(--gradient-primary)" }} />
          <span className="font-display text-lg font-semibold tracking-tight">VentureOS</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to as any}
              className="px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5 transition"
              activeProps={{ className: "px-3 py-1.5 rounded-full text-foreground bg-white/10" }}
              activeOptions={{ exact: true }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="rounded-full p-2 hover:bg-white/10 transition"
          aria-label="GitHub"
        >
          <Github className="size-4" />
        </a>
      </div>
    </header>
  );
}
