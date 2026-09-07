# Reasift Frontend

A private local futures research desk built with React, TypeScript, Vite and Lightweight Charts. Markets, Signals, Paper account and Evaluation show real observations and explicitly missing data. No synthetic market feed is used by the application.

The Markets setup checklist reads backend readiness: worker availability, local access configuration, each contract's warm-up, and eligibility to watch for signals. Connection setup provides the local configuration commands. Larger typography is the default; choose Extra large in Preferences or Connection setup. Chart labels follow the selected size.

## Build

```powershell
cd D:\Work\Project\Dev\Reasift\Frontend
npm ci
npm run build
npm test
npm run test:e2e
```

The backend's `Start-Reasift.ps1` launches the app at **http://127.0.0.1:8765** and serves this repository's `dist`. Browser tests use installed Chrome. For Vite development enable `REASIFT_DEV=true` on the backend, then run `npm run dev`.

API types are generated from Backend/openapi.json: export it in Backend, then run `npm run api:generate` here. Do not manually edit `src/generated/api.ts`.

An account-integrity or refresh failure clears displayed account values and shows the backend error. Persistent recovery locks display their reason and survive worker restarts; restarting the browser does not clear them. The [backend adoption review](https://github.com/painjanevivek/Reasift-backend/blob/main/docs/ADOPTION_REVIEW_2026-09-07.md) records which lessons from the supplied research were implemented.

[Backend setup and operations](https://github.com/painjanevivek/Reasift-backend) own the data key, worker, strategy and ledger. Never put provider keys in frontend environment variables or browser storage.

Charts use [TradingView Lightweight Charts](https://www.tradingview.com/lightweight-charts/); visible attribution and the library attribution logo are retained.

Commit and push frontend changes from this repository only. Builds, dependencies, screenshots and test artifacts are ignored.
