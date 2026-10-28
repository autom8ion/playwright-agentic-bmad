# CLAUDE.md

Playwright + TypeScript test framework, paired with BMAD Method v6 and its Test Architect (TEA) module. It targets **Toolshop**, a public practice app: UI at https://practicesoftwaretesting.com, API at https://api.practicesoftwaretesting.com. We don't own the system under test. We only write tests against it.

## Commands
```bash
npm test                      # all projects: setup → chromium/firefox/webkit + api
npm run test:smoke            # --grep @smoke
npm run test:api              # api project only (no browser)
npm run test:ui               # chromium only
npx playwright test path/to/spec.ts --project=chromium --retries=0   # check a single spec honestly
npm run lint && npm run typecheck   # run both before calling anything done
npm run test:allure && npm run allure:report   # optional Allure (reporter only loads when ALLURE is set)
npm run perf:api              # k6 API baseline (NFR3); needs the k6 binary
```
Needs `.env` (`cp .env.example .env`); it only holds the public seed account.
When checking a fix for flakiness, use `--retries=0 --repeat-each=5`. Config retries hide flakes.

## Layout
- `src/pages/`: page objects; `components/NavBar` is composed into pages, not inherited
- `src/fixtures/index.ts`: **always import `{ test, expect }` from `@fixtures`**, never from `@playwright/test`, in specs
- `src/factories/`: `buildUser()`, `buildAddress()` (faker, `Partial<>` overrides)
- `src/api/ToolshopApi.ts`: typed API client for setup and API tests
- `tests/ui/`, `tests/api/`, `tests/auth.setup.ts`; `tests/ui/seed.spec.ts` is the seed for Playwright's agents
- `perf/`: k6 scripts (TypeScript, run by k6 directly, not by Node). Thresholds encode NFR3 in the PRD, so change them only with the PRD.
- Path aliases: `@pages/*`, `@api/*`, `@factories/*`, `@fixtures`

## Conventions
- Locators: `getByTestId` (the attribute is `data-test`) or `getByRole`. No CSS/XPath, except `#order-confirmation`, which has no test id.
- No `waitForTimeout`, no `force: true`, no conditionals in tests. ESLint enforces all three.
- Wait on the app's real network calls (`page.waitForResponse` registered *before* the action, inside `Promise.all`), or on web-first assertions.
- Page objects expose intent-level methods. Specs own the assertions. Page objects may only assert readiness or preconditions.
- Every test creates its own data: the `newUser` / `signedInUser` fixtures register through the API. Never share mutable state between tests; they run fully parallel on a shared public site.
- Tag tests `@smoke` (critical path) or `@regression`. Name tests after behaviour, not implementation.
- Keep new specs mapped to a story or AC in `_bmad-output/planning-artifacts/epics.md`, so TEA traceability stays meaningful.

## Toolshop gotchas (each one cost real debugging time)
- **Catalog requests use the HTTP `QUERY` method**, with params in the body. Match `/products` and `/products/search` by pathname, not by GET plus a query string.
- **The invoice API validates billing city/state against its postcode-lookup data** for the country (a 422 "city does not belong to the selected country"). Never type a city or state. Enter country, house number, *then* postcode, and let the lookup autofill. See `CheckoutPage.fillBillingAddress`.
- **The checkout address form is re-patched from the user's profile in several async passes**, which can overwrite input. That's why `fillBillingAddress` uses `expect(...).toPass()`.
- **JWTs expire after 5 minutes**, so `auth.setup.ts` logs in on every run. The app keeps the token in `localStorage['auth-token']`; `signedInUser` seeds it with `addInitScript`.
- **Cold starts of 15s+ and occasional 500s** ("Something went wrong") are the shared site, not our code. Hence the 45s navigation timeout and retries.
- **Cloudflare challenges datacenter IPs**: GitHub-hosted runners get "Performing security verification" on the UI. CI runs lint + typecheck + `--project=api` only. Never try to bypass the challenge. Run UI tests locally or on a self-hosted runner.
- **k6 load must stay light against the public site** (default 3 VUs × 30s, think time 1s). Keep any k6 run under 5 minutes, because the setup token expires. Heavier profiles belong against a self-hosted Toolshop only.
- Payment: only `cash-on-delivery` is implemented in `CheckoutPage.pay`. Other methods need extra fields.

## Agentic tooling
- **BMAD/TEA skills** in `.claude/skills/`:
  - `/bmad-tea` (agent menu)
  - `/bmad-testarch-test-design`, `-atdd`, `-automate`, `-test-review`, `-trace`, `-nfr`, `-ci`, `-framework`
  - Inputs: `_bmad-output/planning-artifacts/` (PRD.md, epics.md). Outputs: `_bmad-output/test-artifacts/`.
- **TEA config**: `_bmad/tea/config.yaml` (`tea_use_playwright_utils: false`, `tea_browser_automation: auto`). Change it with `npx bmad-method install --action quick-update --yes --set tea.<key>=<value>`, not by hand. Don't edit files under `_bmad/`; the installer owns them.
- **Browser exploration**: prefer `playwright-cli` (skill: `playwright-cli`; must be installed globally) for snapshots and locator discovery. It's cheaper than the MCP. Use named sessions (`-s=<name>`) and `close` them when done.
- **Playwright agents** (`.claude/agents/`): planner → `specs/`, generator, healer. MCP server: `.mcp.json`.
- Generated tests from any of these must follow the conventions above (fixtures, page objects, factories). Extend an existing page object rather than putting raw locators in specs.

## Demo
`docs/DEMO.md` is the live-demo runbook. Its story IDs depend on the gaps deliberately left in `epics.md`: Stories 1.4, 2.2 AC2, 2.4, 3.2 and 3.4 are intentionally untested. Don't "fix" them unless asked.
