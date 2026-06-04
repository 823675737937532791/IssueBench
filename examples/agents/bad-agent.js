#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const workdir = process.env.ISSUEBENCH_WORKDIR;
const file = join(workdir, "src", "cart.js");
const source = readFileSync(file, "utf8");
writeFileSync(file, source.replace("return total - percent;", "return total;"));
console.log("cost: $0.01");
console.log("tokens: 900");
