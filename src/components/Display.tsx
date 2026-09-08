import type { ReactNode } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import { number, time, type Signal } from "../api";

export function Stat({
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

export function Empty({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
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

export function ChartLoading() {
  return (
    <div className="chart-empty chart-loading" role="status" aria-live="polite">
      <div>
        <BarChart3 size={31} />
      </div>
      <h3>Preparing the market chart…</h3>
      <p>
        Loading the chart renderer while the rest of your desk stays available.
      </p>
    </div>
  );
}

export function SignalTable({
  signals,
  onSelect,
}: {
  signals: Signal[];
  onSelect: (signal: Signal) => void;
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
            <th>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {signals.map((signal) => (
            <tr key={signal.id}>
              <td>
                {time(signal.ts)}
                <small>{signal.ts.slice(0, 10)}</small>
              </td>
              <td>
                <strong>{signal.symbol}</strong>
              </td>
              <td>
                <span className={`trade-direction ${signal.direction}`}>
                  {signal.direction === "long" ? (
                    <ArrowUpRight size={15} />
                  ) : (
                    <ArrowDownRight size={15} />
                  )}{" "}
                  {signal.direction}
                </span>
              </td>
              <td>{number(signal.reference)}</td>
              <td>
                {number(signal.stop)} / {number(signal.target)}
              </td>
              <td>
                <span
                  className="status-tag"
                  title={signal.rejection || undefined}
                >
                  {signal.status}
                </span>
              </td>
              <td>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => onSelect(signal)}
                  aria-label={`Inspect ${signal.direction} ${signal.symbol} signal from ${time(signal.ts)} New York time`}
                >
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
