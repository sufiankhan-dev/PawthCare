import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

// The Neon serverless driver needs a WebSocket implementation in Node.js.
neonConfig.webSocketConstructor = ws;

const connectionString =
  process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@localhost/placeholder";

const pool = new Pool({ connectionString });

export const db = drizzle(pool, { schema });

export { schema };
