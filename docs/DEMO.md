# Demo runbook: BMAD Method + TEA + Playwright

~20 minutes. Run everything from the repo root inside Claude Code (`claude`).
Before you start: `npm ci && npx playwright install && cp .env.example .env`, then `npm test` once to warm up the public site (it has cold starts).

Requirements live in `_bmad-output/planning-artifacts/` (PRD.md, epics.md). TEA writes its output to `_bmad-output/test-artifacts/`.

## 1. Meet the Test Architect (2 min)
```
/bmad-tea
```
Murat, TEA's agent, loads with a menu of workflows. Point out that TEA is configured for this repo in `_bmad/tea/config.yaml`: `test_framework: playwright`, `test_stack_type: fullstack`, `tea_browser_automation: auto` (Playwright CLI first, MCP when it needs more).
Tip: run `playwright-cli show` in a second terminal so the audience can watch the browser sessions TEA opens.

## 2. Risk-based test design (4 min)
```
/bmad-testarch-test-design
```
Ask for an **epic-level** design of *Epic 3: Cart & checkout*. TEA scores probability × impact for each risk and produces a prioritized P0–P3 coverage plan in `_bmad-output/test-artifacts/test-design/`.
Talking point: the plan calls out the real environment risks recorded in the PRD (shared site, 5-minute JWTs, the address validation dataset).

## 3. Run the existing suite (3 min)
```bash
npm run test:smoke          # @smoke across chromium/firefox/webkit + API
npx playwright test --ui    # UI mode: watch the checkout wizard
npm run report
# optional, richer history/categories view:
npm run test:allure && npm run allure:report
```
Walk through the patterns:
- `src/pages/`: page objects with intent-level methods.
- `src/fixtures/index.ts`: `newUser` is registered over the API and isolated per test; `signedInUser` seeds the JWT into the page, so there's no UI login.
- `src/factories/`: faker-based `buildUser()` / `buildAddress()` with overrides.
- `CheckoutPage.fillBillingAddress`: waits on the app's network calls rather than timeouts, and uses `toPass()` for a form the app re-patches asynchronously.

## 4. Find the gaps: traceability (3 min)
```
/bmad-testarch-trace
```
Ask TEA to trace `epics.md` against `tests/`. Expect a matrix that marks Stories 1.4, 2.2 AC2, 2.4, 3.2 and 3.4 as **uncovered**, plus a gate decision. P0s are covered and P1 has gaps, so expect **CONCERNS**.

## 5. Close a gap: automate (5 min)
```
/bmad-testarch-automate
```
Ask it to expand coverage for **Story 3.2 (update cart quantity)**, reusing the existing fixtures, page objects and factories. TEA generates the spec, runs it, and repairs failures. Then:
```bash
npx playwright test tests/ui/cart.spec.ts
```
Re-run `/bmad-testarch-trace` to show the gate move.

## 6. Quality review (2 min)
```
/bmad-testarch-test-review
```
TEA scores the suite against its knowledge base (determinism, isolation, explicit waits, assertion quality) and lists findings.

## 7. NFR: performance with k6 (3 min)
```bash
npm run perf:api      # 3 VUs × 30s against the API; thresholds are the NFR3 gate
```
Show the threshold block (✓/✗ per endpoint p95, error rate), then open `perf/results/dashboard.html` for the charts. On GitHub, the *k6 API baseline* workflow run shows the same results as a job summary. Then:
```
/bmad-testarch-nfr
```
Point TEA at NFR3 in the PRD and at `perf/results/api-baseline.json` as evidence. It assesses performance, security, reliability and maintainability, and flags what has no evidence yet (security and maintainability, here).
Talking point: the load stays deliberately small because Toolshop is someone else's public site. Raise `VUS`/`DURATION` only against a self-hosted copy.

## 8. Bonus: Playwright's own agents
`.claude/agents/` contains Playwright's **planner**, **generator** and **healer**, which run against `tests/ui/seed.spec.ts`.
- Break a locator (for example, change `'add-to-cart'` in `src/pages/ProductPage.ts`), run the test, then ask Claude: *"use the playwright-test-healer agent to fix the failing cart test"*.
- Or: *"use the playwright-test-planner agent to plan tests for the Contact page"* → `specs/`, then the generator turns that plan into specs.

How they fit together: **TEA decides what to test and whether you can ship** (risk, coverage, gates). **Playwright's agents and TEA's automate write and heal the tests.**
