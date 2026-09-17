import { read } from "../api";

export type ReadinessState = "blocked" | "required" | "disabled" | "not_configured";
export type PhaseId = "phase_1" | "phase_2" | "phase_3" | "phase_4" | "phase_5";

export interface PhaseReadiness {
  phase: PhaseId;
  service: string;
  schema_version: string;
  status: ReadinessState;
  summary: string;
  blockers: string[];
  gates: Record<string, ReadinessState>;
  boundaries: string[];
  read_only: true;
  external_capabilities_enabled: false;
}

export interface AnalystWorkspaceReadiness {
  status: "blocked";
  workspace: "local_read_only_analyst";
  paper_only: true;
  external_capabilities_enabled: false;
  phases: PhaseReadiness[];
}

export const getAnalystWorkspaceReadiness = () =>
  read<AnalystWorkspaceReadiness>("analyst-workspace");

export const readinessLabel = (state: ReadinessState | undefined) =>
  state ? state.replaceAll("_", " ").toUpperCase() : "LOADING";

export const phaseFor = (workspace: AnalystWorkspaceReadiness | null, phase: PhaseId) =>
  workspace?.phases.find((item) => item.phase === phase);
