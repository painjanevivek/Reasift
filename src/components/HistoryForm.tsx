import { useMemo, useState } from "react";

type Phase = "development" | "validation" | "test";
type Product = "NQ" | "GC";

interface HistoryFormProps {
  busy: boolean;
  submit: (path: string, body: unknown) => Promise<void>;
  phases: Record<string, [string, string]>;
}

export default function HistoryForm({
  busy,
  submit,
  phases,
}: HistoryFormProps) {
  const availablePhases = useMemo(
    () => Object.keys(phases) as Phase[],
    [phases],
  );
  const [product, setProduct] = useState<Product>("NQ");
  const [phase, setPhase] = useState<Phase>("development");
  const [start, setStart] = useState(phases.development[0].slice(0, 10));
  const [end, setEnd] = useState("");

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Request historical data</h2>
        <span>Maximum 31 days per request · Cost checked before download</span>
      </div>
      <form
        className="history-form"
        aria-busy={busy}
        onSubmit={(event) => {
          event.preventDefault();
          void submit("history", {
            product,
            phase,
            start: `${start}T00:00:00Z`,
            end: `${end}T00:00:00Z`,
          });
        }}
      >
        <label>
          Instrument
          <select
            value={product}
            onChange={(event) => setProduct(event.target.value as Product)}
          >
            <option value="NQ">NQ</option>
            <option value="GC">GC</option>
          </select>
        </label>
        <label>
          Period
          <select
            value={phase}
            onChange={(event) => {
              const nextPhase = event.target.value as Phase;
              setPhase(nextPhase);
              setStart(phases[nextPhase][0].slice(0, 10));
              setEnd("");
            }}
          >
            {availablePhases.map((phaseName) => (
              <option key={phaseName} value={phaseName}>
                {phaseName}
              </option>
            ))}
          </select>
        </label>
        <label>
          From (UTC)
          <input
            type="date"
            required
            value={start}
            min={phases[phase][0].slice(0, 10)}
            max={phases[phase][1].slice(0, 10)}
            onChange={(event) => {
              setStart(event.target.value);
              if (end && end < event.target.value) setEnd("");
            }}
          />
        </label>
        <label>
          Until (exclusive)
          <input
            type="date"
            required
            value={end}
            min={start}
            max={phases[phase][1].slice(0, 10)}
            onChange={(event) => setEnd(event.target.value)}
          />
        </label>
        <button type="submit" className="button primary" disabled={busy}>
          Request data
        </button>
      </form>
    </section>
  );
}
