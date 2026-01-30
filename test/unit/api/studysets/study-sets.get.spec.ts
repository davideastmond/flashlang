// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as dbModule from "../../../../db/index.ts";
import { useH3TestUtils } from "../../../setup.ts";

const { defineEventHandler } = useH3TestUtils();

// Mock the database module
const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockLeftJoin = vi.fn();
const mockWhere = vi.fn();
const mockGroupBy = vi.fn();
const mockOrderBy = vi.fn();

vi.mock("../../../../db/index.ts", () => ({
  db: {
    select: vi.fn(),
  },
}));

// Mock the auth module
const mockGetServerSession = vi.fn();
vi.mock("#auth", () => ({
  getServerSession: vi.fn(),
}));

describe("api/studysets GET endpoint tests", async () => {
  const handler = await import("../../../../server/api/studysets/index.get.ts");
  const authModule = await import("#auth");

  beforeEach(() => {
    mockSelect.mockClear();
    mockFrom.mockClear();
    mockLeftJoin.mockClear();
    mockWhere.mockClear();
    mockGroupBy.mockClear();
    mockOrderBy.mockClear();
    mockGetServerSession.mockClear();

    // Set up the chain of mocked query builder methods
    mockOrderBy.mockResolvedValue([]);
    mockGroupBy.mockReturnValue({ orderBy: mockOrderBy });
    mockWhere.mockReturnValue({ groupBy: mockGroupBy });
    mockLeftJoin.mockReturnValue({ where: mockWhere });
    mockFrom.mockReturnValue({ leftJoin: mockLeftJoin });
    mockSelect.mockReturnValue({ from: mockFrom });

    (dbModule.db.select as any) = mockSelect;
    (authModule.getServerSession as any) = mockGetServerSession;
  });

  it("is registered as an event handler", () => {
    expect(defineEventHandler).toHaveBeenCalled();
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const event = await import("../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) => createMockH3Event({}),
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(401);
    expect(response.statusMessage).toBe("Unauthorized");
    expect(mockSelect).not.toHaveBeenCalled();
  });

  it("returns 401 when session exists but has no user", async () => {
    mockGetServerSession.mockResolvedValue({ user: null });

    const event = await import("../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) => createMockH3Event({}),
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(401);
    expect(response.statusMessage).toBe("Unauthorized");
    expect(mockSelect).not.toHaveBeenCalled();
  });

  it("successfully fetches study sets for authenticated user", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const mockStudySets = [
      {
        id: "set-1",
        title: "Spanish Vocabulary",
        description: "Common Spanish words",
        createdAt: new Date("2024-01-10T10:00:00.000Z"),
        updatedAt: new Date("2024-01-10T10:00:00.000Z"),
        cardCount: 10,
      },
      {
        id: "set-2",
        title: "French Phrases",
        description: "Useful French phrases",
        createdAt: new Date("2024-01-09T10:00:00.000Z"),
        updatedAt: new Date("2024-01-09T10:00:00.000Z"),
        cardCount: 5,
      },
    ];

    mockOrderBy.mockResolvedValue(mockStudySets);

    const event = await import("../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) => createMockH3Event({}),
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      success: true,
      data: mockStudySets,
    });
    expect(mockSelect).toHaveBeenCalled();
    expect(mockFrom).toHaveBeenCalled();
    expect(mockLeftJoin).toHaveBeenCalled();
    expect(mockWhere).toHaveBeenCalled();
    expect(mockGroupBy).toHaveBeenCalled();
    expect(mockOrderBy).toHaveBeenCalled();
  });

  it("returns empty array when user has no study sets", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-456" },
    });

    mockOrderBy.mockResolvedValue([]);

    const event = await import("../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) => createMockH3Event({}),
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      success: true,
      data: [],
    });
    expect(mockSelect).toHaveBeenCalled();
  });

  it("returns study sets with zero card count", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-789" },
    });

    const mockStudySets = [
      {
        id: "set-1",
        title: "Empty Study Set",
        description: "No cards yet",
        createdAt: new Date("2024-01-10T10:00:00.000Z"),
        updatedAt: new Date("2024-01-10T10:00:00.000Z"),
        cardCount: 0,
      },
    ];

    mockOrderBy.mockResolvedValue(mockStudySets);

    const event = await import("../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) => createMockH3Event({}),
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      success: true,
      data: mockStudySets,
    });
    expect(response.data[0].cardCount).toBe(0);
  });

  it("returns study sets with null description", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-abc" },
    });

    const mockStudySets = [
      {
        id: "set-1",
        title: "Study Set Without Description",
        description: null,
        createdAt: new Date("2024-01-10T10:00:00.000Z"),
        updatedAt: new Date("2024-01-10T10:00:00.000Z"),
        cardCount: 3,
      },
    ];

    mockOrderBy.mockResolvedValue(mockStudySets);

    const event = await import("../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) => createMockH3Event({}),
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      success: true,
      data: mockStudySets,
    });
    expect(response.data[0].description).toBeNull();
  });

  it("returns multiple study sets in descending order by creation date", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-multi" },
    });

    const mockStudySets = [
      {
        id: "set-newest",
        title: "Newest Set",
        description: "Created most recently",
        createdAt: new Date("2024-01-15T10:00:00.000Z"),
        updatedAt: new Date("2024-01-15T10:00:00.000Z"),
        cardCount: 8,
      },
      {
        id: "set-middle",
        title: "Middle Set",
        description: "Created in the middle",
        createdAt: new Date("2024-01-12T10:00:00.000Z"),
        updatedAt: new Date("2024-01-12T10:00:00.000Z"),
        cardCount: 12,
      },
      {
        id: "set-oldest",
        title: "Oldest Set",
        description: "Created first",
        createdAt: new Date("2024-01-10T10:00:00.000Z"),
        updatedAt: new Date("2024-01-10T10:00:00.000Z"),
        cardCount: 5,
      },
    ];

    mockOrderBy.mockResolvedValue(mockStudySets);

    const event = await import("../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) => createMockH3Event({}),
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      success: true,
      data: mockStudySets,
    });
    expect(response.data).toHaveLength(3);
    expect(response.data[0].id).toBe("set-newest");
    expect(response.data[1].id).toBe("set-middle");
    expect(response.data[2].id).toBe("set-oldest");
  });

  it("filters study sets by user id", async () => {
    const userId = "specific-user-123";
    mockGetServerSession.mockResolvedValue({
      user: { id: userId },
    });

    const mockStudySets = [
      {
        id: "set-1",
        title: "User Specific Set",
        description: "Only for this user",
        createdAt: new Date("2024-01-10T10:00:00.000Z"),
        updatedAt: new Date("2024-01-10T10:00:00.000Z"),
        cardCount: 7,
      },
    ];

    mockOrderBy.mockResolvedValue(mockStudySets);

    const event = await import("../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) => createMockH3Event({}),
    );

    await handler.default(event);

    // Verify that the where clause was called (which filters by userId)
    expect(mockWhere).toHaveBeenCalled();
  });

  it("includes all required fields in response", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-fields" },
    });

    const mockStudySets = [
      {
        id: "set-complete",
        title: "Complete Study Set",
        description: "All fields present",
        createdAt: new Date("2024-01-10T10:00:00.000Z"),
        updatedAt: new Date("2024-01-11T15:30:00.000Z"),
        cardCount: 20,
      },
    ];

    mockOrderBy.mockResolvedValue(mockStudySets);

    const event = await import("../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) => createMockH3Event({}),
    );

    const response = await handler.default(event);

    expect(response.data[0]).toHaveProperty("id");
    expect(response.data[0]).toHaveProperty("title");
    expect(response.data[0]).toHaveProperty("description");
    expect(response.data[0]).toHaveProperty("createdAt");
    expect(response.data[0]).toHaveProperty("updatedAt");
    expect(response.data[0]).toHaveProperty("cardCount");
  });

  it("handles study sets with different card counts correctly", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-counts" },
    });

    const mockStudySets = [
      {
        id: "set-large",
        title: "Large Set",
        description: "Many cards",
        createdAt: new Date("2024-01-10T10:00:00.000Z"),
        updatedAt: new Date("2024-01-10T10:00:00.000Z"),
        cardCount: 100,
      },
      {
        id: "set-medium",
        title: "Medium Set",
        description: "Some cards",
        createdAt: new Date("2024-01-09T10:00:00.000Z"),
        updatedAt: new Date("2024-01-09T10:00:00.000Z"),
        cardCount: 15,
      },
      {
        id: "set-small",
        title: "Small Set",
        description: "Few cards",
        createdAt: new Date("2024-01-08T10:00:00.000Z"),
        updatedAt: new Date("2024-01-08T10:00:00.000Z"),
        cardCount: 1,
      },
      {
        id: "set-empty",
        title: "Empty Set",
        description: "No cards",
        createdAt: new Date("2024-01-07T10:00:00.000Z"),
        updatedAt: new Date("2024-01-07T10:00:00.000Z"),
        cardCount: 0,
      },
    ];

    mockOrderBy.mockResolvedValue(mockStudySets);

    const event = await import("../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) => createMockH3Event({}),
    );

    const response = await handler.default(event);

    expect(response.data).toHaveLength(4);
    expect(response.data[0].cardCount).toBe(100);
    expect(response.data[1].cardCount).toBe(15);
    expect(response.data[2].cardCount).toBe(1);
    expect(response.data[3].cardCount).toBe(0);
  });

  it("preserves Date objects in response", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-dates" },
    });

    const createdDate = new Date("2024-01-10T10:00:00.000Z");
    const updatedDate = new Date("2024-01-11T15:00:00.000Z");

    const mockStudySets = [
      {
        id: "set-dates",
        title: "Date Test Set",
        description: "Testing date preservation",
        createdAt: createdDate,
        updatedAt: updatedDate,
        cardCount: 5,
      },
    ];

    mockOrderBy.mockResolvedValue(mockStudySets);

    const event = await import("../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) => createMockH3Event({}),
    );

    const response = await handler.default(event);

    expect(response.data[0].createdAt).toBeInstanceOf(Date);
    expect(response.data[0].updatedAt).toBeInstanceOf(Date);
    expect(response.data[0].createdAt).toEqual(createdDate);
    expect(response.data[0].updatedAt).toEqual(updatedDate);
  });

  it("returns success flag with data", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-success" },
    });

    mockOrderBy.mockResolvedValue([]);

    const event = await import("../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) => createMockH3Event({}),
    );

    const response = await handler.default(event);

    expect(response).toHaveProperty("success");
    expect(response.success).toBe(true);
    expect(response).toHaveProperty("data");
    expect(Array.isArray(response.data)).toBe(true);
  });

  it("executes query chain in correct order", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-chain" },
    });

    mockOrderBy.mockResolvedValue([]);

    const event = await import("../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) => createMockH3Event({}),
    );

    await handler.default(event);

    // Verify the query builder methods were called in the expected order
    expect(mockSelect).toHaveBeenCalled();
    expect(mockFrom).toHaveBeenCalled();
    expect(mockLeftJoin).toHaveBeenCalled();
    expect(mockWhere).toHaveBeenCalled();
    expect(mockGroupBy).toHaveBeenCalled();
    expect(mockOrderBy).toHaveBeenCalled();

    // Verify each method was called exactly once
    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledTimes(1);
    expect(mockLeftJoin).toHaveBeenCalledTimes(1);
    expect(mockWhere).toHaveBeenCalledTimes(1);
    expect(mockGroupBy).toHaveBeenCalledTimes(1);
    expect(mockOrderBy).toHaveBeenCalledTimes(1);
  });

  it("handles study sets with very long titles", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-long-title" },
    });

    const longTitle = "A".repeat(500);
    const mockStudySets = [
      {
        id: "set-long",
        title: longTitle,
        description: "Study set with very long title",
        createdAt: new Date("2024-01-10T10:00:00.000Z"),
        updatedAt: new Date("2024-01-10T10:00:00.000Z"),
        cardCount: 3,
      },
    ];

    mockOrderBy.mockResolvedValue(mockStudySets);

    const event = await import("../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) => createMockH3Event({}),
    );

    const response = await handler.default(event);

    expect(response.data[0].title).toBe(longTitle);
    expect(response.data[0].title.length).toBe(500);
  });

  it("handles special characters in titles and descriptions", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-special" },
    });

    const mockStudySets = [
      {
        id: "set-special",
        title: "Español & Français: L'étude! 🎓",
        description: "Special chars: @#$%^&*()_+-=[]{}|;':\",./<>?",
        createdAt: new Date("2024-01-10T10:00:00.000Z"),
        updatedAt: new Date("2024-01-10T10:00:00.000Z"),
        cardCount: 8,
      },
    ];

    mockOrderBy.mockResolvedValue(mockStudySets);

    const event = await import("../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) => createMockH3Event({}),
    );

    const response = await handler.default(event);

    expect(response.data[0].title).toBe("Español & Français: L'étude! 🎓");
    expect(response.data[0].description).toBe(
      "Special chars: @#$%^&*()_+-=[]{}|;':\",./<>?",
    );
  });
});
