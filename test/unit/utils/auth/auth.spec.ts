import bcrypt from "bcrypt";
import type { Session } from "next-auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock Nuxt runtime config
vi.mock("#imports", () => ({
  useRuntimeConfig: () => ({
    nuxtAuth: {
      secret: "test-secret",
    },
  }),
}));

// Mock next-auth providers
vi.mock("next-auth/providers/credentials", () => ({
  default: {
    default: vi.fn((config: any) => ({
      ...config,
      type: "credentials",
      id: "credentials",
    })),
  },
}));

// Mock dependencies BEFORE importing the module under test
vi.mock("bcrypt");
vi.mock("../../../../db", () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn(),
      },
    },
  },
}));

// Import after mocking
import { db } from "../../../../db";
import { authOptions } from "../../../../server/utils/auth/auth";

describe("Auth Options Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("authOptions configuration", () => {
    it("should have correct secret", () => {
      expect(authOptions.secret).toBe("test-secret");
    });

    it("should use JWT session strategy", () => {
      expect(authOptions.session?.strategy).toBe("jwt");
    });

    it("should have 1 hour session maxAge", () => {
      expect(authOptions.session?.maxAge).toBe(60 * 60);
    });

    it("should configure sign in page", () => {
      expect(authOptions.pages?.signIn).toBe("/login");
    });

    it("should have Credentials provider configured", () => {
      expect(authOptions.providers).toHaveLength(1);
    });
  });

  describe("authorize function", () => {
    const mockCredentials = {
      email: "test@example.com",
      password: "password123",
    };

    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      name: "Test User",
      passwordHash: "$2b$10$hashedpassword",
    };

    it("should authorize user with valid credentials", async () => {
      vi.mocked(db.query.users.findFirst).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const credentialsProvider = authOptions.providers[0];
      // @ts-expect-error - accessing internal authorize method
      const result = await credentialsProvider.authorize(mockCredentials);

      expect(db.query.users.findFirst).toHaveBeenCalledWith({
        where: expect.any(Function),
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockCredentials.password,
        mockUser.passwordHash,
      );
      expect(result).toEqual(mockUser);
    });

    it("should throw error when user is not found", async () => {
      vi.mocked(db.query.users.findFirst).mockResolvedValue(undefined);

      const credentialsProvider = authOptions.providers[0];
      // @ts-expect-error - accessing internal authorize method
      await expect(
        credentialsProvider.authorize(mockCredentials),
      ).rejects.toThrow("Please check your credentials and try again.");
    });

    it("should throw error when password is invalid", async () => {
      vi.mocked(db.query.users.findFirst).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const credentialsProvider = authOptions.providers[0];
      // @ts-expect-error - accessing internal authorize method
      await expect(
        credentialsProvider.authorize(mockCredentials),
      ).rejects.toThrow("We can't sign you in with those credentials.");
    });

    it("should handle missing credentials gracefully", async () => {
      vi.mocked(db.query.users.findFirst).mockResolvedValue(undefined);

      const credentialsProvider = authOptions.providers[0];
      // @ts-expect-error - accessing internal authorize method
      await expect(credentialsProvider.authorize({})).rejects.toThrow(
        "Please check your credentials and try again.",
      );

      expect(db.query.users.findFirst).toHaveBeenCalledWith({
        where: expect.any(Function),
      });
    });
  });

  describe("JWT callback", () => {
    it("should add user data to token when user is present", async () => {
      const user = {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
      };

      const token = {
        sub: "user-123",
      };

      const mockDateNow = 1640000000000; // Fixed timestamp
      vi.spyOn(Date, "now").mockReturnValue(mockDateNow);

      const result = await authOptions.callbacks?.jwt?.({
        token,
        user,
        trigger: undefined,
        session: undefined,
        account: null,
      });

      expect(result).toEqual({
        sub: "user-123",
        id: user.id,
        email: user.email,
        name: user.name,
        exp: Math.floor(mockDateNow / 1000) + 60 * 60,
      });

      vi.restoreAllMocks();
    });

    it("should return token unchanged when user is not present", async () => {
      const token = {
        sub: "user-123",
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        exp: 1640003600,
      };

      const result = await authOptions.callbacks?.jwt?.({
        token,
        user: undefined,
        trigger: undefined,
        session: undefined,
        account: null,
      });

      expect(result).toEqual(token);
    });
  });

  describe("session callback", () => {
    it("should populate session with user data from token", async () => {
      const token = {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        exp: 1640003600,
      };

      const session = {
        expires: "2024-01-01",
        user: {} as Session["user"],
      };

      const result = await authOptions.callbacks?.session?.({
        session,
        token,
        user: undefined as any,
        newSession: undefined,
        trigger: undefined,
      });

      expect(result).toEqual({
        expires: "2024-01-01",
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
        },
      });
    });

    it("should handle token with missing user data", async () => {
      const token = {
        id: undefined,
        email: undefined,
        name: undefined,
      };

      const session = {
        expires: "2024-01-01",
        user: {} as Session["user"],
      };

      const result = await authOptions.callbacks?.session?.({
        session,
        token,
        user: undefined as any,
        newSession: undefined,
        trigger: undefined,
      });

      expect(result).toEqual({
        expires: "2024-01-01",
        user: {
          id: undefined,
          email: undefined,
          name: undefined,
        },
      });
    });
  });
});
