import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let client: ReturnType<typeof postgres> | null = null;
let database: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured.");
  const configuredPool = Number(process.env.DATABASE_POOL_MAX || 5);
  const max = Number.isInteger(configuredPool) && configuredPool >= 1 && configuredPool <= 20 ? configuredPool : 5;
  if (!client) client = postgres(url, { max, prepare: false, connect_timeout: 10, idle_timeout: 20 });
  if (!database) database = drizzle(client, { schema });
  return database;
}
