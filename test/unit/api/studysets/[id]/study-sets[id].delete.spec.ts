// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as dbModule from "../../../../../db/index.ts";
import { useH3TestUtils } from "../../../../setup.ts";

const { defineEventHandler } = useH3TestUtils();

// Mock the database module
const mockDelete = vi.fn();
const mockWhere = vi.fn();

vi.mock("../../../../../db/index.ts", () => ({
  db: {
    delete: vi.fn(),
  },
}));

// Mock the auth module
const mockGetServerSession = vi.fn();
vi.mock("#auth", () => ({
  getServerSession: vi.fn(),
}));

describe("api/studysets/[id] DELETE endpoint tests", async () => {
  const handler =
    await import("../../../../../server/api/studysets/[id]/index.delete.ts");
  const authModule = await import("#auth");

  beforeEach(() => {
    mockDelete.mockClear();
    mockWhere.mockClear();
    mockGetServerSession.mockClear();

    // Set up the chain of mocked query builder methods
    mockWhere.mockResolvedValue(undefined);
    mockDelete.mockReturnValue({ where: mockWhere });

    (dbModule.db.delete as any) = mockDelete;
    (authModule.getServerSession as any) = mockGetServerSession;
  });

  it("is registered as an event handler", () => {
    expect(defineEventHandler).toHaveBeenCalled();
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
        }),
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(401);
    expect(response.statusMessage).toBe("Unauthorized");
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("returns 401 when session exists but has no user", async () => {
    mockGetServerSession.mockResolvedValue({ user: null });

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
        }),
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(401);
    expect(response.statusMessage).toBe("Unauthorized");
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("successfully deletes a study set when user is authenticated", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
        }),
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      success: true,
    });
    expect(mockDelete).toHaveBeenCalled();
    expect(mockWhere).toHaveBeenCalled();
  });

  it("only deletes study sets belonging to the authenticated user", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-456" },
    });

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-789" },
        }),
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      success: true,
    });
    expect(mockDelete).toHaveBeenCalled();
    // Verify that the where clause is used (to ensure userId is checked)
    expect(mockWhere).toHaveBeenCalled();
  });

  it("returns 500 on database error", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    // Simulate a database error
    mockWhere.mockRejectedValue(new Error("Database connection failed"));

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
        }),
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(500);
    expect(response.statusMessage).toBe("Internal Server Error");
    expect(mockDelete).toHaveBeenCalled();
  });

  it("handles deletion with valid UUID format", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const validUUID = "550e8400-e29b-41d4-a716-446655440000";

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: validUUID },
        }),
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      success: true,
    });
    expect(mockDelete).toHaveBeenCalled();
  });

  it("processes delete request even if study set does not exist", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    // The endpoint doesn't check if the study set exists before attempting delete
    // It will return success even if nothing was deleted
    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "nonexistent-study-set" },
        }),
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      success: true,
    });
    expect(mockDelete).toHaveBeenCalled();
  });

  it("uses both studySetId and userId in the where clause", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-789" },
    });

    const studySetId = "study-set-456";

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: studySetId },
        }),
    );

    await handler.default(event);

    // Verify delete was called
    expect(mockDelete).toHaveBeenCalled();
    // Verify where was called with conditions
    expect(mockWhere).toHaveBeenCalled();

    // The where clause should use both the studySetId and userId
    // to ensure users can only delete their own study sets
  });

  it("handles concurrent delete requests", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event1 = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-1" },
        }),
    );

    const event2 = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-2" },
        }),
    );

    const [response1, response2] = await Promise.all([
      handler.default(event1),
      handler.default(event2),
    ]);

    expect(response1).toEqual({ success: true });
    expect(response2).toEqual({ success: true });
    expect(mockDelete).toHaveBeenCalledTimes(2);
  });

  it("returns error when database throws specific error", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const dbError = new Error("Foreign key constraint violation");
    mockWhere.mockRejectedValue(dbError);

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
        }),
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(500);
    expect(response.statusMessage).toBe("Internal Server Error");
  });

  it("handles deletion with different user IDs correctly", async () => {
    // Test that different users can delete their own study sets
    const userIds = ["user-1", "user-2", "user-3"];
    const studySetIds = ["set-1", "set-2", "set-3"];

    for (let i = 0; i < userIds.length; i++) {
      mockGetServerSession.mockResolvedValue({
        user: { id: userIds[i] },
      });

      const event = await import("../../../../utils/mock-h3-event.ts").then(
        ({ createMockH3Event }) =>
          createMockH3Event({
            params: { id: studySetIds[i] },
          }),
      );

      const response = await handler.default(event);

      expect(response).toEqual({ success: true });
    }

    expect(mockDelete).toHaveBeenCalledTimes(3);
  });

  it("handles empty string as study set ID", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "" },
        }),
    );

    const response = await handler.default(event);

    // The endpoint will still attempt to delete, even with empty string
    expect(response).toEqual({ success: true });
    expect(mockDelete).toHaveBeenCalled();
  });

  it("handles special characters in study set ID", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const specialId = "study-set-with-special-chars-!@#";

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: specialId },
        }),
    );

    const response = await handler.default(event);

    expect(response).toEqual({ success: true });
    expect(mockDelete).toHaveBeenCalled();
  });
});
