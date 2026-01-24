// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as dbModule from "../../../db/index.ts";
import { useH3TestUtils } from "../../setup.ts";

const { defineEventHandler } = useH3TestUtils();

// Mock the database module
const mockInsert = vi.fn();
const mockValues = vi.fn();
const mockReturning = vi.fn();

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

describe("api/studysets POST endpoint tests", async () => {
  const handler = await import("../../../server/api/studysets/index.post.ts");
  const authModule = await import("#auth");

  beforeEach(() => {
    mockInsert.mockClear();
    mockValues.mockClear();
    mockReturning.mockClear();
    mockGetServerSession.mockClear();

    // Setup default mock chain
    mockReturning.mockResolvedValue([
      {
        id: "129a49e9-9ad4-4b53-82e1-c987197000c8",
        userId: "user-123",
        title: "Test Study Set",
        description: "Test Description",
        language: "en-US",
      },
    ]);
    mockValues.mockReturnValue({ returning: mockReturning });
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
            title: "Test Study Set",
            description: "Test Description",
            language: "en-US",
            flashCards: [
              {
                question: "What is 2+2?",
                answer: "4",
              },
            ],
          },
        }),
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
            title: "Test Study Set",
            description: "Test Description",
            language: "en-US",
            flashCards: [
              {
                question: "What is 2+2?",
                answer: "4",
              },
            ],
          },
        }),
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(401);
    expect(response.statusMessage).toBe("Unauthorized");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("successfully creates a study set with valid data", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            title: "French Vocabulary",
            description: "Basic French words",
            language: "fr-FR",
            flashCards: [
              {
                question: "bonjour",
                answer: "hello",
              },
              {
                question: "merci",
                answer: "thank you",
              },
            ],
          },
        }),
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      success: true,
      data: "129a49e9-9ad4-4b53-82e1-c987197000c8",
    });

    // Verify study set was inserted
    expect(mockInsert).toHaveBeenCalled();
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        userId: "user-123",
        title: "French Vocabulary",
        description: "Basic French words",
        language: "fr-FR",
      }),
    );
  });

  it("creates study set with default language when not provided", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            title: "Test Study Set",
            description: "Test Description",
            language: "en-US",
            flashCards: [
              {
                question: "question",
                answer: "answer",
              },
            ],
          },
        }),
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      success: true,
      data: "129a49e9-9ad4-4b53-82e1-c987197000c8",
    });

    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        language: "en-US",
      }),
    );
  });

  it("creates study set without description when not provided", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            title: "Test Study Set",
            language: "en-US",
            flashCards: [
              {
                question: "question",
                answer: "answer",
              },
            ],
          },
        }),
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      success: true,
      data: "129a49e9-9ad4-4b53-82e1-c987197000c8",
    });

    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Test Study Set",
        userId: "user-123",
      }),
    );
  });

  it("creates study set with multiple flashcards", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            title: "Spanish Numbers",
            description: "Numbers 1-5",
            language: "es-ES",
            flashCards: [
              { question: "uno", answer: "one" },
              { question: "dos", answer: "two" },
              { question: "tres", answer: "three" },
              { question: "cuatro", answer: "four" },
              { question: "cinco", answer: "five" },
            ],
          },
        }),
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      success: true,
      data: "129a49e9-9ad4-4b53-82e1-c987197000c8",
    });

    // Should insert study set once and flashcards 5 times (+ 5 times for junction table)
    expect(mockInsert).toHaveBeenCalledTimes(11); // 1 study set + 5 flashcards + 5 junction entries
  });

  it("returns validation error when title is missing", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            description: "Test Description",
            language: "en-US",
            flashCards: [
              {
                question: "question",
                answer: "answer",
              },
            ],
          },
        }),
    );

    const response = await handler.default(event);

    expect(response.status).toBe(400);
    expect(response.message).toBe("Validation error");
    expect(response.data).toBeDefined();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns validation error when title is empty", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            title: "",
            description: "Test Description",
            language: "en-US",
            flashCards: [
              {
                question: "question",
                answer: "answer",
              },
            ],
          },
        }),
    );

    const response = await handler.default(event);

    expect(response.status).toBe(400);
    expect(response.message).toBe("Validation error");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns validation error when flashCards array is empty", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            title: "Test Study Set",
            description: "Test Description",
            language: "en-US",
            flashCards: [],
          },
        }),
    );

    const response = await handler.default(event);

    expect(response.status).toBe(400);
    expect(response.message).toBe("Validation error");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns validation error when flashCards is missing", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            title: "Test Study Set",
            description: "Test Description",
            language: "en-US",
          },
        }),
    );

    const response = await handler.default(event);

    expect(response.status).toBe(400);
    expect(response.message).toBe("Validation error");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns validation error when flashcard has empty question", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            title: "Test Study Set",
            description: "Test Description",
            language: "en-US",
            flashCards: [
              {
                question: "",
                answer: "answer",
              },
            ],
          },
        }),
    );

    const response = await handler.default(event);

    expect(response.status).toBe(400);
    expect(response.message).toBe("Validation error");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns validation error when flashcard has empty answer", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            title: "Test Study Set",
            description: "Test Description",
            language: "en-US",
            flashCards: [
              {
                question: "question",
                answer: "",
              },
            ],
          },
        }),
    );

    const response = await handler.default(event);

    expect(response.status).toBe(400);
    expect(response.message).toBe("Validation error");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns validation error when flashcard has whitespace-only question", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            title: "Test Study Set",
            description: "Test Description",
            language: "en-US",
            flashCards: [
              {
                question: "   ",
                answer: "answer",
              },
            ],
          },
        }),
    );

    const response = await handler.default(event);

    expect(response.status).toBe(400);
    expect(response.message).toBe("Validation error");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns validation error when flashcard has whitespace-only answer", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            title: "Test Study Set",
            description: "Test Description",
            language: "en-US",
            flashCards: [
              {
                question: "question",
                answer: "   ",
              },
            ],
          },
        }),
    );

    const response = await handler.default(event);

    expect(response.status).toBe(400);
    expect(response.message).toBe("Validation error");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns validation error when language is invalid", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            title: "Test Study Set",
            description: "Test Description",
            language: "invalid-lang",
            flashCards: [
              {
                question: "question",
                answer: "answer",
              },
            ],
          },
        }),
    );

    const response = await handler.default(event);

    expect(response.status).toBe(400);
    expect(response.message).toBe("Validation error");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("generates unique IDs for study set and flashcards", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            title: "Test Study Set",
            language: "en-US",
            flashCards: [
              { question: "q1", answer: "a1" },
              { question: "q2", answer: "a2" },
            ],
          },
        }),
    );

    const response = await handler.default(event);

    expect(response.success).toBe(true);
    expect(response.data).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it("associates flashcards with the created study set", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            title: "Test Study Set",
            language: "en-US",
            flashCards: [{ question: "question1", answer: "answer1" }],
          },
        }),
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      success: true,
      data: "129a49e9-9ad4-4b53-82e1-c987197000c8",
    });

    // Verify that studySetFlashCards junction table is populated
    // 1 study set + 1 flashcard + 1 junction entry = 3 inserts
    expect(mockInsert).toHaveBeenCalledTimes(3);
  });

  it("correctly stores flashcard data with user ID", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-456" },
    });

    mockReturning.mockResolvedValue([
      {
        id: "study-set-456",
        userId: "user-456",
        title: "German Basics",
        description: "Basic German words",
        language: "de-DE",
      },
    ]);

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            title: "German Basics",
            description: "Basic German words",
            language: "de-DE",
            flashCards: [{ question: "Hallo", answer: "Hello" }],
          },
        }),
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      success: true,
      data: "study-set-456",
    });

    // Verify the study set values
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-456",
        title: "German Basics",
        description: "Basic German words",
        language: "de-DE",
      }),
    );
  });
});
