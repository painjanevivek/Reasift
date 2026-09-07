import { test, expect } from "@playwright/test";

test("account integrity failure removes previously displayed account values", async ({
  page,
}) => {
  await page.routeWebSocket(/api\/v1\/stream/, () => {});
  await page.goto("/");
  await expect(page.getByText("$100,000.00")).toBeVisible();
  await page.route("**/api/v1/snapshot", (route) =>
    route.fulfill({
      status: 503,
      json: { detail: "Account integrity failure: recovery review required." },
    }),
  );
  await page.getByRole("button", { name: "Refresh", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Account integrity failure",
  );
  await expect(page.getByText("$100,000.00")).toHaveCount(0);
});

test("setup shows real blockers and larger text persists", async ({ page }) => {
  await page.goto("/");
  const readiness = page.getByRole("region", { name: "MVP readiness" });
  await expect(readiness).toBeVisible();
  await expect(
    readiness.getByText("Databento access needs configuration"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Start monitoring", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Connection setup", exact: true })
    .click();
  await expect(page.getByText(/Configure-Reasift.ps1/)).toBeVisible();
  await page.getByLabel("Text and interface size").selectOption("extra");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-text-size", "extra");
  expect(
    await page
      .locator("html")
      .evaluate((element) => getComputedStyle(element).fontSize),
  ).toBe("18px");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});

test("a labeled synthetic UI fixture links a signal to its chart and paper outcome", async ({
  page,
}) => {
  const now = new Date();
  now.setUTCSeconds(0, 0);
  const stamp = now.toISOString();
  const signal = {
    id: "synthetic-ui-fixture",
    product: "NQ",
    instrument_id: 1,
    symbol: "NQU6",
    ts: stamp,
    expires_at: stamp,
    direction: "long",
    reference: 20000,
    stop: 19998,
    target: 20004,
    reason: "SYNTHETIC UI TEST — not market evidence",
    inputs: {},
    strategy_version: "breakout-1.0.0",
    status: "filled",
    rejection: null,
  };
  const bars = Array.from({ length: 30 }, (_, i) => ({
    ts: new Date(now.getTime() - (29 - i) * 60000).toISOString(),
    instrument_id: 1,
    open: 20000 + i * 0.25,
    high: 20001 + i * 0.25,
    low: 19999 + i * 0.25,
    close: 20000.5 + i * 0.25,
    volume: 100,
  }));
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.routeWebSocket(/api\/v1\/stream/, () => {});
  await page.route("**/api/v1/signals", (route) =>
    route.fulfill({ json: [signal] }),
  );
  await page.route("**/api/v1/trades", (route) =>
    route.fulfill({
      json: [
        {
          id: signal.id,
          product: "NQ",
          symbol: "NQU6",
          status: "closed",
          direction: "long",
          entry: 20000.5,
          exit: 20003.75,
          net_pnl: 55,
          fees: 10,
          opened_at: stamp,
          closed_at: stamp,
        },
      ],
    }),
  );
  await page.route("**/api/v1/candles/NQ", (route) =>
    route.fulfill({ json: bars }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Inspect", exact: true }).click();
  await expect(page.getByText(signal.reason)).toBeVisible();
  await expect(page.locator("canvas").first()).toBeVisible();
  await page.getByRole("button", { name: "View paper ledger" }).click();
  await expect(
    page.getByRole("heading", { name: "Paper trade ledger" }),
  ).toBeVisible();
  await expect(page.getByText("$55.00", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});
test("four views and honest disconnected state", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "A clearer view of the market." }),
  ).toBeVisible();
  await expect(page.getByText("Your market, in focus.")).toBeVisible();
  await expect(page.getByText("$100,000.00")).toBeVisible();
  await page.getByRole("button", { name: "Signals", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Signal journal" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Paper account", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Paper trade ledger" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Evaluation", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Evaluation window" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Preferences", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Market-data connection" }),
  ).toBeVisible();
});
test("responsive layout has no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});
test("dashboard loads without browser exceptions", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Recent signals" }),
  ).toBeVisible();
  await expect(page.getByText("$100,000.00")).toBeVisible();
  await page.screenshot({
    path: "test-results/markets-desktop.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
