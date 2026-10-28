# PRD: Toolshop storefront (test target)

**System under test:** Toolshop, https://practicesoftwaretesting.com (UI) and https://api.practicesoftwaretesting.com (REST API).
Toolshop is a public practice app, not ours. This PRD records the behaviour we verify, so BMAD/TEA can reason about risk, coverage and release gates.

## Goal
Customers can find tools, buy them, and manage an account, without errors that block revenue.

## Users
- **Visitor**: browses and searches the catalog.
- **Customer**: registered; can buy and see their account.

## Functional requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| FR1 | Visitors can register; registered customers can sign in and out | P0 |
| FR2 | Invalid credentials and duplicate registrations are rejected with a clear error | P1 |
| FR3 | Catalog supports text search, sorting, and category / brand filters | P1 |
| FR4 | Customers can add products to a cart and see quantities and totals | P0 |
| FR5 | Signed-in customers can check out (billing address, payment) and receive an invoice number | P0 |
| FR6 | Customers can save products as favorites | P2 |
| FR7 | Public REST API exposes products, search and user auth with correct status codes | P1 |

## Non-functional requirements
- **NFR1 Reliability:** the critical path (FR1, FR4, FR5) passes on Chromium, Firefox and WebKit.
- **NFR2 Test isolation:** every test creates its own data and can run in parallel against the shared public site.

## Known environment constraints
- Shared public demo: cold starts of 15s+ have been observed; data is reset periodically.
- JWTs expire after 5 minutes.
- The invoice API validates that billing city/state belong to the country (it uses the postcode-lookup dataset).
