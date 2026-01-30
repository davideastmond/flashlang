// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as dbModule from "../../../../../../db/index.ts";
import { useH3TestUtils } from "../../../../../setup.ts";

const { defineEventHandler } = useH3TestUtils();

// Mock database module
const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockInnerJoin = vi.fn();
const mockOrderBy = vi.fn();
const mockLimit = vi.fn();

vi.mock("../../../../../../db/index.ts", () => ({
  db: {
    select: vi.fn(),
  },
}));

// Mock the auth module
const mockGetServerSession = vi.fn();
vi.mock("#auth", () => ({
  getServerSession: vi.fn(),
}));

describe("api/user/profile/stats GET endpoint tests", async () => {
  const handler =
    await import("../../../../../../server/api/user/profile/stats/index.get.ts");
  const authModule = await import("#auth");

  beforeEach(() => {
    mockSelect.mockClear();
    mockFrom.mockClear();
    mockWhere.mockClear();
    mockInnerJoin.mockClear();
    mockOrderBy.mockClear();
    mockLimit.mockClear();
    mockGetServerSession.mockClear();

    // Default chain setup
    mockLimit.mockResolvedValue([]);
    mockOrderBy.mockReturnValue({ limit: mockLimit });
    mockInnerJoin.mockReturnValue({ orderBy: mockOrderBy });
    mockWhere.mockReturnValue({
      innerJoin: mockInnerJoin,
    });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockSelect.mockReturnValue({ from: mockFrom });

    (dbModule.db.select as any) = mockSelect;
    (authModule.getServerSession as any) = mockGetServerSession;
  });

  it("is registered as an event handler", () => {
    expect(defineEventHandler).toHaveBeenCalled();
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const event = await import("../../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) => createMockH3Event({}),
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(401);
    expect(response.statusMessage).toBe("Unauthorized");
    expect(mockSelect).not.toHaveBeenCalled();
  });

  it("returns 401 when session exists but has no user", async () => {
    mockGetServerSession.mockResolvedValue({ user: null });

    const event = await import("../../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) => createMockH3Event({}),
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(401);
    expect(response.statusMessage).toBe("Unauthorized");
    expect(mockSelect).not.toHaveBeenCalled();
  });

  it("returns stats with zeros when user has no data", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123", email: "test@example.com" },
    });

    // Mock empty results for all queries
    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // First call - study sessions
        return Promise.resolve([]);
      } else if (callCount === 2) {
        // Second call - total study sets count
        return Promise.resolve([{ value: 0 }]);
      } else if (callCount === 3) {
        // Third call - total cards with innerJoin
        return {
          innerJoin: vi.fn().mockResolvedValue([{ value: 0 }]),
        };
      } else {
        // Fourth call - recent sessions with innerJoin
        return {
          innerJoin: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        };
      }
    });

    const event = await import("../../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) => createMockH3Event({}),
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      totalStudySets: 0,
      totalCards: 0,
      studyStreak: 0,
      accuracy: 0,
      totalStudySessions: 0,
      recentSessions: [],
    });
  });

  it("returns correct stats for user with data", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123", email: "test@example.com" },
    });

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Mock study sessions data for streak and accuracy calculation
    const studySessions = [
      {
        id: "session-1",
        userId: "user-123",
        studySetId: "set-1",
        startTime: today,
        endTime: today,
        correctCount: 8,
        totalCount: 10,
        results: [],
      },
      {
        id: "session-2",
        userId: "user-123",
        studySetId: "set-2",
        startTime: yesterday,
        endTime: yesterday,
        correctCount: 15,
        totalCount: 20,
        results: [],
      },
    ];

    const recentSessions = [
      {
        id: "session-1",
        title: "Spanish Vocabulary",
        startTime: today,
        totalCount: 10,
        correctCount: 8,
        studySetId: "set-1",
      },
      {
        id: "session-2",
        title: "Math Formulas",
        startTime: yesterday,
        totalCount: 20,
        correctCount: 15,
        studySetId: "set-2",
      },
    ];

    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // First call - study sessions for calculations
        return Promise.resolve(studySessions);
      } else if (callCount === 2) {
        // Second call - total study sets count
        return Promise.resolve([{ value: 5 }]);
      } else if (callCount === 3) {
        // Third call - total cards with innerJoin
        return {
          innerJoin: vi.fn().mockResolvedValue([{ value: 50 }]),
        };
      } else {
        // Fourth call - recent sessions with innerJoin
        return {
          innerJoin: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue(recentSessions),
            }),
          }),
        };
      }
    });

    const event = await import("../../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) => createMockH3Event({}),
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      totalStudySets: 5,
      totalCards: 50,
      studyStreak: 2, // Today and yesterday
      accuracy: 77, // (8+15)/(10+20) = 23/30 = 76.67% rounded to 77
      totalStudySessions: 2,
      recentSessions,
    });
  });

  it("calculates accuracy correctly with multiple sessions", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-456", email: "test@example.com" },
    });

    const studySessions = [
      {
        id: "session-1",
        userId: "user-456",
        studySetId: "set-1",
        startTime: new Date(),
        endTime: new Date(),
        correctCount: 10,
        totalCount: 10,
        results: [],
      },
      {
        id: "session-2",
        userId: "user-456",
        studySetId: "set-2",
        startTime: new Date(),
        endTime: new Date(),
        correctCount: 5,
        totalCount: 10,
        results: [],
      },
      {
        id: "session-3",
        userId: "user-456",
        studySetId: "set-3",
        startTime: new Date(),
        endTime: new Date(),
        correctCount: 0,
        totalCount: 10,
        results: [],
      },
    ];

    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve(studySessions);
      } else if (callCount === 2) {
        return Promise.resolve([{ value: 3 }]);
      } else if (callCount === 3) {
        return {
          innerJoin: vi.fn().mockResolvedValue([{ value: 30 }]),
        };
      } else {
        return {
          innerJoin: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        };
      }
    });

    const event = await import("../../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) => createMockH3Event({}),
    );

    const response = await handler.default(event);

    expect(response.accuracy).toBe(50); // (10+5+0)/(10+10+10) = 15/30 = 50%
  });

  it("calculates study streak correctly for consecutive days", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-789", email: "test@example.com" },
    });

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const studySessions = [
      {
        id: "session-1",
        userId: "user-789",
        studySetId: "set-1",
        startTime: today,
        endTime: today,
        correctCount: 5,
        totalCount: 5,
        results: [],
      },
      {
        id: "session-2",
        userId: "user-789",
        studySetId: "set-1",
        startTime: yesterday,
        endTime: yesterday,
        correctCount: 5,
        totalCount: 5,
        results: [],
      },
      {
        id: "session-3",
        userId: "user-789",
        studySetId: "set-1",
        startTime: twoDaysAgo,
        endTime: twoDaysAgo,
        correctCount: 5,
        totalCount: 5,
        results: [],
      },
    ];

    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve(studySessions);
      } else if (callCount === 2) {
        return Promise.resolve([{ value: 1 }]);
      } else if (callCount === 3) {
        return {
          innerJoin: vi.fn().mockResolvedValue([{ value: 15 }]),
        };
      } else {
        return {
          innerJoin: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        };
      }
    });

    const event = await import("../../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) => createMockH3Event({}),
    );

    const response = await handler.default(event);

    expect(response.studyStreak).toBe(3); // 3 consecutive days
  });

  it("returns streak of 0 when last session was more than 1 day ago", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-999", email: "test@example.com" },
    });

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const studySessions = [
      {
        id: "session-1",
        userId: "user-999",
        studySetId: "set-1",
        startTime: threeDaysAgo,
        endTime: threeDaysAgo,
        correctCount: 5,
        totalCount: 5,
        results: [],
      },
    ];

    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve(studySessions);
      } else if (callCount === 2) {
        return Promise.resolve([{ value: 1 }]);
      } else if (callCount === 3) {
        return {
          innerJoin: vi.fn().mockResolvedValue([{ value: 5 }]),
        };
      } else {
        return {
          innerJoin: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        };
      }
    });

    const event = await import("../../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) => createMockH3Event({}),
    );

    const response = await handler.default(event);

    expect(response.studyStreak).toBe(0); // Streak broken
  });

  it("returns streak of 0 when there are no study sessions", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-empty", email: "test@example.com" },
    });

    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve([]);
      } else if (callCount === 2) {
        return Promise.resolve([{ value: 0 }]);
      } else if (callCount === 3) {
        return {
          innerJoin: vi.fn().mockResolvedValue([{ value: 0 }]),
        };
      } else {
        return {
          innerJoin: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        };
      }
    });

    const event = await import("../../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) => createMockH3Event({}),
    );

    const response = await handler.default(event);

    expect(response.studyStreak).toBe(0);
  });

  it("returns only the 3 most recent sessions", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-limit", email: "test@example.com" },
    });

    const sessions = Array.from({ length: 5 }, (_, i) => ({
      id: `session-${i}`,
      userId: "user-limit",
      studySetId: `set-${i}`,
      startTime: new Date(),
      endTime: new Date(),
      correctCount: 5,
      totalCount: 10,
      results: [],
    }));

    const recentSessions = [
      {
        id: "session-0",
        title: "Set 0",
        startTime: new Date(),
        totalCount: 10,
        correctCount: 5,
        studySetId: "set-0",
      },
      {
        id: "session-1",
        title: "Set 1",
        startTime: new Date(),
        totalCount: 10,
        correctCount: 5,
        studySetId: "set-1",
      },
      {
        id: "session-2",
        title: "Set 2",
        startTime: new Date(),
        totalCount: 10,
        correctCount: 5,
        studySetId: "set-2",
      },
    ];

    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve(sessions);
      } else if (callCount === 2) {
        return Promise.resolve([{ value: 5 }]);
      } else if (callCount === 3) {
        return {
          innerJoin: vi.fn().mockResolvedValue([{ value: 50 }]),
        };
      } else {
        return {
          innerJoin: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue(recentSessions),
            }),
          }),
        };
      }
    });

    const event = await import("../../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) => createMockH3Event({}),
    );

    const response = await handler.default(event);

    expect(response.recentSessions).toHaveLength(3);
  });

  it("handles sessions with missing correctCount gracefully", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-missing", email: "test@example.com" },
    });

    const studySessions = [
      {
        id: "session-1",
        userId: "user-missing",
        studySetId: "set-1",
        startTime: new Date(),
        endTime: new Date(),
        correctCount: undefined,
        totalCount: 10,
        results: [],
      },
      {
        id: "session-2",
        userId: "user-missing",
        studySetId: "set-2",
        startTime: new Date(),
        endTime: new Date(),
        correctCount: 5,
        totalCount: undefined,
        results: [],
      },
    ];

    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve(studySessions);
      } else if (callCount === 2) {
        return Promise.resolve([{ value: 2 }]);
      } else if (callCount === 3) {
        return {
          innerJoin: vi.fn().mockResolvedValue([{ value: 20 }]),
        };
      } else {
        return {
          innerJoin: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        };
      }
    });

    const event = await import("../../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) => createMockH3Event({}),
    );

    const response = await handler.default(event);

    expect(response.accuracy).toBe(50); // 5/(10+0) = 50%
  });

  it("returns 500 error when database query fails", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-error", email: "test@example.com" },
    });

    mockWhere.mockRejectedValue(new Error("Database connection failed"));

    const event = await import("../../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) => createMockH3Event({}),
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(500);
    expect(response.statusMessage).toBe("Failed to fetch user stats");
  });

  it("handles streak calculation with multiple sessions on the same day", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-same-day", email: "test@example.com" },
    });

    const today = new Date();
    const todayMorning = new Date(today.setHours(8, 0, 0, 0));
    const todayNoon = new Date(today.setHours(12, 0, 0, 0));
    const todayEvening = new Date(today.setHours(18, 0, 0, 0));

    const studySessions = [
      {
        id: "session-1",
        userId: "user-same-day",
        studySetId: "set-1",
        startTime: todayMorning,
        endTime: todayMorning,
        correctCount: 5,
        totalCount: 10,
        results: [],
      },
      {
        id: "session-2",
        userId: "user-same-day",
        studySetId: "set-2",
        startTime: todayNoon,
        endTime: todayNoon,
        correctCount: 7,
        totalCount: 10,
        results: [],
      },
      {
        id: "session-3",
        userId: "user-same-day",
        studySetId: "set-3",
        startTime: todayEvening,
        endTime: todayEvening,
        correctCount: 8,
        totalCount: 10,
        results: [],
      },
    ];

    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve(studySessions);
      } else if (callCount === 2) {
        return Promise.resolve([{ value: 3 }]);
      } else if (callCount === 3) {
        return {
          innerJoin: vi.fn().mockResolvedValue([{ value: 30 }]),
        };
      } else {
        return {
          innerJoin: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        };
      }
    });

    const event = await import("../../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) => createMockH3Event({}),
    );

    const response = await handler.default(event);

    expect(response.studyStreak).toBe(1); // Only counts unique days
    expect(response.totalStudySessions).toBe(3);
    expect(response.accuracy).toBe(67); // (5+7+8)/(10+10+10) = 20/30 = 66.67% rounded to 67
  });

  it("handles broken streak with gap in dates", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-gap", email: "test@example.com" },
    });

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const fiveDaysAgo = new Date(today);
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const sixDaysAgo = new Date(today);
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

    const studySessions = [
      {
        id: "session-1",
        userId: "user-gap",
        studySetId: "set-1",
        startTime: today,
        endTime: today,
        correctCount: 5,
        totalCount: 10,
        results: [],
      },
      {
        id: "session-2",
        userId: "user-gap",
        studySetId: "set-2",
        startTime: yesterday,
        endTime: yesterday,
        correctCount: 5,
        totalCount: 10,
        results: [],
      },
      // Gap here - days 2-4 missing
      {
        id: "session-3",
        userId: "user-gap",
        studySetId: "set-3",
        startTime: fiveDaysAgo,
        endTime: fiveDaysAgo,
        correctCount: 5,
        totalCount: 10,
        results: [],
      },
      {
        id: "session-4",
        userId: "user-gap",
        studySetId: "set-4",
        startTime: sixDaysAgo,
        endTime: sixDaysAgo,
        correctCount: 5,
        totalCount: 10,
        results: [],
      },
    ];

    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve(studySessions);
      } else if (callCount === 2) {
        return Promise.resolve([{ value: 4 }]);
      } else if (callCount === 3) {
        return {
          innerJoin: vi.fn().mockResolvedValue([{ value: 40 }]),
        };
      } else {
        return {
          innerJoin: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        };
      }
    });

    const event = await import("../../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) => createMockH3Event({}),
    );

    const response = await handler.default(event);

    expect(response.studyStreak).toBe(2); // Only today and yesterday count (streak breaks at gap)
  });
});
