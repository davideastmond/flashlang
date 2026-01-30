// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as dbModule from "../../../../../db/index.ts";
import { useH3TestUtils } from "../../../../setup.ts";

const { defineEventHandler } = useH3TestUtils();

// Mock the database module
const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockInnerJoin = vi.fn();
const mockWhere = vi.fn();
const mockLimit = vi.fn();
const mockOrderBy = vi.fn();

vi.mock("../../../../../db/index.ts", () => ({
  db: {
    select: vi.fn(),
  },
}));

// Mock the auth module
const mockGetServerSession = vi.fn();
vi.mock("#auth", () => ({
  getServerSession: vi.fn(),
}));

// Mock getRouterParam
const mockGetRouterParam = vi.fn();
vi.mock("h3", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    getRouterParam: vi.fn(),
  };
});

describe("api/studysets/:id GET endpoint tests", async () => {
  const handler =
    await import("../../../../../server/api/studysets/[id]/index.get.ts");
  const authModule = await import("#auth");
  const h3Module = await import("h3");

  beforeEach(() => {
    mockSelect.mockClear();
    mockFrom.mockClear();
    mockInnerJoin.mockClear();
    mockWhere.mockClear();
    mockLimit.mockClear();
    mockOrderBy.mockClear();
    mockGetServerSession.mockClear();
    mockGetRouterParam.mockClear();

    // Set up the chain of mocked query builder methods
    mockLimit.mockResolvedValue([]);
    mockOrderBy.mockReturnValue({ limit: mockLimit });
    // mockWhere needs to support both orderBy and limit for different query chains
    mockWhere.mockReturnValue({
      limit: mockLimit,
      orderBy: mockOrderBy,
    });
    mockInnerJoin.mockReturnValue({ where: mockWhere });
    // mockFrom needs to support both query chains:
    // 1. select().from().where().limit() for study set query
    // 2. select().from().innerJoin().where() for flash cards query
    // 3. select().from().where().orderBy().limit() for study sessions query
    mockFrom.mockReturnValue({
      where: mockWhere,
      innerJoin: mockInnerJoin,
    });
    mockSelect.mockReturnValue({ from: mockFrom });

    (dbModule.db.select as any) = mockSelect;
    (authModule.getServerSession as any) = mockGetServerSession;
    (h3Module.getRouterParam as any) = mockGetRouterParam;
  });

  it("is registered as an event handler", () => {
    expect(defineEventHandler).toHaveBeenCalled();
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);
    mockGetRouterParam.mockReturnValue("study-set-123");

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
        }),
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(401);
    expect(response.statusMessage).toBe("Unauthorized");
    expect(mockSelect).not.toHaveBeenCalled();
  });

  it("returns 401 when session exists but has no user", async () => {
    mockGetServerSession.mockResolvedValue({ user: null });
    mockGetRouterParam.mockReturnValue("study-set-123");

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
        }),
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(401);
    expect(response.statusMessage).toBe("Unauthorized");
    expect(mockSelect).not.toHaveBeenCalled();
  });

  it("returns 400 when study set ID is not provided", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });
    mockGetRouterParam.mockReturnValue(null);

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) => createMockH3Event({}),
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(400);
    expect(response.statusMessage).toBe("Study set ID is required");
    expect(mockSelect).not.toHaveBeenCalled();
  });

  it("returns 400 when study set ID is empty string", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });
    mockGetRouterParam.mockReturnValue("");

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "" },
        }),
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(400);
    expect(response.statusMessage).toBe("Study set ID is required");
  });

  it("returns 404 when study set does not exist", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });
    mockGetRouterParam.mockReturnValue("non-existent-id");

    // First query for study set returns empty array
    const mockStudySetQuery = vi.fn().mockResolvedValue([]);
    mockLimit.mockImplementation(async () => {
      return mockStudySetQuery();
    });

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "non-existent-id" },
        }),
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(404);
    expect(response.statusMessage).toBe("Study set not found");
  });

  it("returns 404 when study set belongs to different user", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });
    mockGetRouterParam.mockReturnValue("study-set-456");

    // Study set exists but belongs to different user (query filters by userId)
    const mockStudySetQuery = vi.fn().mockResolvedValue([]);
    mockLimit.mockImplementation(async () => {
      return mockStudySetQuery();
    });

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-456" },
        }),
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(404);
    expect(response.statusMessage).toBe("Study set not found");
  });

  it("successfully fetches study set with flash cards", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });
    mockGetRouterParam.mockReturnValue("study-set-789");

    const mockStudySet = {
      id: "study-set-789",
      userId: "user-123",
      title: "Spanish Vocabulary",
      description: "Common Spanish words",
      language: "es-ES",
      createdAt: new Date("2024-01-10T10:00:00.000Z"),
      updatedAt: new Date("2024-01-10T10:00:00.000Z"),
    };

    const mockFlashCards = [
      {
        id: "card-1",
        question: "hola",
        answer: "hello",
        createdAt: new Date("2024-01-10T10:00:00.000Z"),
        updatedAt: new Date("2024-01-10T10:00:00.000Z"),
      },
      {
        id: "card-2",
        question: "adiós",
        answer: "goodbye",
        createdAt: new Date("2024-01-10T10:00:00.000Z"),
        updatedAt: new Date("2024-01-10T10:00:00.000Z"),
      },
    ];

    const mockStudySession = {
      id: "session-1",
      userId: "user-123",
      studySetId: "study-set-789",
      startTime: new Date("2024-01-15T14:30:00.000Z"),
      correctCount: 8,
      totalCount: 10,
      results: [],
      endTime: new Date("2024-01-15T14:45:00.000Z"),
    };

    // Mock the query chain for different queries
    let selectCallCount = 0;
    mockSelect.mockImplementation(() => {
      selectCallCount++;

      if (selectCallCount === 1) {
        // First query: study set - select().from().where().limit()
        const studySetWhere = vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockStudySet]),
        });
        return {
          from: vi.fn().mockReturnValue({
            where: studySetWhere,
          }),
        };
      } else if (selectCallCount === 2) {
        // Second query: flash cards - select().from().innerJoin().where()
        const flashCardsWhere = vi.fn().mockResolvedValue(mockFlashCards);
        return {
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: flashCardsWhere,
            }),
          }),
        };
      } else if (selectCallCount === 3) {
        // Third query: study sessions - select().from().where().orderBy().limit()
        const studySessionWhere = vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockStudySession]),
          }),
        });
        return {
          from: vi.fn().mockReturnValue({
            where: studySessionWhere,
          }),
        };
      }

      return { from: mockFrom };
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
      data: {
        ...mockStudySet,
        flashCards: mockFlashCards,
        lastStudiedAt: mockStudySession,
      },
    });
    expect(mockSelect).toHaveBeenCalled();
    expect(mockGetRouterParam).toHaveBeenCalledWith(event, "id");
  });

  it("successfully fetches study set with no flash cards", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });
    mockGetRouterParam.mockReturnValue("study-set-empty");

    const mockStudySet = {
      id: "study-set-empty",
      userId: "user-123",
      title: "Empty Study Set",
      description: "A study set with no cards yet",
      language: "en-US",
      createdAt: new Date("2024-01-10T10:00:00.000Z"),
      updatedAt: new Date("2024-01-10T10:00:00.000Z"),
    };

    let selectCallCount = 0;
    mockSelect.mockImplementation(() => {
      selectCallCount++;

      if (selectCallCount === 1) {
        // First query: study set - select().from().where().limit()
        const studySetWhere = vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockStudySet]),
        });
        return {
          from: vi.fn().mockReturnValue({
            where: studySetWhere,
          }),
        };
      } else if (selectCallCount === 2) {
        // Second query: flash cards - select().from().innerJoin().where()
        const flashCardsWhere = vi.fn().mockResolvedValue([]);
        return {
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: flashCardsWhere,
            }),
          }),
        };
      } else if (selectCallCount === 3) {
        // Third query: study sessions - select().from().where().orderBy().limit()
        const studySessionWhere = vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        });
        return {
          from: vi.fn().mockReturnValue({
            where: studySessionWhere,
          }),
        };
      }

      return { from: mockFrom };
    });

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-empty" },
        }),
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      success: true,
      data: {
        ...mockStudySet,
        flashCards: [],
        lastStudiedAt: null,
      },
    });
  });

  it("successfully fetches study set with no study sessions", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });
    mockGetRouterParam.mockReturnValue("study-set-new");

    const mockStudySet = {
      id: "study-set-new",
      userId: "user-123",
      title: "New Study Set",
      description: "Never been studied",
      language: "fr-FR",
      createdAt: new Date("2024-01-20T10:00:00.000Z"),
      updatedAt: new Date("2024-01-20T10:00:00.000Z"),
    };

    const mockFlashCards = [
      {
        id: "card-1",
        question: "bonjour",
        answer: "hello",
        createdAt: new Date("2024-01-20T10:00:00.000Z"),
        updatedAt: new Date("2024-01-20T10:00:00.000Z"),
      },
    ];

    let selectCallCount = 0;
    mockSelect.mockImplementation(() => {
      selectCallCount++;

      if (selectCallCount === 1) {
        // First query: study set - select().from().where().limit()
        const studySetWhere = vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockStudySet]),
        });
        return {
          from: vi.fn().mockReturnValue({
            where: studySetWhere,
          }),
        };
      } else if (selectCallCount === 2) {
        // Second query: flash cards - select().from().innerJoin().where()
        const flashCardsWhere = vi.fn().mockResolvedValue(mockFlashCards);
        return {
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: flashCardsWhere,
            }),
          }),
        };
      } else if (selectCallCount === 3) {
        // Third query: study sessions - select().from().where().orderBy().limit()
        const studySessionWhere = vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        });
        return {
          from: vi.fn().mockReturnValue({
            where: studySessionWhere,
          }),
        };
      }

      return { from: mockFrom };
    });

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-new" },
        }),
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      success: true,
      data: {
        ...mockStudySet,
        flashCards: mockFlashCards,
        lastStudiedAt: null,
      },
    });
  });

  it("successfully fetches study set with multiple flash cards", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-456" },
    });
    mockGetRouterParam.mockReturnValue("study-set-big");

    const mockStudySet = {
      id: "study-set-big",
      userId: "user-456",
      title: "German Vocabulary",
      description: "Comprehensive German words",
      language: "de-DE",
      createdAt: new Date("2024-01-05T10:00:00.000Z"),
      updatedAt: new Date("2024-01-18T10:00:00.000Z"),
    };

    const mockFlashCards = Array.from({ length: 20 }, (_, i) => ({
      id: `card-${i + 1}`,
      question: `Question ${i + 1}`,
      answer: `Answer ${i + 1}`,
      createdAt: new Date("2024-01-05T10:00:00.000Z"),
      updatedAt: new Date("2024-01-05T10:00:00.000Z"),
    }));

    const mockStudySession = {
      id: "session-big",
      userId: "user-456",
      studySetId: "study-set-big",
      startTime: new Date("2024-01-18T14:30:00.000Z"),
      correctCount: 15,
      totalCount: 20,
      results: [],
      endTime: new Date("2024-01-18T15:00:00.000Z"),
    };

    let selectCallCount = 0;
    mockSelect.mockImplementation(() => {
      selectCallCount++;

      if (selectCallCount === 1) {
        // First query: study set - select().from().where().limit()
        const studySetWhere = vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockStudySet]),
        });
        return {
          from: vi.fn().mockReturnValue({
            where: studySetWhere,
          }),
        };
      } else if (selectCallCount === 2) {
        // Second query: flash cards - select().from().innerJoin().where()
        const flashCardsWhere = vi.fn().mockResolvedValue(mockFlashCards);
        return {
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: flashCardsWhere,
            }),
          }),
        };
      } else if (selectCallCount === 3) {
        // Third query: study sessions - select().from().where().orderBy().limit()
        const studySessionWhere = vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockStudySession]),
          }),
        });
        return {
          from: vi.fn().mockReturnValue({
            where: studySessionWhere,
          }),
        };
      }

      return { from: mockFrom };
    });

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-big" },
        }),
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      success: true,
      data: {
        ...mockStudySet,
        flashCards: mockFlashCards,
        lastStudiedAt: mockStudySession,
      },
    });
    expect(response.data.flashCards).toHaveLength(20);
  });

  it("fetches study set with all fields populated correctly", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-789" },
    });
    mockGetRouterParam.mockReturnValue("study-set-complete");

    const mockStudySet = {
      id: "study-set-complete",
      userId: "user-789",
      title: "Italian Phrases",
      description: "Essential Italian travel phrases",
      language: "it-IT",
      createdAt: new Date("2023-12-01T10:00:00.000Z"),
      updatedAt: new Date("2024-01-22T10:00:00.000Z"),
    };

    const mockFlashCards = [
      {
        id: "card-a",
        question: "Come stai?",
        answer: "How are you?",
        createdAt: new Date("2023-12-01T10:05:00.000Z"),
        updatedAt: new Date("2023-12-01T10:05:00.000Z"),
      },
      {
        id: "card-b",
        question: "Dove il bagno?",
        answer: "Where is the bathroom?",
        createdAt: new Date("2023-12-01T10:10:00.000Z"),
        updatedAt: new Date("2023-12-01T10:10:00.000Z"),
      },
      {
        id: "card-c",
        question: "Quanto costa?",
        answer: "How much does it cost?",
        createdAt: new Date("2023-12-01T10:15:00.000Z"),
        updatedAt: new Date("2024-01-10T12:00:00.000Z"),
      },
    ];

    const mockStudySession = {
      id: "session-complete",
      userId: "user-789",
      studySetId: "study-set-complete",
      startTime: new Date("2024-01-22T09:00:00.000Z"),
      correctCount: 3,
      totalCount: 3,
      results: [
        {
          cardId: "card-a",
          userAnswer: "How are you?",
          isCorrect: true,
          answeredAt: "2024-01-22T09:05:00.000Z",
        },
        {
          cardId: "card-b",
          userAnswer: "Where is the bathroom?",
          isCorrect: true,
          answeredAt: "2024-01-22T09:07:00.000Z",
        },
        {
          cardId: "card-c",
          userAnswer: "How much does it cost?",
          isCorrect: true,
          answeredAt: "2024-01-22T09:10:00.000Z",
        },
      ],
      endTime: new Date("2024-01-22T09:12:00.000Z"),
    };

    let selectCallCount = 0;
    mockSelect.mockImplementation(() => {
      selectCallCount++;

      if (selectCallCount === 1) {
        // First query: study set - select().from().where().limit()
        const studySetWhere = vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockStudySet]),
        });
        return {
          from: vi.fn().mockReturnValue({
            where: studySetWhere,
          }),
        };
      } else if (selectCallCount === 2) {
        // Second query: flash cards - select().from().innerJoin().where()
        const flashCardsWhere = vi.fn().mockResolvedValue(mockFlashCards);
        return {
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: flashCardsWhere,
            }),
          }),
        };
      } else if (selectCallCount === 3) {
        // Third query: study sessions - select().from().where().orderBy().limit()
        const studySessionWhere = vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockStudySession]),
          }),
        });
        return {
          from: vi.fn().mockReturnValue({
            where: studySessionWhere,
          }),
        };
      }

      return { from: mockFrom };
    });

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-complete" },
        }),
    );

    const response = await handler.default(event);

    expect(response.success).toBe(true);
    expect(response.data.id).toBe("study-set-complete");
    expect(response.data.title).toBe("Italian Phrases");
    expect(response.data.description).toBe("Essential Italian travel phrases");
    expect(response.data.language).toBe("it-IT");
    expect(response.data.flashCards).toHaveLength(3);
    expect(response.data.lastStudiedAt).toEqual(mockStudySession);
    expect(response.data.lastStudiedAt.results).toHaveLength(3);
  });
});
