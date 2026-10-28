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
```

## Layout
```
playwright.config.ts     setup → chromium/firefox/webkit; separate `api` project; testIdAttribute = data-test
src/pages/               page objects (+ components/NavBar, composed rather than inherited)
src/api/ToolshopApi.ts   typed API client used for setup and API tests
src/factories/           faker test-data builders: buildUser(), buildAddress()
src/fixtures/index.ts    test.extend: page objects, api, newUser, signedInUser
tests/auth.setup.ts      seed-customer login → storageState
tests/ui, tests/api      specs, tagged @smoke / @regression
_bmad/                   BMAD core + BMM + TEA (installed by `npx bmad-method install`)
.claude/skills/          BMAD/TEA slash commands for Claude Code
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
- **Cold starts:** the first request can take 15s+. The config uses a 45s navigation timeout and 1 retry locally / 2 in CI.
- **JWTs live 5 minutes:** `auth.setup.ts` logs in on every run instead of caching state.
- **The catalog uses the HTTP `QUERY` method:** waits match on the endpoint path, not GET + query string.
- **Billing addresses are validated:** the invoice API rejects a city or state that isn't in its postcode-lookup data for the country. Checkout enters country, postcode and house number and lets the app autofill the rest.
