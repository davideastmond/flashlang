import { sql } from "drizzle-orm";
import { db } from "~/db/index";

export default defineEventHandler(async () => {
  console.info("Fetching database version...");

  const response = await db.execute(sql`SELECT version()`);
  return { version: response[0].version };
});
