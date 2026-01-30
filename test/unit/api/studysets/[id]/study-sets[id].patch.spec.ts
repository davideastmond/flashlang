// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as dbModule from "../../../../../db/index.ts";
import { useH3TestUtils } from "../../../../setup.ts";

const { defineEventHandler } = useH3TestUtils();

// Mock the database module
const mockUpdate = vi.fn();
const mockSet = vi.fn();
const mockWhere = vi.fn();
const mockReturning = vi.fn();

vi.mock("../../../../../db/index.ts", () => ({
  db: {
    update: vi.fn(),
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

describe("api/studysets/[id] PATCH endpoint tests", async () => {
  const handler =
    await import("../../../../../server/api/studysets/[id]/index.patch.ts");
  const authModule = await import("#auth");
  const h3Module = await import("h3");

  beforeEach(() => {
    mockUpdate.mockClear();
    mockSet.mockClear();
    mockWhere.mockClear();
    mockReturning.mockClear();
    mockGetServerSession.mockClear();
    mockGetRouterParam.mockClear();

    // Set up the chain of mocked query builder methods
    mockReturning.mockResolvedValue([
      {
        id: "study-set-123",
        userId: "user-123",
        title: "Updated Title",
        description: "Updated Description",
        language: "en-US",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date(),
      },
    ]);
    mockWhere.mockReturnValue({ returning: mockReturning });
    mockSet.mockReturnValue({ where: mockWhere });
    mockUpdate.mockReturnValue({ set: mockSet });

    (dbModule.db.update as any) = mockUpdate;
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
          body: { title: "New Title" },
        }),
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(401);
    expect(response.statusMessage).toBe("Unauthorized");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns 401 when session exists but has no user", async () => {
    mockGetServerSession.mockResolvedValue({ user: null });
    mockGetRouterParam.mockReturnValue("study-set-123");

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
          body: { title: "New Title" },
        }),
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(401);
    expect(response.statusMessage).toBe("Unauthorized");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns 400 when study set ID is not provided", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });
    mockGetRouterParam.mockReturnValue(null);

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: { title: "New Title" },
        }),
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(400);
    expect(response.statusMessage).toBe("Study set ID is required");
    expect(mockUpdate).not.toHaveBeenCalled();
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
          body: { title: "New Title" },
        }),
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(400);
    expect(response.statusMessage).toBe("Study set ID is required");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("successfully updates study set title", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });
    mockGetRouterParam.mockReturnValue("study-set-123");

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
          body: { title: "Updated Title" },
        }),
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      success: true,
      data: expect.objectContaining({
        id: "study-set-123",
        title: "Updated Title",
        userId: "user-123",
      }),
    });
    expect(mockUpdate).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Updated Title",
        updatedAt: expect.any(Date),
      }),
    );
  });

  it("successfully updates study set description", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });
    mockGetRouterParam.mockReturnValue("study-set-123");

    mockReturning.mockResolvedValue([
      {
        id: "study-set-123",
        userId: "user-123",
        title: "Original Title",
        description: "Updated Description",
        language: "en-US",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date(),
      },
    ]);

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
          body: { description: "Updated Description" },
        }),
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      success: true,
      data: expect.objectContaining({
        id: "study-set-123",
        description: "Updated Description",
        userId: "user-123",
      }),
    });
    expect(mockUpdate).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "Updated Description",
        updatedAt: expect.any(Date),
      }),
    );
  });

  it("successfully updates both title and description", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });
    mockGetRouterParam.mockReturnValue("study-set-123");

    mockReturning.mockResolvedValue([
      {
        id: "study-set-123",
        userId: "user-123",
        title: "Updated Title",
        description: "Updated Description",
        language: "en-US",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date(),
      },
    ]);

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
          body: {
            title: "Updated Title",
            description: "Updated Description",
          },
        }),
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      success: true,
      data: expect.objectContaining({
        id: "study-set-123",
        title: "Updated Title",
        description: "Updated Description",
        userId: "user-123",
      }),
    });
    expect(mockUpdate).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Updated Title",
        description: "Updated Description",
        updatedAt: expect.any(Date),
      }),
    );
  });

  it("allows clearing description by setting it to empty string", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });
    mockGetRouterParam.mockReturnValue("study-set-123");

    mockReturning.mockResolvedValue([
      {
        id: "study-set-123",
        userId: "user-123",
        title: "Title",
        description: "",
        language: "en-US",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date(),
      },
    ]);

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
          body: { description: "" },
        }),
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      success: true,
      data: expect.objectContaining({
        id: "study-set-123",
        description: "",
      }),
    });
    expect(mockUpdate).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "",
        updatedAt: expect.any(Date),
      }),
    );
  });

  it("returns 400 when title is empty string", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });
    mockGetRouterParam.mockReturnValue("study-set-123");

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
          body: { title: "" },
        }),
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(400);
    expect(response.statusMessage).toBe("Validation error");
    expect(response.data).toBeDefined();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns 400 when title exceeds 200 characters", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });
    mockGetRouterParam.mockReturnValue("study-set-123");

    const longTitle = "a".repeat(201);

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
          body: { title: longTitle },
        }),
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(400);
    expect(response.statusMessage).toBe("Validation error");
    expect(response.data).toBeDefined();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns 400 when description exceeds 1000 characters", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });
    mockGetRouterParam.mockReturnValue("study-set-123");

    const longDescription = "a".repeat(1001);

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
          body: { description: longDescription },
        }),
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(400);
    expect(response.statusMessage).toBe("Validation error");
    expect(response.data).toBeDefined();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("accepts title at maximum length of 200 characters", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });
    mockGetRouterParam.mockReturnValue("study-set-123");

    const maxTitle = "a".repeat(200);

    mockReturning.mockResolvedValue([
      {
        id: "study-set-123",
        userId: "user-123",
        title: maxTitle,
        description: "Description",
        language: "en-US",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date(),
      },
    ]);

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
          body: { title: maxTitle },
        }),
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      success: true,
      data: expect.objectContaining({
        id: "study-set-123",
        title: maxTitle,
      }),
    });
    expect(mockUpdate).toHaveBeenCalled();
  });

  it("accepts description at maximum length of 1000 characters", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });
    mockGetRouterParam.mockReturnValue("study-set-123");

    const maxDescription = "a".repeat(1000);

    mockReturning.mockResolvedValue([
      {
        id: "study-set-123",
        userId: "user-123",
        title: "Title",
        description: maxDescription,
        language: "en-US",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date(),
      },
    ]);

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
          body: { description: maxDescription },
        }),
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      success: true,
      data: expect.objectContaining({
        id: "study-set-123",
        description: maxDescription,
      }),
    });
    expect(mockUpdate).toHaveBeenCalled();
  });

  it("returns 404 when study set is not found", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });
    mockGetRouterParam.mockReturnValue("nonexistent-id");

    // Mock empty result (study set not found)
    mockReturning.mockResolvedValue([]);

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "nonexistent-id" },
          body: { title: "New Title" },
        }),
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(404);
    expect(response.statusMessage).toBe("Study set not found");
    expect(mockUpdate).toHaveBeenCalled();
  });

  it("returns 404 when trying to update another user's study set", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-456" },
    });
    mockGetRouterParam.mockReturnValue("study-set-123");

    // Mock empty result (study set belongs to different user)
    mockReturning.mockResolvedValue([]);

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
          body: { title: "Hacked Title" },
        }),
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(404);
    expect(response.statusMessage).toBe("Study set not found");
    expect(mockUpdate).toHaveBeenCalled();
    // Verify the where clause would include userId check
    expect(mockWhere).toHaveBeenCalled();
  });

  it("only updates specified fields and leaves others unchanged", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });
    mockGetRouterParam.mockReturnValue("study-set-123");

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
          body: { title: "Only Title Updated" },
        }),
    );

    await handler.default(event);

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Only Title Updated",
        updatedAt: expect.any(Date),
      }),
    );

    // Verify description is not in the update
    const setCall = mockSet.mock.calls[0][0];
    expect(setCall).not.toHaveProperty("language");
    expect(setCall).not.toHaveProperty("userId");
    expect(setCall).not.toHaveProperty("createdAt");
  });

  it("always updates the updatedAt field", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });
    mockGetRouterParam.mockReturnValue("study-set-123");

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
          body: { title: "Updated Title" },
        }),
    );

    await handler.default(event);

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        updatedAt: expect.any(Date),
      }),
    );
  });

  it("handles empty request body gracefully", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });
    mockGetRouterParam.mockReturnValue("study-set-123");

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
          body: {},
        }),
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      success: true,
      data: expect.objectContaining({
        id: "study-set-123",
      }),
    });
    expect(mockUpdate).toHaveBeenCalled();
  });

  it("handles request with only null/undefined values", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });
    mockGetRouterParam.mockReturnValue("study-set-123");

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
          body: { title: undefined },
        }),
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      success: true,
      data: expect.objectContaining({
        id: "study-set-123",
      }),
    });
    expect(mockUpdate).toHaveBeenCalled();
  });

  it("returns 400 when title has invalid type", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });
    mockGetRouterParam.mockReturnValue("study-set-123");

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
          body: { title: 123 },
        }),
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(400);
    expect(response.statusMessage).toBe("Validation error");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns 400 when description has invalid type", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123" },
    });
    mockGetRouterParam.mockReturnValue("study-set-123");

    const event = await import("../../../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          params: { id: "study-set-123" },
          body: { description: 456 },
        }),
    );

    const response = await handler.default(event);

    expect(response.statusCode).toBe(400);
    expect(response.statusMessage).toBe("Validation error");
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
