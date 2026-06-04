# Fix percentage discount math

The `applyDiscount(total, percent)` helper in `src/cart.js` subtracts the percent as a raw number. It should treat `percent` as a percentage.

Acceptance criteria:

- `applyDiscount(100, 20)` returns `80`.
- `applyDiscount(50, 10)` returns `45`.
- Existing cart total behavior still passes.
