// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useH3TestUtils } from "../../../setup.ts";

const { defineEventHandler, createError } = useH3TestUtils();

// Mock the auth module
const mockGetServerSession = vi.fn();
vi.mock("#auth", () => ({
  getServerSession: vi.fn(),
}));

describe("auth middleware tests", async () => {
  const handler = await import("../../../../server/middleware/auth.ts");
  const authModule = await import("#auth");

  beforeEach(() => {
    vi.clearAllMocks();
    (authModule.getServerSession as any) = mockGetServerSession;
  });

  describe("when path does not require authentication", () => {
    it("allows requests to unprotected paths", async () => {
      const event = await import("../../../utils/mock-h3-event.ts").then(
        ({ createMockH3Event }) =>
          createMockH3Event({
            path: "/api/signup",
          }),
      );

      await expect(handler.default(event)).resolves.toBeUndefined();
      expect(mockGetServerSession).not.toHaveBeenCalled();
      expect(createError).not.toHaveBeenCalled();
    });

    it("allows requests to root path", async () => {
      const event = await import("../../../utils/mock-h3-event.ts").then(
        ({ createMockH3Event }) =>
          createMockH3Event({
            path: "/",
          }),
      );

      await expect(handler.default(event)).resolves.toBeUndefined();
      expect(mockGetServerSession).not.toHaveBeenCalled();
      expect(createError).not.toHaveBeenCalled();
    });

    it("allows requests to non-API paths", async () => {
      const event = await import("../../../utils/mock-h3-event.ts").then(
        ({ createMockH3Event }) =>
          createMockH3Event({
            path: "/login",
          }),
      );

      await expect(handler.default(event)).resolves.toBeUndefined();
      expect(mockGetServerSession).not.toHaveBeenCalled();
      expect(createError).not.toHaveBeenCalled();
    });
  });

  describe("when path requires authentication - /api/study-sessions", () => {
    it("allows authenticated requests", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "user-123", email: "test@example.com" },
      });

      const event = await import("../../../utils/mock-h3-event.ts").then(
        ({ createMockH3Event }) =>
          createMockH3Event({
            path: "/api/study-sessions",
          }),
      );

      await expect(handler.default(event)).resolves.toBeUndefined();
      expect(mockGetServerSession).toHaveBeenCalledWith(event);
      expect(createError).not.toHaveBeenCalled();
    });

    it("blocks requests when session is null", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const event = await import("../../../utils/mock-h3-event.ts").then(
        ({ createMockH3Event }) =>
          createMockH3Event({
            path: "/api/study-sessions",
          }),
      );

      const result = await handler.default(event);

      expect(result).toEqual({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
      expect(mockGetServerSession).toHaveBeenCalledWith(event);
      expect(createError).toHaveBeenCalledWith({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    });

    it("blocks requests when session exists but user is null", async () => {
      mockGetServerSession.mockResolvedValue({ user: null });

      const event = await import("../../../utils/mock-h3-event.ts").then(
        ({ createMockH3Event }) =>
          createMockH3Event({
            path: "/api/study-sessions/123",
          }),
      );

      const result = await handler.default(event);

      expect(result).toEqual({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
      expect(mockGetServerSession).toHaveBeenCalledWith(event);
      expect(createError).toHaveBeenCalledWith({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    });

    it("blocks requests when session exists but user is undefined", async () => {
      mockGetServerSession.mockResolvedValue({ user: undefined });

      const event = await import("../../../utils/mock-h3-event.ts").then(
        ({ createMockH3Event }) =>
          createMockH3Event({
            path: "/api/study-sessions/abc",
          }),
      );

      const result = await handler.default(event);

      expect(result).toEqual({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
      expect(mockGetServerSession).toHaveBeenCalledWith(event);
      expect(createError).toHaveBeenCalledWith({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    });
  });

  describe("when path requires authentication - /api/ai/", () => {
    it("allows authenticated requests to AI endpoints", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "user-456", email: "user@test.com" },
      });

      const event = await import("../../../utils/mock-h3-event.ts").then(
        ({ createMockH3Event }) =>
          createMockH3Event({
            path: "/api/ai/flashcards",
          }),
      );

      await expect(handler.default(event)).resolves.toBeUndefined();
      expect(mockGetServerSession).toHaveBeenCalledWith(event);
      expect(createError).not.toHaveBeenCalled();
    });

    it("blocks unauthenticated requests to AI endpoints", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const event = await import("../../../utils/mock-h3-event.ts").then(
        ({ createMockH3Event }) =>
          createMockH3Event({
            path: "/api/ai/answer-judge",
          }),
      );

      const result = await handler.default(event);

      expect(result).toEqual({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
      expect(createError).toHaveBeenCalledWith({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    });
  });

  describe("when path requires authentication - /api/flash-cards", () => {
    it("allows authenticated requests to flash-cards endpoints", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "user-789" },
      });

      const event = await import("../../../utils/mock-h3-event.ts").then(
        ({ createMockH3Event }) =>
          createMockH3Event({
            path: "/api/flash-cards/123",
          }),
      );

      await expect(handler.default(event)).resolves.toBeUndefined();
      expect(mockGetServerSession).toHaveBeenCalledWith(event);
      expect(createError).not.toHaveBeenCalled();
    });

    it("blocks unauthenticated requests to flash-cards endpoints", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const event = await import("../../../utils/mock-h3-event.ts").then(
        ({ createMockH3Event }) =>
          createMockH3Event({
            path: "/api/flash-cards",
          }),
      );

      const result = await handler.default(event);

      expect(result).toEqual({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
      expect(createError).toHaveBeenCalledWith({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    });
  });

  describe("when path requires authentication - /api/studysets", () => {
    it("allows authenticated requests to studysets endpoints", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "user-abc", email: "studyset@example.com" },
      });

      const event = await import("../../../utils/mock-h3-event.ts").then(
        ({ createMockH3Event }) =>
          createMockH3Event({
            path: "/api/studysets/456/cards",
          }),
      );

      await expect(handler.default(event)).resolves.toBeUndefined();
      expect(mockGetServerSession).toHaveBeenCalledWith(event);
      expect(createError).not.toHaveBeenCalled();
    });

    it("blocks unauthenticated requests to studysets endpoints", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const event = await import("../../../utils/mock-h3-event.ts").then(
        ({ createMockH3Event }) =>
          createMockH3Event({
            path: "/api/studysets",
          }),
      );

      const result = await handler.default(event);

      expect(result).toEqual({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
      expect(createError).toHaveBeenCalledWith({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    });
  });

  describe("when path requires authentication - /api/user", () => {
    it("allows authenticated requests to user endpoints", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "user-def", email: "user@domain.com" },
      });

      const event = await import("../../../utils/mock-h3-event.ts").then(
        ({ createMockH3Event }) =>
          createMockH3Event({
            path: "/api/user/profile",
          }),
      );

      await expect(handler.default(event)).resolves.toBeUndefined();
      expect(mockGetServerSession).toHaveBeenCalledWith(event);
      expect(createError).not.toHaveBeenCalled();
    });

    it("blocks unauthenticated requests to user endpoints", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const event = await import("../../../utils/mock-h3-event.ts").then(
        ({ createMockH3Event }) =>
          createMockH3Event({
            path: "/api/user",
          }),
      );

      const result = await handler.default(event);

      expect(result).toEqual({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
      expect(createError).toHaveBeenCalledWith({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    });
  });

  describe("edge cases", () => {
    it("handles getServerSession throwing an error", async () => {
      mockGetServerSession.mockRejectedValue(new Error("Auth service error"));

      const event = await import("../../../utils/mock-h3-event.ts").then(
        ({ createMockH3Event }) =>
          createMockH3Event({
            path: "/api/studysets",
          }),
      );

      await expect(handler.default(event)).rejects.toThrow(
        "Auth service error",
      );
      expect(mockGetServerSession).toHaveBeenCalledWith(event);
    });

    it("correctly identifies paths that start with protected patterns", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "user-ghi" },
      });

      const event = await import("../../../utils/mock-h3-event.ts").then(
        ({ createMockH3Event }) =>
          createMockH3Event({
            path: "/api/ai/some/nested/path",
          }),
      );

      await expect(handler.default(event)).resolves.toBeUndefined();
      expect(mockGetServerSession).toHaveBeenCalledWith(event);
      expect(createError).not.toHaveBeenCalled();
    });

    it("protects paths that start with protected patterns like /api/user", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "user-xyz" },
      });

      const event = await import("../../../utils/mock-h3-event.ts").then(
        ({ createMockH3Event }) =>
          createMockH3Event({
            path: "/api/userdata",
          }),
      );

      await expect(handler.default(event)).resolves.toBeUndefined();
      expect(mockGetServerSession).toHaveBeenCalledWith(event);
      expect(createError).not.toHaveBeenCalled();
    });

    it("protects exact path matches", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "user-jkl" },
      });

      const event = await import("../../../utils/mock-h3-event.ts").then(
        ({ createMockH3Event }) =>
          createMockH3Event({
            path: "/api/user",
          }),
      );

      await expect(handler.default(event)).resolves.toBeUndefined();
      expect(mockGetServerSession).toHaveBeenCalledWith(event);
      expect(createError).not.toHaveBeenCalled();
    });
  });
});
