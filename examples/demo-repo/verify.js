import assert from "node:assert/strict";
import { applyDiscount, total } from "./src/cart.js";

assert.equal(total([{ price: 10 }, { price: 15 }]), 25);
assert.equal(applyDiscount(100, 20), 80);
assert.equal(applyDiscount(50, 10), 45);

console.log("demo tests passed");
