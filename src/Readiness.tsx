import { CheckCircle2, Circle, SlidersHorizontal } from "lucide-react";
import type { Snapshot } from "./api";

export default function Readiness({
  snapshot,
  openSetup,
}: {
  snapshot: Snapshot;
  openSetup: () => void;
}) {
  const readiness = snapshot.readiness;
  const products = readiness?.products || {};
  const contextReady = ["NQ", "GC"].every((p) => products[p]?.context_ready);
  const watching = Boolean(readiness?.watching_for_signals);
  const steps = [
    {
      title: "Local engine",
      done: snapshot.worker_online,
      detail: snapshot.worker_online
        ? "Background worker is running"
        : "Worker is offline — restart Reasift",
    },
    {
      title: "Market-data access",
      done: snapshot.data_configured,
      detail: snapshot.data_configured
        ? "Configured locally; connection still requires valid entitlement"
        : "Databento access needs configuration",
    },
    {
      title: "Market context",
      done: contextReady,
      detail: ["NQ", "GC"]
        .map((p) => `${p}: ${products[p]?.completed_bars ?? 0} / 250 bars`)
        .join(" · "),
    },
    {
      title: "Automatic paper trading",
      done: watching,
      detail: watching
        ? "Watching for an eligible breakout"
        : snapshot.halted
          ? "Risk pause — review paper account"
          : "Waiting for data, session and risk checks",
    },
  ];
  return (
    <section className="readiness-panel" aria-label="MVP readiness">
      <div className="readiness-heading">
        <div>
          <span className="eyebrow">FIRST PAPER SESSION</span>
          <h2>
            {watching
              ? "Your research engine is watching."
              : "Get your research engine running."}
          </h2>
          <p>{readiness?.next_action || "Checking the local service…"}</p>
        </div>
        <button className="button secondary" onClick={openSetup}>
          <SlidersHorizontal size={18} /> Connection setup
        </button>
      </div>
      <ol className="readiness-steps">
        {steps.map((step) => (
          <li key={step.title} className={step.done ? "complete" : "pending"}>
            {step.done ? (
              <CheckCircle2 size={22} aria-label="Ready" />
            ) : (
              <Circle size={22} aria-label="Pending" />
            )}
            <div>
              <strong>{step.title}</strong>
              <p>{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="readiness-footnote">
        Once connected: live prices → trend and breakout checks → entry, stop
        and target → simulated trades and alerts. A signal is issued only when
        the rules match.
      </p>
    </section>
  );
}
