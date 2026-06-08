import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(process.cwd()),
  serverExternalPackages: [
    "better-auth",
    "@better-auth/kysely-adapter",
    "kysely",
    "drizzle-orm",
    "@neondatabase/serverless",
    "ws",
    "pg",
  ],
};

export default nextConfig;
