import { useState } from "react";

const capabilities = [
  ["Search", "Find a covered instrument, analyst, firm, or source-attributed topic."],
  ["Consensus", "See unweighted ratings and targets with sample size and currency context."],
  ["Evidence", "Inspect the underlying analyst view, source time, freshness, and uncertainty."],
] as const;

const horizons = [
  ["1D", "Next trading day"],
  ["1W", "One week"],
  ["1M", "One month"],
  ["3M", "One quarter"],
  ["6M", "Six months"],
  ["1Y", "One year"],
  ["Multi-year", "Long-term thesis"],
] as const;

export default function AnalystIntelligence() {
  const [horizon, setHorizon] = useState<(typeof horizons)[number][0]>("1M");

  return (
    <section className="analyst-intelligence" aria-labelledby="analyst-intelligence-title">
      <div className="analyst-hero">
        <div>
          <span className="analyst-kicker">PHASE 1 · CONTROLLED RELEASE</span>
          <h2 id="analyst-intelligence-title">Research is useful only when its evidence is inspectable.</h2>
          <p>
            Analyst intelligence will preserve the source, publication time, freshness, and confidence behind
            every view. It does not turn research into an instruction to trade.
          </p>
        </div>
        <span className="analyst-status">AWAITING APPROVED DATA</span>
      </div>

      <form className="analyst-search" onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="analyst-search">Search analyst intelligence</label>
        <div>
          <input
            id="analyst-search"
            type="search"
            disabled
            placeholder="Source access is not configured"
            aria-describedby="analyst-search-help"
          />
          <button type="submit" disabled>
            Search
          </button>
        </div>
        <p id="analyst-search-help">
          Search activates only after approved data rights, an authenticated reader session, and the Phase 1
          service deployment are verified.
        </p>
      </form>

      <div className="analyst-capability-grid">
        {capabilities.map(([name, detail], index) => (
          <article key={name}>
            <span>0{index + 1}</span>
            <h3>{name}</h3>
            <p>{detail}</p>
          </article>
        ))}
      </div>

      <section className="horizon-outlook" aria-labelledby="horizon-outlook-title">
        <div className="horizon-outlook-heading">
          <div>
            <span className="analyst-kicker">PHASE 2 · HORIZON OUTLOOK</span>
            <h3 id="horizon-outlook-title">Choose the holding period before reading the outlook.</h3>
          </div>
          <p>Every horizon has its own assumptions. Longer-term analyst targets are never shown as short-term forecasts.</p>
        </div>
        <div className="horizon-selector" role="group" aria-label="Selected holding period">
          {horizons.map(([label, detail]) => (
            <button
              key={label}
              type="button"
              aria-pressed={horizon === label}
              className={horizon === label ? "selected" : ""}
              onClick={() => setHorizon(label)}
            >
              <strong>{label}</strong>
              <small>{detail}</small>
            </button>
          ))}
        </div>
        <div className="outlook-empty-state" role="status">
          <div>
            <span>SELECTED HORIZON</span>
            <strong>{horizon}</strong>
          </div>
          <div>
            <span>EXPECTED RANGE</span>
            <strong>Awaiting verified data</strong>
          </div>
          <div>
            <span>DOWNSIDE BAND</span>
            <strong>Not estimated</strong>
          </div>
          <div>
            <span>THESIS FIT</span>
            <strong>Insufficient evidence</strong>
          </div>
        </div>
        <p className="outlook-caveat">
          The Phase 2 service will disclose probability ranges, volatility, drawdown, catalyst windows, freshness,
          and uncertainty here. It will abstain rather than show a forecast when data is sparse or incompatible.
        </p>
      </section>

      <section className="reliability-method" aria-labelledby="reliability-method-title">
        <div>
          <span className="analyst-kicker">PHASE 3 · INDEPENDENT EVALUATION</span>
          <h3 id="reliability-method-title">Reliability needs history, context, and uncertainty.</h3>
          <p>
            Analyst calls will be evaluated separately by horizon, sector, and market regime. Small samples are
            shrunk toward the broader baseline; overlapping intervals are not presented as a ranking.
          </p>
        </div>
        <dl>
          <div>
            <dt>Sample requirement</dt>
            <dd>Awaiting sealed outcomes</dd>
          </div>
          <div>
            <dt>Weighted consensus</dt>
            <dd>Compared to simple consensus</dd>
          </div>
          <div>
            <dt>Leaderboard status</dt>
            <dd>Disabled until review</dd>
          </div>
        </dl>
      </section>

      <details className="analyst-disclosure" open>
        <summary>What will be shown when access is enabled</summary>
        <div>
          <p>
            An instrument view will keep consensus, target statistics, disagreements, and changes separate from
            the evidence that produced them. Mixed currencies, stale observations, low-confidence extractions,
            and unresolved conflicts remain visible rather than being averaged away.
          </p>
          <p>
            Original sources are linked only where the relevant data rights permit it. No source is substituted
            with generated or synthetic evidence.
          </p>
        </div>
      </details>
    </section>
  );
}
