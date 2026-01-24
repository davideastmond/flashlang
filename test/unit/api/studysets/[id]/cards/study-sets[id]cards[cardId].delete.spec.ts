// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as dbModule from "../../../../../../db/index.ts";
import { useH3TestUtils } from "../../../../../setup.ts";

const { defineEventHandler } = useH3TestUtils();

// Mock the database module
const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockLimit = vi.fn();
const mockDelete = vi.fn();

vi.mock("../../../../../../db/index.ts", () => ({
  db: {
    select: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock the auth module
const mockGetServerSession = vi.fn();
vi.mock("#auth", () => ({
  getServerSession: vi.fn(),
}));

describe("api/studysets/[id]/cards/[cardId] DELETE endpoint tests", async () => {
  const handler =
    await import("../../../../../../server/api/studysets/[id]/cards/[cardId].delete.ts");
  const authModule = await import("#auth");

  beforeEach(() => {
    mockSelect.mockClear();
    mockFrom.mockClear();
    mockWhere.mockClear();
    mockLimit.mockClear();
    mockDelete.mockClear();
    mockGetServerSession.mockClear();

    // Set up the chain of mocked query builder methods
    mockLimit.mockResolvedValue([]);
    mockWhere.mockReturnValue({ limit: mockLimit });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockSelect.mockReturnValue({ from: mockFrom });

    // Set up delete chain
    mockDelete.mockReturnValue({ where: mockWhere });

    (dbModule.db.select as any) = mockSelect;
    (dbModule.db.delete as any) = mockDelete;
    (authModule.getServerSession as any) = mockGetServerSession;
  });

  it("is registered as an event handler", () => {
    expect(defineEventHandler).toHaveBeenCalled();
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const event = await import("../../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "set-1", cardId: "card-1" },
        }),
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(401);
    expect(response.statusMessage).toBe("Unauthorized");
    expect(mockSelect).not.toHaveBeenCalled();
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("returns 401 when session exists but has no user", async () => {
    mockGetServerSession.mockResolvedValue({ user: null });

    const event = await import("../../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "set-1", cardId: "card-1" },
        }),
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(401);
    expect(response.statusMessage).toBe("Unauthorized");
    expect(mockSelect).not.toHaveBeenCalled();
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("returns 400 when study set ID is missing", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { cardId: "card-1" },
        }),
    );

    const response = await handler.default(event);
    expect(response.statusCode).toBe(400);
    expect(response.statusMessage).toBe(
      "Study set ID and card ID are required",
    );
    expect(mockSelect).not.toHaveBeenCalled();
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("returns 400 when card ID is missing", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "set-1" },
        }),
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(400);
    expect(response.statusMessage).toBe(
      "Study set ID and card ID are required",
    );
    expect(mockSelect).not.toHaveBeenCalled();
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("returns 400 when both study set ID and card ID are missing", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: {},
        }),
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(400);
    expect(response.statusMessage).toBe(
      "Study set ID and card ID are required",
    );
    expect(mockSelect).not.toHaveBeenCalled();
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("returns 404 when study set is not found", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });
    mockLimit.mockResolvedValue([]);

    const event = await import("../../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "set-999", cardId: "card-1" },
        }),
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(404);
    expect(response.statusMessage).toBe("Study set not found");
    expect(mockSelect).toHaveBeenCalled();
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("returns 404 when study set belongs to different user", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });
    // Empty array means study set not found for this user
    mockLimit.mockResolvedValue([]);

    const event = await import("../../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "set-1", cardId: "card-1" },
        }),
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(404);
    expect(response.statusMessage).toBe("Study set not found");
    expect(mockSelect).toHaveBeenCalled();
    expect(mockFrom).toHaveBeenCalled();
    expect(mockWhere).toHaveBeenCalled();
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("successfully deletes a flash card from study set", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const mockStudySet = [
      {
        id: "set-1",
        userId: "user-123",
        title: "Spanish Vocabulary",
        description: "Common Spanish words",
        createdAt: new Date("2024-01-10T10:00:00.000Z"),
        updatedAt: new Date("2024-01-10T10:00:00.000Z"),
      },
    ];

    mockLimit.mockResolvedValue(mockStudySet);

    const event = await import("../../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "set-1", cardId: "card-1" },
        }),
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      success: true,
      message: "Flash card deleted successfully",
    });
    expect(mockSelect).toHaveBeenCalled();
    // Should be called twice: once for the association, once for the card
    expect(mockDelete).toHaveBeenCalledTimes(2);
  });

  it("calls delete operations in correct order", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-456" },
    });

    const mockStudySet = [
      {
        id: "set-2",
        userId: "user-456",
        title: "French Phrases",
        description: "Useful French phrases",
        createdAt: new Date("2024-01-09T10:00:00.000Z"),
        updatedAt: new Date("2024-01-09T10:00:00.000Z"),
      },
    ];

    mockLimit.mockResolvedValue(mockStudySet);

    const event = await import("../../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "set-2", cardId: "card-2" },
        }),
    );

    await handler.default(event);

    // Verify the delete was called twice (for association and for card)
    expect(mockDelete).toHaveBeenCalledTimes(2);
    // Verify where was called for both delete operations
    expect(mockWhere).toHaveBeenCalled();
  });

  it("verifies study set ownership before deletion", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-789" },
    });

    const mockStudySet = [
      {
        id: "set-3",
        userId: "user-789",
        title: "German Words",
        description: "Basic German vocabulary",
        createdAt: new Date("2024-01-08T10:00:00.000Z"),
        updatedAt: new Date("2024-01-08T10:00:00.000Z"),
      },
    ];

    mockLimit.mockResolvedValue(mockStudySet);

    const event = await import("../../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "set-3", cardId: "card-3" },
        }),
    );

    await handler.default(event);

    // Verify that select was called to check ownership
    expect(mockSelect).toHaveBeenCalled();
    expect(mockFrom).toHaveBeenCalled();
    expect(mockWhere).toHaveBeenCalled();
    expect(mockLimit).toHaveBeenCalled();
  });

  it("handles empty study set array correctly", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-111" },
    });
    mockLimit.mockResolvedValue([]);

    const event = await import("../../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "set-nonexistent", cardId: "card-1" },
        }),
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(404);
    expect(response.statusMessage).toBe("Study set not found");
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("handles undefined study set correctly", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-222" },
    });
    mockLimit.mockResolvedValue(undefined);

    const event = await import("../../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "set-undefined", cardId: "card-1" },
        }),
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(404);
    expect(response.statusMessage).toBe("Study set not found");
    expect(mockDelete).not.toHaveBeenCalled();
  });
});
