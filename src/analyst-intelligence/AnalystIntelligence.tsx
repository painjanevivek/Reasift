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

      <section className="portfolio-intelligence" aria-labelledby="portfolio-intelligence-title">
        <div className="portfolio-intelligence-heading">
          <div>
            <span className="analyst-kicker">PHASE 4 · PRIVATE PORTFOLIO CONTEXT</span>
            <h3 id="portfolio-intelligence-title">Your context should clarify evidence, never turn it into an order.</h3>
          </div>
          <span className="portfolio-status">CONSENT GATE CLOSED</span>
        </div>
        <p className="portfolio-intelligence-intro">
          When enabled, Reasift will compare your selected horizon with holdings, concentration, and evidence changes.
          It will keep hypothetical scenarios separate from your actual portfolio and will not place or suggest trades.
        </p>
        <div className="portfolio-preview-grid">
          <article>
            <span>CONSENT</span>
            <h4>Portfolio context</h4>
            <p>Manual holdings or approved integrations, scoped to your account and current consent.</p>
            <strong>Awaiting authorized connection</strong>
          </article>
          <article>
            <span>CONTEXT</span>
            <h4>Horizon & exposure</h4>
            <p>Sector, geography, currency, and holding-period fit shown with freshness and source context.</p>
            <strong>No portfolio data loaded</strong>
          </article>
          <article>
            <span>WHAT-IF</span>
            <h4>Private scenarios</h4>
            <p>Test a hypothetical change without changing holdings, balances, integrations, or orders.</p>
            <strong>Scenario engine unavailable</strong>
          </article>
        </div>
        <details className="portfolio-disclosure">
          <summary>Personalization, privacy, and suitability boundary</summary>
          <div>
            <p>
              Portfolio features need explicit, purpose-specific consent. Data export and deletion workflows are
              controlled separately. Access is limited to the authenticated account and sensitive views are not cached.
            </p>
            <p>
              Until jurisdiction, privacy, data-rights, and suitability reviews are complete, this workspace remains
              informational only. It does not assess whether an investment is suitable or provide personalized advice.
            </p>
          </div>
        </details>
      </section>

      <section className="research-workspace" aria-labelledby="research-workspace-title">
        <div className="research-workspace-heading">
          <div>
            <span className="analyst-kicker">PHASE 5 · BOUNDED RESEARCH</span>
            <h3 id="research-workspace-title">A research brief is only as useful as the evidence that can challenge it.</h3>
          </div>
          <span className="research-status">OPERATOR REVIEW REQUIRED</span>
        </div>
        <p className="research-workspace-intro">
          The research workspace will keep source evidence, conflicting observations, and open questions in separate
          lanes. It can propose a question for review; it cannot retrieve data, run code, modify a model, or act on a market.
        </p>
        <div className="research-ledger" aria-label="Research evidence workflow status">
          <article>
            <span className="research-ledger-label">Evidence input</span>
            <h4>Approved sources only</h4>
            <p>Every item must carry a source, availability time, and immutable evidence reference.</p>
            <strong>Source connection not approved</strong>
          </article>
          <article>
            <span className="research-ledger-label">Counter-evidence</span>
            <h4>Contradictions stay visible</h4>
            <p>Conflicting observations are held beside the working question rather than averaged away.</p>
            <strong>No research report available</strong>
          </article>
          <article>
            <span className="research-ledger-label">Unresolved</span>
            <h4>Abstain when evidence is thin</h4>
            <p>Missing, stale, duplicate, or hostile content produces an explicit evidence gap—not a conclusion.</p>
            <strong>Agent remains paused</strong>
          </article>
        </div>
        <details className="research-disclosure">
          <summary>Research authority is deliberately limited</summary>
          <div>
            <p>
              The agent treats retrieved text as data, never as instructions. It quarantines unapproved or suspicious
              content and requires an operator review before experiments, tool use, or any new external capability.
            </p>
            <p>
              Research output is not an analyst rating, model promotion, portfolio recommendation, or trading signal.
              Any later handoff requires independent evaluation and explicit governance approval.
            </p>
          </div>
        </details>
      </section>

      <section className="paper-control-room" aria-labelledby="paper-control-room-title">
        <div className="paper-control-room-heading">
          <div>
            <span className="analyst-kicker">PHASE 6 · CONTROLLED PAPER RESEARCH</span>
            <h3 id="paper-control-room-title">No-trade is a valid result. Funded execution is not available here.</h3>
          </div>
          <span className="paper-control-status">PAPER LAUNCH CONTROL: OFF</span>
        </div>
        <p className="paper-control-room-intro">
          A future operator view will show a paper-only action beside its risk decision, simulated accounting, and audit
          record. It never connects to a broker, exchange, funded account, or live order route.
        </p>
        <div className="paper-control-strip" aria-label="Paper research safety status">
          <div>
            <span>Action</span>
            <strong>No trade</strong>
            <small>Valid when evidence is insufficient</small>
          </div>
          <div>
            <span>Risk gate</span>
            <strong>Not evaluated</strong>
            <small>Runs before every paper action</small>
          </div>
          <div>
            <span>Promotion</span>
            <strong>Insufficient evidence</strong>
            <small>Independent evaluation required</small>
          </div>
          <div>
            <span>Execution</span>
            <strong>Blocked</strong>
            <small>No broker or funded account configured</small>
          </div>
        </div>
        <details className="paper-disclosure">
          <summary>Why paper research remains controlled</summary>
          <div>
            <p>
              A simulated fill or a passing risk check does not prove market performance or approve a trade. Candidate
              policies must remain frozen and independently evaluated on forward paper evidence before any promotion.
            </p>
            <p>
              Operator kill controls, reconciliation, incident response, data rights, and jurisdiction-specific
              compliance review are mandatory before a real paper account could be considered.
            </p>
          </div>
        </details>
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
