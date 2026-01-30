// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useH3TestUtils } from "../../../setup.ts";

const { defineEventHandler, createError } = useH3TestUtils();

describe("ai-safeguard middleware tests", async () => {
  const handler = await import("../../../../server/middleware/ai-safeguard.ts");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when AI_ENABLED is true", () => {
    beforeEach(() => {
      process.env.AI_ENABLED = "true";
    });

    it("allows requests to AI endpoints", async () => {
      const event = await import("../../../utils/mock-h3-event.ts").then(
        ({ createMockH3Event }) =>
          createMockH3Event({
            path: "/api/ai/flashcards",
          }),
      );

      await expect(handler.default(event)).resolves.toBeUndefined();
      expect(createError).not.toHaveBeenCalled();
    });

    it("allows requests to non-AI endpoints", async () => {
      const event = await import("../../../utils/mock-h3-event.ts").then(
        ({ createMockH3Event }) =>
          createMockH3Event({
            path: "/api/studysets",
          }),
      );

      await expect(handler.default(event)).resolves.toBeUndefined();
      expect(createError).not.toHaveBeenCalled();
    });

    it("allows requests to AI answer-judge endpoint", async () => {
      const event = await import("../../../utils/mock-h3-event.ts").then(
        ({ createMockH3Event }) =>
          createMockH3Event({
            path: "/api/ai/answer-judge",
          }),
      );

      await expect(handler.default(event)).resolves.toBeUndefined();
      expect(createError).not.toHaveBeenCalled();
    });
  });

  describe("when AI_ENABLED is false", () => {
    beforeEach(() => {
      process.env.AI_ENABLED = "false";
    });

    it("blocks requests to AI flashcards endpoint", async () => {
      const event = await import("../../../utils/mock-h3-event.ts").then(
        ({ createMockH3Event }) =>
          createMockH3Event({
            path: "/api/ai/flashcards",
          }),
      );

      await expect(handler.default(event)).rejects.toEqual({
        statusCode: 503,
        statusMessage: "AI services are currently disabled.",
      });

      expect(createError).toHaveBeenCalledWith({
        statusCode: 503,
        statusMessage: "AI services are currently disabled.",
      });
    });

    it("blocks requests to AI answer-judge endpoint", async () => {
      const event = await import("../../../utils/mock-h3-event.ts").then(
        ({ createMockH3Event }) =>
          createMockH3Event({
            path: "/api/ai/answer-judge",
          }),
      );

      await expect(handler.default(event)).rejects.toEqual({
        statusCode: 503,
        statusMessage: "AI services are currently disabled.",
      });

      expect(createError).toHaveBeenCalledWith({
        statusCode: 503,
        statusMessage: "AI services are currently disabled.",
      });
    });

    it("blocks requests to any endpoint under /api/ai/", async () => {
      const event = await import("../../../utils/mock-h3-event.ts").then(
        ({ createMockH3Event }) =>
          createMockH3Event({
            path: "/api/ai/some-new-feature",
          }),
      );

      await expect(handler.default(event)).rejects.toEqual({
        statusCode: 503,
        statusMessage: "AI services are currently disabled.",
      });

      expect(createError).toHaveBeenCalledWith({
        statusCode: 503,
        statusMessage: "AI services are currently disabled.",
      });
    });

    it("allows requests to non-AI endpoints", async () => {
      const event = await import("../../../utils/mock-h3-event.ts").then(
        ({ createMockH3Event }) =>
          createMockH3Event({
            path: "/api/studysets",
          }),
      );

      await expect(handler.default(event)).resolves.toBeUndefined();
      expect(createError).not.toHaveBeenCalled();
    });

    it("allows requests to user endpoints", async () => {
      const event = await import("../../../utils/mock-h3-event.ts").then(
        ({ createMockH3Event }) =>
          createMockH3Event({
            path: "/api/user/profile",
          }),
      );

      await expect(handler.default(event)).resolves.toBeUndefined();
      expect(createError).not.toHaveBeenCalled();
    });

    it("allows requests to auth endpoints", async () => {
      const event = await import("../../../utils/mock-h3-event.ts").then(
        ({ createMockH3Event }) =>
          createMockH3Event({
            path: "/api/auth/login",
          }),
      );

      await expect(handler.default(event)).resolves.toBeUndefined();
      expect(createError).not.toHaveBeenCalled();
    });
  });

  describe("when AI_ENABLED is undefined", () => {
    beforeEach(() => {
      delete process.env.AI_ENABLED;
    });

    it("blocks requests to AI endpoints (defaults to disabled)", async () => {
      const event = await import("../../../utils/mock-h3-event.ts").then(
        ({ createMockH3Event }) =>
          createMockH3Event({
            path: "/api/ai/flashcards",
          }),
      );

      await expect(handler.default(event)).rejects.toEqual({
        statusCode: 503,
        statusMessage: "AI services are currently disabled.",
      });

      expect(createError).toHaveBeenCalledWith({
        statusCode: 503,
        statusMessage: "AI services are currently disabled.",
      });
    });

    it("allows requests to non-AI endpoints", async () => {
      const event = await import("../../../utils/mock-h3-event.ts").then(
        ({ createMockH3Event }) =>
          createMockH3Event({
            path: "/api/studysets",
          }),
      );

      await expect(handler.default(event)).resolves.toBeUndefined();
      expect(createError).not.toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    beforeEach(() => {
      process.env.AI_ENABLED = "false";
    });

    it("handles paths with /api/ai/ in the middle correctly", async () => {
      const event = await import("../../../utils/mock-h3-event.ts").then(
        ({ createMockH3Event }) =>
          createMockH3Event({
            path: "/api/ai/nested/deep",
          }),
      );

      await expect(handler.default(event)).rejects.toEqual({
        statusCode: 503,
        statusMessage: "AI services are currently disabled.",
      });
    });

    it("does not block paths that only contain 'ai' but not '/api/ai/'", async () => {
      const event = await import("../../../utils/mock-h3-event.ts").then(
        ({ createMockH3Event }) =>
          createMockH3Event({
            path: "/api/email-service",
          }),
      );

      await expect(handler.default(event)).resolves.toBeUndefined();
      expect(createError).not.toHaveBeenCalled();
    });
  });
});
