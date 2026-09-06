import { useEffect, useState, useCallback } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  ChartNoAxesCombined,
  ChevronRight,
  CircleHelp,
  Database,
  FlaskConical,
  Layers3,
  Pause,
  Play,
  Radio,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Wallet,
  X,
} from "lucide-react";
import Chart from "./Chart";
import Readiness from "./Readiness";
import {
  api,
  initializeSession,
  money,
  number,
  time,
  type Snapshot,
  type Signal,
  type Candle,
  type Trade,
  type Performance,
  type Evaluation,
  type Event,
} from "./api";

type View = "Markets" | "Signals" | "Paper account" | "Evaluation";
const views = [
  { name: "Markets", icon: ChartNoAxesCombined },
  { name: "Signals", icon: Activity },
  { name: "Paper account", icon: Wallet },
  { name: "Evaluation", icon: FlaskConical },
] as const;
const names = { NQ: "Nasdaq-100", GC: "Gold" };

export default function App() {
  const [view, setView] = useState<View>("Markets");
  const [product, setProduct] = useState<"NQ" | "GC">("NQ");
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [bars, setBars] = useState<Candle[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [selected, setSelected] = useState<Signal | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [drawer, setDrawer] = useState<"alerts" | "settings" | null>(null);
  const [clock, setClock] = useState(new Date());
  const [textSize, setTextSize] = useState(() => {
    try {
      return localStorage.getItem("reasift-text-size") === "extra"
        ? "extra"
        : "large";
    } catch {
      return "large";
    }
  });
  useEffect(() => {
    document.documentElement.dataset.textSize = textSize;
    try {
      localStorage.setItem("reasift-text-size", textSize);
    } catch {
      /* Browser storage may be disabled. */
    }
  }, [textSize]);
  const refresh = useCallback(async () => {
    const [s, ts, p, e, ss] = await Promise.all([
      api<Snapshot>("snapshot"),
      api<Trade[]>("trades"),
      api<Performance>("performance"),
      api<Evaluation>("evaluation"),
      api<Signal[]>("signals"),
    ]);
    setSnapshot(s);
    setTrades(ts);
    setPerformance(p);
    setEvaluation(e);
    setSignals(ss);
  }, []);
  useEffect(() => {
    let cancelled = false,
      socket: WebSocket | undefined,
      retry: ReturnType<typeof setTimeout>,
      cursor = 0;
    async function connect() {
      try {
        await initializeSession();
        await refresh();
        if (cancelled) return;
        const history = await api<Event[]>("events");
        setEvents(history.reverse());
        socket = new WebSocket(
          `ws://${location.host}/api/v1/stream?after=${cursor}`,
        );
        socket.onmessage = (message) => {
          const event = JSON.parse(message.data);
          if (event.kind === "snapshot") {
            setSnapshot(event.payload);
            return;
          }
          cursor = Math.max(cursor, event.seq || 0);
          setEvents((rows) =>
            rows.some((r) => r.id === event.id)
              ? rows
              : [event, ...rows].slice(0, 100),
          );
          if (
            ["signal", "entry", "exit", "job", "risk_pause"].includes(
              event.kind,
            )
          )
            void refresh().catch(() => {});
        };
        socket.onclose = () => {
          if (!cancelled) retry = setTimeout(connect, 2500);
        };
        setError("");
      } catch (e) {
        if (!cancelled) {
          setError((e as Error).message);
          retry = setTimeout(connect, 3000);
        }
      }
    }
    void connect();
    const tick = setInterval(() => setClock(new Date()), 1000);
    return () => {
      cancelled = true;
      clearTimeout(retry);
      clearInterval(tick);
      socket?.close();
    };
  }, [refresh]);
  useEffect(() => {
    let active = true;
    const load = () =>
      api<Candle[]>(`candles/${product}`)
        .then((v) => {
          if (active) setBars(v);
        })
        .catch(() => {});
    setBars([]);
    void load();
    const interval = setInterval(load, 10000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [product]);
  async function action(path: string, body: unknown, method?: string) {
    setBusy(true);
    setError("");
    try {
      await api(path, body, method);
      await refresh();
      setNotice("Saved.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const quote = snapshot?.quotes[product];
  const instrument = snapshot?.instruments[product];
  const analysis = snapshot?.analysis[product];
  const stale = quote
    ? clock.getTime() - new Date(String(quote.ts)).getTime() > 5000
    : true;
  const focusSignal =
    selected?.product === product
      ? selected
      : signals.find((s) => s.product === product) || null;
  const selectSignal = (s: Signal) => {
    setSelected(s);
    setProduct(s.product);
    setView("Markets");
  };
  const feed = snapshot?.feed.state || "connecting";
  return (
    <div className="app">
      <aside className="sidebar">
        <a
          href="#"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            setView("Markets");
          }}
        >
          <span className="brand-mark">
            <Layers3 size={21} />
          </span>
          reasift<span className="brand-dot">.</span>
        </a>
        <div className="workspace-tag">
          <span className="small-dot" /> Personal workspace <span>LOCAL</span>
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {views.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={view === name ? "nav-item active" : "nav-item"}
              onClick={() => setView(name)}
            >
              <Icon size={18} />
              {name}
              {name === "Signals" && signals.length > 0 && (
                <span className="count">{signals.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="nav-label instruments-label">
          FOLLOWING <span>02</span>
        </div>
        {(["NQ", "GC"] as const).map((p) => (
          <button
            className={`instrument-nav ${product === p && view === "Markets" ? "selected" : ""}`}
            key={p}
            onClick={() => {
              setProduct(p);
              setView("Markets");
              setSelected(null);
            }}
          >
            <span className={`ticker-badge ${p.toLowerCase()}`}>{p}</span>
            <span>
              <strong>{names[p]}</strong>
              <small>
                {p === "NQ" ? "CME · Equity index" : "COMEX · Precious metal"}
              </small>
            </span>
            <ChevronRight size={14} />
          </button>
        ))}
        <div className="sidebar-bottom">
          <div className="paper-note">
            <ShieldCheck size={20} />
            <strong>Research without real orders</strong>
            <p>All trades are simulated. Your results stay on this computer.</p>
          </div>
          <button className="nav-item" onClick={() => setDrawer("settings")}>
            <SlidersHorizontal size={17} />
            Preferences
          </button>
          <div className="profile">
            <span>VP</span>
            <div>
              Personal account<small>Local · v0.1.0</small>
            </div>
            <span className="small-dot" />
          </div>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <div>
            <span className="breadcrumb">Workspace</span>
            <ChevronRight size={13} />
            <strong>{view}</strong>
          </div>
          <div className="topbar-right">
            <span className="market-clock">
              {clock.toLocaleTimeString("en-US", {
                timeZone: "America/New_York",
                hour12: false,
              })}
              <small> NEW YORK</small>
            </span>
            <span className="market-clock">
              {clock.toLocaleTimeString("en-US", { hour12: false })}
              <small> LOCAL</small>
            </span>
            <span className="paper-pill">PAPER MODE</span>
            <button
              className="icon-button"
              aria-label="Open notifications"
              onClick={() => setDrawer("alerts")}
            >
              <Bell size={18} />
              {events.length > 0 && <i />}
            </button>
          </div>
        </header>
        <div className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">YOUR RESEARCH DESK</div>
              <h1>
                {view === "Markets"
                  ? "A clearer view of the market."
                  : view === "Signals"
                    ? "Every signal. Every reason."
                    : view === "Paper account"
                      ? "Measure what actually happens."
                      : "Evidence before conviction."}
              </h1>
              <p>
                {view === "Markets"
                  ? "Follow price, understand the setup, and track the outcome."
                  : view === "Signals"
                    ? "A traceable record of setups, including those we choose to skip."
                    : view === "Paper account"
                      ? "Simulated results, with execution costs and unresolved outcomes in view."
                      : "Replay real market data against a frozen, reproducible strategy."}
              </p>
            </div>
            <button
              className="button secondary"
              onClick={() => void refresh().catch((e) => setError(e.message))}
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>
          {error && (
            <div className="banner error" role="alert">
              <CircleHelp size={18} />
              <span>{error}</span>
              <button aria-label="Dismiss error" onClick={() => setError("")}>
                <X size={15} />
              </button>
            </div>
          )}
          {notice && (
            <div className="sr-only" role="status">
              {notice}
            </div>
          )}
          <div
            className={`connection-strip ${feed === "live" ? "connected" : ""}`}
          >
            <div className="connection-icon">
              <Radio size={18} />
            </div>
            <div>
              <strong>
                {feed === "live"
                  ? "Market connection active"
                  : feed === "warming_up"
                    ? "Preparing your market context"
                    : feed === "stale"
                      ? "Market data is stale"
                      : "Connect your market data"}
              </strong>
              <span>
                {String(
                  snapshot?.feed.reason ||
                    "Connecting to the local Reasift service…",
                )}
              </span>
            </div>
            <span className="state-label">
              {String(feed).replaceAll("_", " ")}
            </span>
            <button
              className="button primary"
              disabled={
                busy ||
                !snapshot?.worker_online ||
                (!snapshot?.monitoring && !snapshot?.data_configured)
              }
              onClick={() =>
                void action("monitoring", {
                  action: snapshot?.monitoring ? "pause" : "start",
                })
              }
            >
              {snapshot?.monitoring ? <Pause size={14} /> : <Play size={14} />}{" "}
              {snapshot?.monitoring ? "Pause" : "Start monitoring"}
            </button>
          </div>
          {view === "Markets" && (
            <>
              {snapshot && (
                <Readiness
                  snapshot={snapshot}
                  openSetup={() => setDrawer("settings")}
                />
              )}
              <div className="market-stats">
                <Stat
                  label="PAPER EQUITY"
                  value={money(snapshot?.equity)}
                  detail="Simulated USD balance"
                />
                <Stat
                  label="REALIZED NET P&L"
                  value={money(performance?.combined.net_pnl)}
                  detail="After modeled fees and slippage"
                />
                <Stat
                  label="COMPLETED TRADES"
                  value={String(performance?.combined.sample_count ?? 0)}
                  detail="Across NQ and GC"
                />
                <Stat
                  label="LIVE OBSERVATION"
                  value={`${evaluation?.live_sessions ?? 0} / 20`}
                  detail="Complete paper sessions"
                />
              </div>
              <div className="market-layout">
                <section className="panel market-panel">
                  <div className="panel-heading">
                    <div className="market-title">
                      <span
                        className={`ticker-badge large ${product.toLowerCase()}`}
                      >
                        {product}
                      </span>
                      <div>
                        <h2>{names[product]} futures</h2>
                        <span>
                          {instrument
                            ? `${instrument.symbol} · Expires ${instrument.expiry}`
                            : "Waiting for active contract · USD"}
                        </span>
                      </div>
                    </div>
                    <div className="timeframe">
                      1m <span>candles</span>
                    </div>
                  </div>
                  <div className="price-row">
                    <strong>{number(quote?.bid)}</strong>
                    <span className={stale ? "muted" : "positive"}>
                      {quote
                        ? stale
                          ? "Stale quote"
                          : "Live bid"
                        : "No quote yet"}
                    </span>
                    <div>
                      <span>
                        ASK <b>{number(quote?.ask)}</b>
                      </span>
                      <span>
                        SPREAD{" "}
                        <b>
                          {quote
                            ? number(
                                (Number(quote.ask) - Number(quote.bid)) /
                                  (instrument?.tick || 1),
                                1,
                              )
                            : "—"}{" "}
                          ticks
                        </b>
                      </span>
                    </div>
                  </div>
                  <Chart
                    bars={bars}
                    signal={focusSignal}
                    fontSize={textSize === "extra" ? 18 : 16}
                  />
                  <div className="chart-footer">
                    <span>
                      <span className="small-dot" /> Databento · Actual contract
                    </span>
                    <span>Chart labels: New York time</span>
                    <a
                      href="https://www.tradingview.com/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Charts by TradingView ↗
                    </a>
                  </div>
                </section>
                <aside className="panel insight-panel">
                  <div className="panel-heading">
                    <h2>Market perspective</h2>
                    <Activity size={16} />
                  </div>
                  <div className="insight-body">
                    <span
                      className={`direction-tag ${analysis?.direction || "neutral"}`}
                    >
                      {String(analysis?.direction || "Awaiting data")}
                    </span>
                    <h3>
                      {Number(analysis?.warmup_bars || 0) < 250
                        ? "Building the bigger picture."
                        : `${String(analysis?.direction || "Neutral")} market structure.`}
                    </h3>
                    <p>
                      {String(
                        analysis?.reason ||
                          "Reasift needs 250 completed 15-minute candles before it can assess a setup.",
                      )}
                    </p>
                    <div className="warmup">
                      <div>
                        <span>Historical context</span>
                        <strong>
                          {Math.min(Number(analysis?.warmup_bars || 0), 250)} /
                          250
                        </strong>
                      </div>
                      <progress
                        value={Number(analysis?.warmup_bars || 0)}
                        max={250}
                      />
                    </div>
                    <div className="insight-rule">
                      <span>STRATEGY</span>
                      <strong>Trend + breakout</strong>
                      <p>
                        15m trend · 5m trigger
                        <br />
                        30 minutes to 4 hours
                      </p>
                    </div>
                    {focusSignal ? (
                      <div className="signal-detail">
                        <div className="eyebrow">
                          SELECTED SIGNAL · {time(focusSignal.ts)} ET
                        </div>
                        <h3>
                          {focusSignal.direction === "long" ? "Long" : "Short"}{" "}
                          {focusSignal.symbol}
                        </h3>
                        <p>{focusSignal.reason}</p>
                        <dl>
                          <div>
                            <dt>Reference entry</dt>
                            <dd>{number(focusSignal.reference)}</dd>
                          </div>
                          <div>
                            <dt>Initial stop</dt>
                            <dd>{number(focusSignal.stop)}</dd>
                          </div>
                          <div>
                            <dt>Target</dt>
                            <dd>{number(focusSignal.target)}</dd>
                          </div>
                        </dl>
                        <span className="status-tag">{focusSignal.status}</span>
                        {trades
                          .filter((t) => t.id === focusSignal.id)
                          .map((t) => (
                            <div className="linked-trade" key={t.id}>
                              <p>
                                Paper outcome: <strong>{t.status}</strong>
                                {t.net_pnl !== undefined
                                  ? ` · ${money(t.net_pnl)}`
                                  : ""}
                              </p>
                              <button
                                className="text-button"
                                onClick={() => setView("Paper account")}
                              >
                                View paper ledger <ChevronRight size={14} />
                              </button>
                            </div>
                          ))}
                        {focusSignal.rejection && (
                          <p className="rejection">{focusSignal.rejection}</p>
                        )}
                      </div>
                    ) : (
                      <div className="no-setup">
                        <ShieldCheck size={20} />
                        <strong>No actionable setup yet</strong>
                        <p>
                          Waiting is part of the process. A signal appears only
                          when the rules align.
                        </p>
                      </div>
                    )}
                  </div>
                </aside>
              </div>
              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <h2>Recent signals</h2>
                    <span>From observation to outcome</span>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => setView("Signals")}
                  >
                    View all <ChevronRight size={15} />
                  </button>
                </div>
                <SignalTable
                  signals={signals.slice(0, 5)}
                  onSelect={selectSignal}
                />
              </section>
            </>
          )}
          {view === "Signals" && (
            <section className="panel">
              <div className="panel-heading">
                <h2>Signal journal</h2>
                <span className="status-tag">breakout-1.0.0</span>
              </div>
              <SignalTable signals={signals} onSelect={selectSignal} />
            </section>
          )}
          {view === "Paper account" && (
            <>
              <div className="market-stats">
                <Stat
                  label="SIMULATED EQUITY"
                  value={money(snapshot?.equity)}
                  detail="Includes latest marked open positions"
                />
                <Stat
                  label="NET EXPECTANCY"
                  value={money(performance?.combined.expectancy)}
                  detail="Average net result per completed trade"
                />
                <Stat
                  label="MAX DRAWDOWN"
                  value={money(performance?.combined.max_drawdown)}
                  detail="Closed-trade equity basis"
                />
                <Stat
                  label="UNRESOLVED"
                  value={String(performance?.combined.unresolved ?? 0)}
                  detail="Excluded from reliable results"
                />
              </div>
              {snapshot?.halted && (
                <div className="banner error">
                  Paper execution is paused by a risk or data-integrity gate.
                </div>
              )}
              <section className="panel">
                <div className="panel-heading">
                  <h2>Paper trade ledger</h2>
                  <span>
                    1 contract · $10 round-trip fees · 1 adverse tick per fill
                  </span>
                </div>
                {trades.length ? (
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Contract</th>
                          <th>Direction</th>
                          <th>Entry</th>
                          <th>Exit</th>
                          <th>Net result</th>
                          <th>Status</th>
                          <th>Outcome</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trades.map((t) => (
                          <tr key={t.id}>
                            <td>
                              <strong>{t.symbol}</strong>
                            </td>
                            <td>{t.direction}</td>
                            <td>{number(t.entry)}</td>
                            <td>{number(t.exit)}</td>
                            <td
                              className={
                                (t.net_pnl || 0) >= 0 ? "positive" : "negative"
                              }
                            >
                              {money(t.net_pnl)}
                            </td>
                            <td>
                              <span className="status-tag">{t.status}</span>
                            </td>
                            <td>
                              {t.unresolved_reason ||
                                t.exit_reason ||
                                "Position open"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Empty
                    icon={<Wallet size={25} />}
                    title="Your paper ledger starts here."
                    text="Eligible signals will create simulated trades automatically. No real orders are placed."
                  />
                )}
              </section>
              <section className="panel">
                <div className="panel-heading">
                  <h2>Performance by market</h2>
                  <span>Preliminary until sufficient observations exist</span>
                </div>
                <div className="performance-grid">
                  {(["NQ", "GC"] as const).map((p) => (
                    <div key={p}>
                      <h3>
                        {p} · {names[p]}
                      </h3>
                      <dl>
                        <div>
                          <dt>Completed trades</dt>
                          <dd>
                            {performance?.instruments[p].sample_count ?? 0}
                          </dd>
                        </div>
                        <div>
                          <dt>Win rate</dt>
                          <dd>
                            {performance?.instruments[p].win_rate == null
                              ? "—"
                              : `${number(performance.instruments[p].win_rate! * 100, 1)}%`}
                          </dd>
                        </div>
                        <div>
                          <dt>Profit factor</dt>
                          <dd>
                            {number(performance?.instruments[p].profit_factor)}
                          </dd>
                        </div>
                        <div>
                          <dt>Net result</dt>
                          <dd>{money(performance?.instruments[p].net_pnl)}</dd>
                        </div>
                      </dl>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
          {view === "Evaluation" && (
            <>
              <div className="evaluation-intro">
                <FlaskConical size={25} />
                <div>
                  <h2>Test the rules. Keep the evidence.</h2>
                  <p>
                    Development, validation, and locked testing use real
                    licensed data. A negative result is still a useful result.
                  </p>
                </div>
              </div>
              <section className="panel">
                <div className="panel-heading">
                  <h2>Evaluation window</h2>
                  {!evaluation?.manifest ? (
                    <button
                      className="button primary"
                      disabled={busy}
                      onClick={() => void action("evaluation/setup", {})}
                    >
                      Create six-month window
                    </button>
                  ) : (
                    <button
                      className="button secondary"
                      disabled={busy || evaluation.manifest.frozen}
                      onClick={() => void action("evaluation/freeze", {})}
                    >
                      {evaluation.manifest.frozen
                        ? "Strategy frozen"
                        : "Freeze strategy for final test"}
                    </button>
                  )}
                </div>
                {evaluation?.manifest ? (
                  <div className="phase-grid">
                    {Object.entries(evaluation.manifest.phases).map(
                      ([phase, [start, end]]) => (
                        <div key={phase}>
                          <span className="eyebrow">{phase.toUpperCase()}</span>
                          <h3>
                            {start.slice(0, 10)} <span>to</span>
                            <br />
                            {end.slice(0, 10)}
                          </h3>
                          <p>
                            {phase === "test"
                              ? evaluation.manifest?.frozen
                                ? "Unlocked for this frozen strategy"
                                : "Locked until strategy is frozen"
                              : "Research period"}
                          </p>
                          <button
                            className="button secondary"
                            disabled={
                              busy ||
                              (phase === "test" && !evaluation.manifest?.frozen)
                            }
                            onClick={() =>
                              void action(`evaluation/run/${phase}`, {})
                            }
                          >
                            Evaluate phase
                          </button>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <Empty
                    icon={<BookOpen size={25} />}
                    title="No evaluation has run."
                    text="Create a fixed six-month window, then request bounded historical data. Final test results stay separate from development."
                  />
                )}
              </section>
              {evaluation?.manifest && (
                <HistoryForm
                  busy={busy}
                  submit={action}
                  phases={evaluation.manifest.phases}
                />
              )}
              <section className="panel">
                <div className="panel-heading">
                  <h2>Recordings and replay</h2>
                  <span>Baseline · doubled fees · higher slippage</span>
                </div>
                {evaluation?.recordings.length ? (
                  <div className="recordings">
                    {evaluation.recordings.map((r) => (
                      <div key={r.id}>
                        <Database size={19} />
                        <div>
                          <strong>
                            {r.product} · {r.phase}
                          </strong>
                          <small>{r.id}</small>
                        </div>
                        <button
                          className="button secondary"
                          disabled={busy}
                          onClick={() =>
                            void action("replay", { recording_id: r.id })
                          }
                        >
                          <Play size={14} />
                          Replay
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty
                    icon={<Database size={24} />}
                    title="No licensed recordings available."
                    text="Set your data key and historical budget locally. Downloads that exceed that budget are blocked."
                  />
                )}
                {evaluation?.jobs.map((j) => (
                  <div className="job" key={j.id}>
                    <span className="status-tag">{j.status}</span>
                    <strong>
                      {j.kind === "history"
                        ? "Historical data request"
                        : "Strategy replay"}
                    </strong>
                    {j.error && <p className="negative">{j.error}</p>}
                    {j.result && (
                      <div className="scenario-grid">
                        {["baseline", "double_fees", "higher_slippage"].map(
                          (s) => (
                            <div key={s}>
                              <span>{s.replaceAll("_", " ")}</span>
                              <strong>
                                {money(j.result?.[s]?.combined.net_pnl)}
                              </strong>
                              <small>
                                {j.result?.[s]?.combined.sample_count} completed
                                trades
                              </small>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </section>
            </>
          )}
          <footer className="page-footer">
            <span>
              <ShieldCheck size={13} /> Local research · Paper execution only
            </span>
            <span>Prices are observations. Signals are hypotheses.</span>
          </footer>
        </div>
      </main>
      {drawer && (
        <div className="drawer-backdrop" onClick={() => setDrawer(null)}>
          <aside className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="panel-heading">
              <h2>
                {drawer === "alerts" ? "Notification history" : "Preferences"}
              </h2>
              <button
                className="icon-button"
                aria-label="Close panel"
                onClick={() => setDrawer(null)}
              >
                <X size={19} />
              </button>
            </div>
            {drawer === "alerts" ? (
              <div className="notification-list">
                {events.length ? (
                  events
                    .filter(
                      (e) => !["settings", "exit_requested"].includes(e.kind),
                    )
                    .map((e) => (
                      <article key={e.id}>
                        <small>
                          {time(e.ts)} ET · {e.kind.replaceAll("_", " ")}
                        </small>
                        <p>
                          {String(
                            e.payload.reason ||
                              e.payload.symbol ||
                              "Research record updated.",
                          )}
                        </p>
                      </article>
                    ))
                ) : (
                  <Empty
                    title="No notifications yet"
                    text="Signals, paper-trade outcomes and connection changes appear here."
                    icon={<Bell size={24} />}
                  />
                )}
              </div>
            ) : (
              <div className="settings-body">
                <label className="display-setting">
                  <span>Text and interface size</span>
                  <select
                    value={textSize}
                    onChange={(e) => setTextSize(e.target.value)}
                  >
                    <option value="large">Large (default)</option>
                    <option value="extra">Extra large</option>
                  </select>
                </label>
                <h3>Market-data connection</h3>
                <p>
                  Run these commands in PowerShell. The setup asks for your
                  Databento credential privately on this computer and preserves
                  your other settings.
                </p>
                <pre className="setup-command">{`cd D:\\Work\\Project\\Dev\\Reasift\\Backend\n.\\Configure-Reasift.ps1\n.\\Stop-Reasift.ps1\n.\\Start-Reasift.ps1`}</pre>
                <p>
                  Use an account with licensed live access to GLBX.MDP3. After
                  restarting, click Start monitoring. Reasift then resolves NQ
                  and GC, loads warm-up history, and watches for breakouts
                  automatically. Historical requests stay subject to your local
                  spending allowance.
                </p>
                <p className="muted">
                  API keys stay on the backend. No subscription is purchased by
                  this app.
                </p>
                <label className="toggle-row">
                  <span>Windows notifications</span>
                  <input
                    type="checkbox"
                    checked={snapshot?.settings.notifications ?? true}
                    onChange={(e) =>
                      snapshot &&
                      void action(
                        "settings",
                        {
                          ...snapshot.settings,
                          notifications: e.target.checked,
                        },
                        "PUT",
                      )
                    }
                  />
                </label>
                <dl>
                  <div>
                    <dt>Recording retention</dt>
                    <dd>{snapshot?.settings.retention_days ?? 30} days</dd>
                  </div>
                  <div>
                    <dt>Recording capacity</dt>
                    <dd>{snapshot?.settings.recording_cap_gb ?? 20} GB</dd>
                  </div>
                  <div>
                    <dt>Per-trade risk allowance</dt>
                    <dd>0.5% of paper equity</dd>
                  </div>
                  <div>
                    <dt>Daily loss trigger</dt>
                    <dd>2%</dd>
                  </div>
                </dl>
                <p>
                  Risk triggers do not guarantee a maximum loss. Simulated fills
                  include a 250ms delay and one adverse tick.
                </p>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}
function Empty({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="empty">
      <div>{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
function SignalTable({
  signals,
  onSelect,
}: {
  signals: Signal[];
  onSelect: (s: Signal) => void;
}) {
  return signals.length ? (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Time · New York</th>
            <th>Contract</th>
            <th>Direction</th>
            <th>Reference</th>
            <th>Stop / Target</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {signals.map((s) => (
            <tr key={s.id}>
              <td>
                {time(s.ts)}
                <small>{s.ts.slice(0, 10)}</small>
              </td>
              <td>
                <strong>{s.symbol}</strong>
              </td>
              <td>
                <span className={`trade-direction ${s.direction}`}>
                  {s.direction === "long" ? (
                    <ArrowUpRight size={15} />
                  ) : (
                    <ArrowDownRight size={15} />
                  )}{" "}
                  {s.direction}
                </span>
              </td>
              <td>{number(s.reference)}</td>
              <td>
                {number(s.stop)} / {number(s.target)}
              </td>
              <td>
                <span className="status-tag" title={s.rejection || undefined}>
                  {s.status}
                </span>
              </td>
              <td>
                <button className="text-button" onClick={() => onSelect(s)}>
                  Inspect <ChevronRight size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <Empty
      icon={<Activity size={25} />}
      title="The next setup will appear here."
      text="Signals include the actual contract, trigger, proposed levels, and the reason for taking or skipping a paper trade."
    />
  );
}
function HistoryForm({
  busy,
  submit,
  phases,
}: {
  busy: boolean;
  submit: (path: string, body: unknown) => Promise<void>;
  phases: Record<string, [string, string]>;
}) {
  const [product, setProduct] = useState("NQ"),
    [phase, setPhase] = useState("development"),
    [start, setStart] = useState(phases.development[0].slice(0, 10)),
    [end, setEnd] = useState("");
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Request historical data</h2>
        <span>Maximum 31 days per request · Cost checked before download</span>
      </div>
      <form
        className="history-form"
        onSubmit={(e) => {
          e.preventDefault();
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
          <select value={product} onChange={(e) => setProduct(e.target.value)}>
            <option>NQ</option>
            <option>GC</option>
          </select>
        </label>
        <label>
          Period
          <select
            value={phase}
            onChange={(e) => {
              setPhase(e.target.value);
              setStart(phases[e.target.value][0].slice(0, 10));
            }}
          >
            {Object.keys(phases).map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label>
          From (UTC)
          <input
            type="date"
            required
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </label>
        <label>
          Until (exclusive)
          <input
            type="date"
            required
            value={end}
            min={start}
            onChange={(e) => setEnd(e.target.value)}
          />
        </label>
        <button className="button primary" disabled={busy}>
          Request data
        </button>
      </form>
    </section>
  );
}
