import { describe, expect, it } from "vitest";
import { phaseFor, readinessLabel, type AnalystWorkspaceReadiness } from "./workspace";

const workspace: AnalystWorkspaceReadiness = {
  status: "blocked",
  workspace: "local_read_only_analyst",
  paper_only: true,
  external_capabilities_enabled: false,
  phases: [
    {
      phase: "phase_1",
      service: "analyst-intelligence",
      schema_version: "analyst-intelligence.v1",
      status: "blocked",
      summary: "Source rights required.",
      blockers: ["Rights required."],
      gates: { source_rights: "required", connectors: "disabled" },
      boundaries: ["Inspectable evidence."],
      read_only: true,
      external_capabilities_enabled: false,
    },
  ],
};

describe("analyst workspace readiness", () => {
  it("keeps typed safety gates visible without enabling a capability", () => {
    expect(phaseFor(workspace, "phase_1")?.gates.source_rights).toBe("required");
    expect(phaseFor(workspace, "phase_1")?.external_capabilities_enabled).toBe(false);
    expect(readinessLabel("not_configured")).toBe("NOT CONFIGURED");
  });
});
