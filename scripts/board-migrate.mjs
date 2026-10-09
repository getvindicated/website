// Creates the /board tables. Usage: DATABASE_URL=... node scripts/board-migrate.mjs
import { readFileSync } from "node:fs";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Set DATABASE_URL first.");
  process.exit(1);
}
const sql = postgres(url, { ssl: /sslmode=require|proxy\.rlwy\.net/.test(url) ? "require" : false, onnotice: () => {} });
await sql.unsafe(readFileSync(new URL("./board-schema.sql", import.meta.url), "utf8"));
console.log("Board tables are ready.");
await sql.end();
