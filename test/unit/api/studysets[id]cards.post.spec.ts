// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as dbModule from "../../../db/index.ts";
import { useH3TestUtils } from "../../setup.ts";

const { defineEventHandler } = useH3TestUtils();

// Mock the database module
const mockInsert = vi.fn();
const mockValues = vi.fn();
const mockReturning = vi.fn();
const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockLimit = vi.fn();

vi.mock("../../../db/index.ts", () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
  },
}));

// Mock the auth module
const mockGetServerSession = vi.fn();
vi.mock("#auth", () => ({
  getServerSession: vi.fn(),
}));

describe("api/studysets/:id/cards POST endpoint tests", async () => {
  const handler = await import(
    "../../../server/api/studysets/[id]/cards/index.post.ts"
  );
  const authModule = await import("#auth");

  beforeEach(() => {
    mockInsert.mockClear();
    mockValues.mockClear();
    mockReturning.mockClear();
    mockSelect.mockClear();
    mockFrom.mockClear();
    mockWhere.mockClear();
    mockLimit.mockClear();
    mockGetServerSession.mockClear();

    // Setup default mock chain for insert operations
    mockReturning.mockResolvedValue([
      {
        id: "flash-card-123",
        userId: "user-123",
        question: "What is the capital of France?",
        answer: "Paris",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    mockValues.mockReturnValue({ returning: mockReturning });
    mockInsert.mockReturnValue({ values: mockValues });

    // Setup default mock chain for select operations
    mockLimit.mockResolvedValue([
      {
        id: "study-set-123",
        userId: "user-123",
        title: "French Vocabulary",
      },
    ]);
    mockWhere.mockReturnValue({ limit: mockLimit });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockSelect.mockReturnValue({ from: mockFrom });

    (dbModule.db.insert as any) = mockInsert;
    (dbModule.db.select as any) = mockSelect;
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
          params: { id: "study-set-123" },
          body: {
            question: "What is the capital of France?",
            answer: "Paris",
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
          params: { id: "study-set-123" },
          body: {
            question: "What is the capital of France?",
            answer: "Paris",
          },
        })
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(401);
    expect(response.statusMessage).toBe("Unauthorized");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns 400 when study set ID is missing", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: {},
          body: {
            question: "What is the capital of France?",
            answer: "Paris",
          },
        })
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(400);
    expect(response.statusMessage).toBe("Study set ID is required");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns 404 when study set does not exist", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    mockLimit.mockResolvedValue([]);

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "non-existent-study-set" },
          body: {
            question: "What is the capital of France?",
            answer: "Paris",
          },
        })
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(404);
    expect(response.statusMessage).toBe("Study set not found");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns 404 when study set belongs to a different user", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    // The database query filters by both ID AND userId, so it returns empty when user doesn't match
    mockLimit.mockResolvedValue([]);

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-456" },
          body: {
            question: "What is the capital of Germany?",
            answer: "Berlin",
          },
        })
    );

    const response = await handler.default(event);
    expect(response.statusCode).toBe(404);
    expect(response.statusMessage).toBe("Study set not found");
  });

  it("successfully creates a new flash card with valid data", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
          body: {
            question: "What is the capital of France?",
            answer: "Paris",
          },
        })
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      success: true,
      data: expect.objectContaining({
        id: expect.any(String),
        userId: "user-123",
        question: "What is the capital of France?",
        answer: "Paris",
      }),
    });
    expect(mockInsert).toHaveBeenCalledTimes(2); // Once for flashCard, once for studySetFlashCards
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        userId: "user-123",
        question: "What is the capital of France?",
        answer: "Paris",
      })
    );
  });

  it("creates flash card with minimum length question and answer", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-789" },
    });

    mockReturning.mockResolvedValue([
      {
        id: "flash-card-789",
        userId: "user-789",
        question: "A",
        answer: "B",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
          body: {
            question: "A",
            answer: "B",
          },
        })
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      success: true,
      data: expect.objectContaining({
        question: "A",
        answer: "B",
      }),
    });
    expect(mockInsert).toHaveBeenCalledTimes(2);
  });

  it("creates flash card with maximum length question and answer", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-456" },
    });

    const longText = "A".repeat(1000);

    mockReturning.mockResolvedValue([
      {
        id: "flash-card-456",
        userId: "user-456",
        question: longText,
        answer: longText,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
          body: {
            question: longText,
            answer: longText,
          },
        })
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      success: true,
      data: expect.objectContaining({
        question: longText,
        answer: longText,
      }),
    });
    expect(mockInsert).toHaveBeenCalledTimes(2);
  });

  it("returns validation error when question is empty", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
          body: {
            question: "",
            answer: "Paris",
          },
        })
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(400);
    expect(response.statusMessage).toBe("Validation error");
    expect(response.data).toBeDefined();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns validation error when answer is empty", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
          body: {
            question: "What is the capital of France?",
            answer: "",
          },
        })
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(400);
    expect(response.statusMessage).toBe("Validation error");
    expect(response.data).toBeDefined();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns validation error when question is missing", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
          body: {
            answer: "Paris",
          },
        })
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(400);
    expect(response.statusMessage).toBe("Validation error");
    expect(response.data).toBeDefined();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns validation error when answer is missing", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
          body: {
            question: "What is the capital of France?",
          },
        })
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(400);
    expect(response.statusMessage).toBe("Validation error");
    expect(response.data).toBeDefined();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns validation error when question exceeds maximum length", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const tooLongText = "A".repeat(1001);

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
          body: {
            question: tooLongText,
            answer: "Paris",
          },
        })
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(400);
    expect(response.statusMessage).toBe("Validation error");
    expect(response.data).toBeDefined();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns validation error when answer exceeds maximum length", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const tooLongText = "A".repeat(1001);

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
          body: {
            question: "What is the capital of France?",
            answer: tooLongText,
          },
        })
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(400);
    expect(response.statusMessage).toBe("Validation error");
    expect(response.data).toBeDefined();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns validation error when both question and answer are invalid", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
          body: {
            question: "",
            answer: "",
          },
        })
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(400);
    expect(response.statusMessage).toBe("Validation error");
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThanOrEqual(2);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns validation error when request body is empty", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
          body: {},
        })
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(400);
    expect(response.statusMessage).toBe("Validation error");
    expect(response.data).toBeDefined();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("ignores extra fields in the request body", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
          body: {
            question: "What is the capital of France?",
            answer: "Paris",
            extraField: "should be ignored",
            anotherField: 123,
          },
        })
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      success: true,
      data: expect.objectContaining({
        id: expect.any(String),
        userId: "user-123",
        question: "What is the capital of France?",
        answer: "Paris",
      }),
    });
    expect(mockInsert).toHaveBeenCalledTimes(2);
  });

  it("creates a flash card and links it to the study set", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
          body: {
            question: "What is 2+2?",
            answer: "4",
          },
        })
    );

    await handler.default(event);

    // Verify that insert was called for both flashCards and studySetFlashCards
    expect(mockInsert).toHaveBeenCalledTimes(2);

    // Verify the first insert call was for the flash card
    expect(mockValues).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        id: expect.any(String),
        userId: "user-123",
        question: "What is 2+2?",
        answer: "4",
      })
    );

    // Verify the second insert call was for the studySetFlashCards junction table
    expect(mockValues).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        studySetId: "study-set-123",
        flashCardId: expect.any(String),
      })
    );
  });

  it("handles special characters in question and answer", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    mockReturning.mockResolvedValue([
      {
        id: "flash-card-special",
        userId: "user-123",
        question: "What's the symbol for pi? π",
        answer: "π (approximately 3.14159...)",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
          body: {
            question: "What's the symbol for pi? π",
            answer: "π (approximately 3.14159...)",
          },
        })
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      success: true,
      data: expect.objectContaining({
        question: "What's the symbol for pi? π",
        answer: "π (approximately 3.14159...)",
      }),
    });
  });

  it("handles unicode and emoji in question and answer", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    mockReturning.mockResolvedValue([
      {
        id: "flash-card-emoji",
        userId: "user-123",
        question: "Translate: 你好",
        answer: "Hello 👋",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
          body: {
            question: "Translate: 你好",
            answer: "Hello 👋",
          },
        })
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      success: true,
      data: expect.objectContaining({
        question: "Translate: 你好",
        answer: "Hello 👋",
      }),
    });
  });
});
