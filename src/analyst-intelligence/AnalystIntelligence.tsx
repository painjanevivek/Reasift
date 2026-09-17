const capabilities = [
  ["Search", "Find a covered instrument, analyst, firm, or source-attributed topic."],
  ["Consensus", "See unweighted ratings and targets with sample size and currency context."],
  ["Evidence", "Inspect the underlying analyst view, source time, freshness, and uncertainty."],
] as const;

export default function AnalystIntelligence() {
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
