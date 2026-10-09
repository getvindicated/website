import postgres from "postgres";

// One shared connection pool per server process. DATABASE_URL comes from
// Railway's Postgres service.
const globalForDb = globalThis as unknown as { boardSql?: ReturnType<typeof postgres> };

export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is missing");
  globalForDb.boardSql ??= postgres(url, {
    max: 5,
    // Railway's public proxy needs TLS; the private network and local
    // Postgres don't.
    ssl: /sslmode=require|proxy\.rlwy\.net/.test(url) ? "require" : false,
    // Keep `date` columns as plain YYYY-MM-DD strings so calendar days
    // never shift with the server's time zone.
    types: {
      date: {
        to: 1082,
        from: [1082],
        serialize: (x: string) => x,
        parse: (x: string) => x,
      },
    },
  });
  return globalForDb.boardSql;
}
