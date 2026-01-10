// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as dbModule from "../../../db/index.ts";
import { useH3TestUtils } from "../../setup.ts";

const { defineEventHandler } = useH3TestUtils();

// Mock the database module
const mockInsert = vi.fn();
const mockValues = vi.fn();

vi.mock("../../../db/index.ts", () => ({
  db: {
    insert: vi.fn(),
  },
}));

// Mock the auth module
const mockGetServerSession = vi.fn();
vi.mock("#auth", () => ({
  getServerSession: vi.fn(),
}));

describe("api/study-sessions POST endpoint tests", async () => {
  const handler = await import(
    "../../../server/api/study-sessions/index.post.ts"
  );
  const authModule = await import("#auth");

  beforeEach(() => {
    mockInsert.mockClear();
    mockValues.mockClear();
    mockGetServerSession.mockClear();
    mockValues.mockResolvedValue(undefined);
    mockInsert.mockReturnValue({ values: mockValues });
    (dbModule.db.insert as any) = mockInsert;
    (authModule.getServerSession as any) = mockGetServerSession;
  });

  it("is registered as an event handler", () => {
    expect(defineEventHandler).toHaveBeenCalled();
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            studySetId: "550e8400-e29b-41d4-a716-446655440000",
            startTime: "2024-01-10T10:00:00.000Z",
            endTime: "2024-01-10T10:15:00.000Z",
            results: [],
            score: {
              correctCount: 0,
              totalCount: 1,
              percentage: 0,
            },
          },
        })
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(401);
    expect(response.statusMessage).toBe("Unauthorized");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns 401 when session exists but has no user", async () => {
    mockGetServerSession.mockResolvedValue({ user: null });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            studySetId: "550e8400-e29b-41d4-a716-446655440000",
            startTime: "2024-01-10T10:00:00.000Z",
            endTime: "2024-01-10T10:15:00.000Z",
            results: [],
            score: {
              correctCount: 0,
              totalCount: 1,
              percentage: 0,
            },
          },
        })
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(401);
    expect(response.statusMessage).toBe("Unauthorized");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("successfully creates a study session with valid data", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            studySetId: "550e8400-e29b-41d4-a716-446655440000",
            startTime: "2024-01-10T10:00:00.000Z",
            endTime: "2024-01-10T10:15:00.000Z",
            results: [
              {
                cardId: "660e8400-e29b-41d4-a716-446655440001",
                userAnswer: "Paris",
                isCorrect: true,
                answeredAt: "2024-01-10T10:05:00.000Z",
              },
              {
                cardId: "660e8400-e29b-41d4-a716-446655440002",
                userAnswer: "Berlin",
                isCorrect: false,
                answeredAt: "2024-01-10T10:10:00.000Z",
              },
            ],
            score: {
              correctCount: 1,
              totalCount: 2,
              percentage: 50,
            },
          },
        })
    );

    const response = await handler.default(event);

    expect(response).toEqual({ success: true });
    expect(mockInsert).toHaveBeenCalled();
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        userId: "user-123",
        studySetId: "550e8400-e29b-41d4-a716-446655440000",
        startTime: new Date("2024-01-10T10:00:00.000Z"),
        endTime: new Date("2024-01-10T10:15:00.000Z"),
        correctCount: 1,
        totalCount: 2,
        results: [
          {
            cardId: "660e8400-e29b-41d4-a716-446655440001",
            userAnswer: "Paris",
            isCorrect: true,
            answeredAt: "2024-01-10T10:05:00.000Z",
          },
          {
            cardId: "660e8400-e29b-41d4-a716-446655440002",
            userAnswer: "Berlin",
            isCorrect: false,
            answeredAt: "2024-01-10T10:10:00.000Z",
          },
        ],
      })
    );
  });

  it("successfully creates a study session with empty results", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-456" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            studySetId: "550e8400-e29b-41d4-a716-446655440000",
            startTime: "2024-01-10T10:00:00.000Z",
            endTime: "2024-01-10T10:00:01.000Z",
            results: [],
            score: {
              correctCount: 0,
              totalCount: 1,
              percentage: 0,
            },
          },
        })
    );

    const response = await handler.default(event);

    expect(response).toEqual({ success: true });
    expect(mockInsert).toHaveBeenCalled();
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-456",
        correctCount: 0,
        totalCount: 1,
        results: [],
      })
    );
  });

  it("successfully creates a study session with optional fields omitted", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-789" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            studySetId: "550e8400-e29b-41d4-a716-446655440000",
            startTime: "2024-01-10T10:00:00.000Z",
            endTime: "2024-01-10T10:15:00.000Z",
            results: [
              {
                cardId: "660e8400-e29b-41d4-a716-446655440001",
                isCorrect: true,
              },
            ],
            score: {
              correctCount: 1,
              totalCount: 1,
              percentage: 100,
            },
          },
        })
    );

    const response = await handler.default(event);

    expect(response).toEqual({ success: true });
    expect(mockInsert).toHaveBeenCalled();
  });

  it("returns validation error for invalid studySetId format", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            studySetId: "not-a-uuid",
            startTime: "2024-01-10T10:00:00.000Z",
            endTime: "2024-01-10T10:15:00.000Z",
            results: [],
            score: {
              correctCount: 0,
              totalCount: 1,
              percentage: 0,
            },
          },
        })
    );

    const response = await handler.default(event);

    expect(response.status).toBe(400);
    expect(response.message).toBe("Validation error");
    expect(response.data).toBeDefined();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns validation error for invalid startTime format", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            studySetId: "550e8400-e29b-41d4-a716-446655440000",
            startTime: "invalid-date",
            endTime: "2024-01-10T10:15:00.000Z",
            results: [],
            score: {
              correctCount: 0,
              totalCount: 1,
              percentage: 0,
            },
          },
        })
    );

    const response = await handler.default(event);

    expect(response.status).toBe(400);
    expect(response.message).toBe("Validation error");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns validation error for invalid endTime format", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            studySetId: "550e8400-e29b-41d4-a716-446655440000",
            startTime: "2024-01-10T10:00:00.000Z",
            endTime: "not-a-valid-date",
            results: [],
            score: {
              correctCount: 0,
              totalCount: 1,
              percentage: 0,
            },
          },
        })
    );

    const response = await handler.default(event);

    expect(response.status).toBe(400);
    expect(response.message).toBe("Validation error");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns validation error for invalid cardId in results", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            studySetId: "550e8400-e29b-41d4-a716-446655440000",
            startTime: "2024-01-10T10:00:00.000Z",
            endTime: "2024-01-10T10:15:00.000Z",
            results: [
              {
                cardId: "invalid-uuid",
                isCorrect: true,
              },
            ],
            score: {
              correctCount: 1,
              totalCount: 1,
              percentage: 100,
            },
          },
        })
    );

    const response = await handler.default(event);

    expect(response.status).toBe(400);
    expect(response.message).toBe("Validation error");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns validation error for negative correctCount", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            studySetId: "550e8400-e29b-41d4-a716-446655440000",
            startTime: "2024-01-10T10:00:00.000Z",
            endTime: "2024-01-10T10:15:00.000Z",
            results: [],
            score: {
              correctCount: -1,
              totalCount: 1,
              percentage: 0,
            },
          },
        })
    );

    const response = await handler.default(event);

    expect(response.status).toBe(400);
    expect(response.message).toBe("Validation error");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns validation error for totalCount less than 1", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            studySetId: "550e8400-e29b-41d4-a716-446655440000",
            startTime: "2024-01-10T10:00:00.000Z",
            endTime: "2024-01-10T10:15:00.000Z",
            results: [],
            score: {
              correctCount: 0,
              totalCount: 0,
              percentage: 0,
            },
          },
        })
    );

    const response = await handler.default(event);

    expect(response.status).toBe(400);
    expect(response.message).toBe("Validation error");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns validation error for percentage greater than 100", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            studySetId: "550e8400-e29b-41d4-a716-446655440000",
            startTime: "2024-01-10T10:00:00.000Z",
            endTime: "2024-01-10T10:15:00.000Z",
            results: [],
            score: {
              correctCount: 2,
              totalCount: 1,
              percentage: 150,
            },
          },
        })
    );

    const response = await handler.default(event);

    expect(response.status).toBe(400);
    expect(response.message).toBe("Validation error");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns validation error for percentage less than 0", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            studySetId: "550e8400-e29b-41d4-a716-446655440000",
            startTime: "2024-01-10T10:00:00.000Z",
            endTime: "2024-01-10T10:15:00.000Z",
            results: [],
            score: {
              correctCount: 0,
              totalCount: 1,
              percentage: -10,
            },
          },
        })
    );

    const response = await handler.default(event);

    expect(response.status).toBe(400);
    expect(response.message).toBe("Validation error");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns validation error for missing studySetId", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            startTime: "2024-01-10T10:00:00.000Z",
            endTime: "2024-01-10T10:15:00.000Z",
            results: [],
            score: {
              correctCount: 0,
              totalCount: 1,
              percentage: 0,
            },
          },
        })
    );

    const response = await handler.default(event);

    expect(response.status).toBe(400);
    expect(response.message).toBe("Validation error");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns validation error for missing score object", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            studySetId: "550e8400-e29b-41d4-a716-446655440000",
            startTime: "2024-01-10T10:00:00.000Z",
            endTime: "2024-01-10T10:15:00.000Z",
            results: [],
          },
        })
    );

    const response = await handler.default(event);

    expect(response.status).toBe(400);
    expect(response.message).toBe("Validation error");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns validation error for invalid answeredAt in results", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            studySetId: "550e8400-e29b-41d4-a716-446655440000",
            startTime: "2024-01-10T10:00:00.000Z",
            endTime: "2024-01-10T10:15:00.000Z",
            results: [
              {
                cardId: "660e8400-e29b-41d4-a716-446655440001",
                isCorrect: true,
                answeredAt: "not-a-valid-date",
              },
            ],
            score: {
              correctCount: 1,
              totalCount: 1,
              percentage: 100,
            },
          },
        })
    );

    const response = await handler.default(event);

    expect(response.status).toBe(400);
    expect(response.message).toBe("Validation error");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns 500 error when database insert fails", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });
    mockValues.mockRejectedValue(new Error("Database error"));

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            studySetId: "550e8400-e29b-41d4-a716-446655440000",
            startTime: "2024-01-10T10:00:00.000Z",
            endTime: "2024-01-10T10:15:00.000Z",
            results: [],
            score: {
              correctCount: 0,
              totalCount: 1,
              percentage: 0,
            },
          },
        })
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(500);
    expect(response.statusMessage).toBe("Failed to create study session");
  });

  it("generates a unique UUID for each study session", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event1 = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            studySetId: "550e8400-e29b-41d4-a716-446655440000",
            startTime: "2024-01-10T10:00:00.000Z",
            endTime: "2024-01-10T10:15:00.000Z",
            results: [],
            score: {
              correctCount: 0,
              totalCount: 1,
              percentage: 0,
            },
          },
        })
    );

    const event2 = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            studySetId: "550e8400-e29b-41d4-a716-446655440000",
            startTime: "2024-01-10T11:00:00.000Z",
            endTime: "2024-01-10T11:15:00.000Z",
            results: [],
            score: {
              correctCount: 0,
              totalCount: 1,
              percentage: 0,
            },
          },
        })
    );

    await handler.default(event1);
    const firstId = mockValues.mock.calls[0][0].id;

    await handler.default(event2);
    const secondId = mockValues.mock.calls[1][0].id;

    expect(firstId).not.toBe(secondId);
    expect(firstId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
    expect(secondId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });

  it("correctly transforms startTime and endTime to Date objects", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const startTimeStr = "2024-01-10T10:00:00.000Z";
    const endTimeStr = "2024-01-10T10:15:00.000Z";

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            studySetId: "550e8400-e29b-41d4-a716-446655440000",
            startTime: startTimeStr,
            endTime: endTimeStr,
            results: [],
            score: {
              correctCount: 0,
              totalCount: 1,
              percentage: 0,
            },
          },
        })
    );

    await handler.default(event);

    const insertedData = mockValues.mock.calls[0][0];
    expect(insertedData.startTime).toBeInstanceOf(Date);
    expect(insertedData.endTime).toBeInstanceOf(Date);
    expect(insertedData.startTime.toISOString()).toBe(startTimeStr);
    expect(insertedData.endTime.toISOString()).toBe(endTimeStr);
  });

  it("correctly stores multiple results with all fields", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const results = [
      {
        cardId: "660e8400-e29b-41d4-a716-446655440001",
        userAnswer: "Answer 1",
        isCorrect: true,
        answeredAt: "2024-01-10T10:05:00.000Z",
      },
      {
        cardId: "660e8400-e29b-41d4-a716-446655440002",
        userAnswer: "Answer 2",
        isCorrect: false,
        answeredAt: "2024-01-10T10:10:00.000Z",
      },
      {
        cardId: "660e8400-e29b-41d4-a716-446655440003",
        userAnswer: "Answer 3",
        isCorrect: true,
        answeredAt: "2024-01-10T10:15:00.000Z",
      },
    ];

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            studySetId: "550e8400-e29b-41d4-a716-446655440000",
            startTime: "2024-01-10T10:00:00.000Z",
            endTime: "2024-01-10T10:20:00.000Z",
            results: results,
            score: {
              correctCount: 2,
              totalCount: 3,
              percentage: 66.67,
            },
          },
        })
    );

    await handler.default(event);

    const insertedData = mockValues.mock.calls[0][0];
    expect(insertedData.results).toEqual(results);
  });
});
