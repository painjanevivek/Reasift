import type { components } from "./generated/api";
export type Snapshot = components["schemas"]["Snapshot"];
export type Signal = components["schemas"]["Signal"];
export type Settings = components["schemas"]["Settings"];
let csrf = "";
export async function initializeSession() {
  const r = await fetch("/api/v1/session");
  if (!r.ok) throw new Error("The local Reasift API is unavailable.");
  csrf = (await r.json()).csrf_token;
}
export async function api<T>(
  path: string,
  body?: unknown,
  method = "POST",
): Promise<T> {
  const r = await fetch(
    `/api/v1/${path}`,
    body === undefined
      ? undefined
      : {
          method,
          headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
          body: JSON.stringify(body),
        },
  );
  if (!r.ok) {
    const data = await r.json().catch(() => ({ detail: "Request failed." }));
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Check the request values.",
    );
  }
  return r.json();
}
export const number = (n: unknown, digits = 2) =>
  typeof n === "number" && Number.isFinite(n)
    ? n.toLocaleString("en-US", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      })
    : "—";
export const money = (n: unknown) =>
  typeof n === "number" ? `${n < 0 ? "−" : ""}$${number(Math.abs(n))}` : "—";
export function time(ts: string | undefined, zone = "America/New_York") {
  return ts
    ? new Date(ts).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: zone,
        hour12: false,
      })
    : "—";
}
export interface Candle {
  ts: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  instrument_id: number;
}
export interface Trade {
  id: string;
  product: string;
  symbol: string;
  status: string;
  direction: string;
  entry: number;
  exit?: number;
  net_pnl?: number;
  fees: number;
  opened_at: string;
  closed_at?: string;
  exit_reason?: string;
  unresolved_reason?: string;
}
export interface Metrics {
  sample_count: number;
  win_rate: number | null;
  average_win: number | null;
  average_loss: number | null;
  net_pnl: number;
  expectancy: number | null;
  profit_factor: number | null;
  max_drawdown: number;
  exposure_contract_hours: number;
  unresolved: number;
  preliminary: boolean;
}
export interface Performance {
  combined: Metrics;
  instruments: Record<string, Metrics>;
  live_sessions: number;
  assumptions: Settings;
  validation: string;
}
export interface Evaluation {
  manifest: null | {
    frozen: boolean;
    strategy_version: string;
    strategy_hash: string;
    phases: Record<string, [string, string]>;
  };
  jobs: Job[];
  recordings: Recording[];
  live_sessions: number;
}
export interface Recording {
  id: string;
  product: string;
  phase: string;
  created_at: string;
}
export interface Job {
  id: string;
  kind: string;
  status: string;
  error?: string;
  result?: Record<string, Performance>;
}
export interface Event {
  seq: number;
  id: string;
  ts: string;
  kind: string;
  payload: Record<string, unknown>;
}
