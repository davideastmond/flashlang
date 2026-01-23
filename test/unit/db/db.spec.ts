import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the dependencies before importing the db module
vi.mock("drizzle-orm/postgres-js", () => ({
  drizzle: vi.fn((connection, config) => ({
    connection,
    schema: config?.schema,
  })),
}));

vi.mock("postgres", () => {
  const mockPostgres = vi.fn((url: string) => ({
    url,
    connected: true,
  }));
  return {
    default: mockPostgres,
  };
});

describe("db/index", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset modules to ensure fresh imports
    vi.resetModules();
    // Clone the original environment
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore the original environment
    process.env = originalEnv;
  });

  describe("DATABASE_URL validation", () => {
    it("should throw an error when DATABASE_URL is not set", async () => {
      // Remove DATABASE_URL
      delete process.env.DATABASE_URL;

      // Expect the module import to throw
      await expect(async () => {
        await import("../../../db/index");
      }).rejects.toThrow("DATABASE_URL is not set");
    });

    it("should throw an error when DATABASE_URL is an empty string", async () => {
      process.env.DATABASE_URL = "";

      await expect(async () => {
        await import("../../../db/index");
      }).rejects.toThrow("DATABASE_URL is not set");
    });
  });

  describe("database initialization", () => {
    it("should initialize database connection with valid DATABASE_URL", async () => {
      process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/testdb";

      const postgres = (await import("postgres")).default;
      const { drizzle } = await import("drizzle-orm/postgres-js");

      // Import the db module
      const { db } = await import("../../../db/index");

      // Verify postgres was called with the correct URL
      expect(postgres).toHaveBeenCalledWith(
        "postgresql://user:pass@localhost:5432/testdb",
      );

      // Verify drizzle was called
      expect(drizzle).toHaveBeenCalled();

      // Verify db is exported
      expect(db).toBeDefined();
    });

    it("should pass schema to drizzle configuration", async () => {
      process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/testdb";

      const { drizzle } = await import("drizzle-orm/postgres-js");
      const schema = await import("../../../db/schema");

      // Import the db module
      await import("../../../db/index");

      // Verify drizzle was called with schema
      expect(drizzle).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ schema }),
      );
    });

    it("should create connection before initializing drizzle", async () => {
      process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/testdb";

      const postgres = (await import("postgres")).default;
      const { drizzle } = await import("drizzle-orm/postgres-js");

      // Import the db module
      await import("../../../db/index");

      // Get the call order
      const postgresCallOrder = (postgres as any).mock.invocationCallOrder[0];
      const drizzleCallOrder = (drizzle as any).mock.invocationCallOrder[0];

      // Verify postgres was called before drizzle
      expect(postgresCallOrder).toBeLessThan(drizzleCallOrder);
    });
  });

  describe("exported db object", () => {
    it("should export a db instance with connection and schema", async () => {
      process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/testdb";

      const { db } = await import("../../../db/index");

      expect(db).toBeDefined();
      expect(db).toHaveProperty("connection");
      expect(db).toHaveProperty("schema");
    });

    it("should handle different DATABASE_URL formats", async () => {
      const testUrls = [
        "postgresql://localhost/mydb",
        "postgres://user@host:5432/db",
        "postgresql://user:password@host.com:5432/database?ssl=true",
      ];

      for (const url of testUrls) {
        vi.resetModules();
        process.env.DATABASE_URL = url;

        const postgres = (await import("postgres")).default;
        await import("../../../db/index");

        expect(postgres).toHaveBeenCalledWith(url);
      }
    });
  });

  describe("schema integration", () => {
    it("should include all required schema tables", async () => {
      process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/testdb";

      const schema = await import("../../../db/schema");

      // Note: this will need to be updated if schema changes
      expect(Object.keys(schema).length).toBe(6);
      // Verify all expected tables are exported
      expect(schema.users).toBeDefined();
      expect(schema.sessions).toBeDefined();
      expect(schema.flashCards).toBeDefined();
      expect(schema.studySets).toBeDefined();
      expect(schema.studySetFlashCards).toBeDefined();
      expect(schema.studySessions).toBeDefined();
    });
  });
});
