# Playwright × BMAD Method × TEA

A demo of agentic test automation. It combines [BMAD Method](https://github.com/bmad-code-org/BMAD-METHOD) v6 with its Test Architect (TEA) module, Claude Code, and a Playwright + TypeScript framework. The system under test is [Toolshop](https://practicesoftwaretesting.com), a public app built for test-automation practice (UI + REST API).

**Run the demo:** [docs/DEMO.md](docs/DEMO.md)

## Quick start
```bash
npm ci
npx playwright install
cp .env.example .env
npm test                 # all projects
npm run test:smoke       # @smoke only
npm run test:api         # API only
npm run test:ui          # chromium UI only
npm run report

# Optional: Allure report (off unless ALLURE is set)
npm run test:allure      # same tests, also writes allure-results/
npm run allure:report    # build + open allure-report/
```

## Performance (k6, NFR3)
```bash
brew install k6          # or see https://grafana.com/docs/k6/latest/set-up/install-k6/
npm run perf:api         # light baseline: 3 VUs × 30s; fails (exit 99) if a threshold is crossed
VUS=5 DURATION=1m npm run perf:api
```
`perf/api-baseline.ts` (k6 runs TypeScript natively) browses products, views a product, searches and fetches the signed-in profile. Its thresholds are NFR3 from the PRD. The summary goes to `perf/results/api-baseline.json`, which is evidence for `/bmad-testarch-nfr`.
In CI it runs only on demand (Actions → *k6 API baseline* → Run workflow). Keep the load small: Toolshop is a shared public site.

## Playwright CLI (for agents)
[`@playwright/cli`](https://github.com/microsoft/playwright-cli) gives Claude Code a token-efficient browser it drives with short shell commands. It's a lighter alternative to the MCP for exploring pages and picking locators.
```bash
npm i -g @playwright/cli@0.1.22   # TEA calls the bare `playwright-cli` command, so it must be on PATH
playwright-cli open https://practicesoftwaretesting.com --headed
playwright-cli snapshot           # accessibility snapshot with element refs
playwright-cli show               # dashboard of the browser sessions agents are running
```
It's also a devDependency (`npx playwright-cli`), and its Claude Code skill is in `.claude/skills/playwright-cli/`.
TEA uses `tea_browser_automation: auto`: it starts with the CLI and escalates to the Playwright MCP when it needs deeper inspection.

## Layout
```
playwright.config.ts     setup → chromium/firefox/webkit; separate `api` project; testIdAttribute = data-test
src/pages/               page objects (+ components/NavBar, composed rather than inherited)
src/api/ToolshopApi.ts   typed API client used for setup and API tests
src/factories/           faker test-data builders: buildUser(), buildAddress()
src/fixtures/index.ts    test.extend: page objects, api, newUser, signedInUser
tests/auth.setup.ts      seed-customer login → storageState
tests/ui, tests/api      specs, tagged @smoke / @regression
perf/                    k6 performance tests (NFR3)
_bmad/                   BMAD core + BMM + TEA (installed by `npx bmad-method install`)
.claude/skills/          BMAD/TEA slash commands + playwright-cli skill for Claude Code
.claude/agents/          Playwright planner / generator / healer agents
_bmad-output/            PRD + epics (inputs) and TEA test artifacts (outputs)
```

## Conventions
- Locators: `getByTestId` / `getByRole` only. Never `waitForTimeout`. ESLint enforces this with `eslint-plugin-playwright`.
- Every test creates its own user via the API, so tests are parallel-safe on a shared public site.
- Page objects expose intent ("addToCart", "placeOrder"). Specs own the assertions. Page objects only wait for readiness.
- Waits are tied to the app's real network calls (`waitForResponse`), not sleeps.

## BMAD / TEA
Installed with:
```bash
npx bmad-method install --modules bmm,tea --tools claude-code
```
The BMM v6 installer bundles TEA **v1.27**, with commands `/bmad-tea`, `/bmad-testarch-test-design`, `/bmad-testarch-atdd`, `/bmad-testarch-automate`, `/bmad-testarch-test-review`, `/bmad-testarch-trace`, `/bmad-testarch-nfr`, `/bmad-testarch-ci` and `/bmad-testarch-framework`.
TEA settings are in `_bmad/tea/config.yaml`. To change one: `npx bmad-method install --action quick-update --yes --set tea.<key>=<value>`.

## Toolshop quirks worth knowing
- **Cloudflare bot check:** GitHub-hosted runners (datacenter IPs) get a "Performing security verification" challenge on the UI. CI therefore runs lint, typecheck and the API project only, and UI tests run locally. `LoginPage.goto()` reports the challenge explicitly instead of timing out.
- **Cold starts:** the first request can take 15s+. The config uses a 45s navigation timeout and 1 retry locally / 2 in CI.
- **JWTs live 5 minutes:** `auth.setup.ts` logs in on every run instead of caching state.
- **The catalog uses the HTTP `QUERY` method:** waits match on the endpoint path, not GET + query string.
- **Billing addresses are validated:** the invoice API rejects a city or state that isn't in its postcode-lookup data for the country. Checkout enters country, postcode and house number and lets the app autofill the rest.
