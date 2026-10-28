# Epics & Stories: Toolshop storefront

Story IDs are referenced from test titles and by `/bmad-testarch-trace`. Priorities: P0 = blocks revenue, P1 = important, P2 = nice to have.

## Epic 1: Authentication (FR1, FR2)

### Story 1.1: Sign in and out (P0)
- **AC1** Given a registered customer, when they sign in with valid credentials, then they land on `/account` and the menu shows their full name.
- **AC2** When a signed-in customer signs out, then the "Sign in" link is shown again.

### Story 1.2: Reject bad credentials (P1)
- **AC1** Given a wrong password, when signing in, then "Invalid email or password" is shown and the user stays on the login page.
- **AC2** The login API returns 401 for a wrong password.

### Story 1.3: Register (P0)
- **AC1** Given a new visitor, when they submit a valid registration form, then they are sent to login and can sign in with the new credentials.
- **AC2** The register API returns 422 listing missing mandatory fields, and 409 for a duplicate email.

### Story 1.4: Reset forgotten password (P2)
- **AC1** Given a registered email, when the customer submits the forgot-password form, then a confirmation message is shown.

## Epic 2: Catalog & search (FR3, FR7)

### Story 2.1: Search products (P1)
- **AC1** Given a search term, then only products whose names match are shown, and the count matches the API's search result.
- **AC2** Given a term with no match, then "There are no products found." is shown.

### Story 2.2: Sort products (P1)
- **AC1** When sorting by price low to high, then the grid is in ascending price order.
- **AC2** When sorting by name A-Z, then the grid is in alphabetical order.

### Story 2.3: Filter by category (P1)
- **AC1** When the "Hammer" category is selected, then only hammers are shown.

### Story 2.4: Filter by brand (P2)
- **AC1** When a single brand is selected, then every product shown belongs to that brand.

### Story 2.5: Products API (P1)
- **AC1** `GET /products` returns paginated products with id, name and price.
- **AC2** `GET /products/{unknown}` returns 404.

## Epic 3: Cart & checkout (FR4, FR5, FR6)

### Story 3.1: Add to cart (P0)
- **AC1** When a customer adds 2 of a product, then a confirmation toast shows, the cart badge reads 2, and the cart line total is 2 × unit price.

### Story 3.2: Update cart quantity (P1)
- **AC1** When the quantity of a cart line is changed, then the line total and cart total update.
- **AC2** When a line is removed, then it disappears from the cart.

### Story 3.3: Check out (P0)
- **AC1** Given a signed-in customer with items in the cart, the sign-in step greets them by name.
- **AC2** Entering country, postcode and house number autofills the billing address.
- **AC3** Paying by cash on delivery shows "Payment was successful", and confirming shows an invoice number `INV-…`.

### Story 3.4: Favorites (P2)
- **AC1** When a signed-in customer adds a product to favorites, then it appears under My favorites.
