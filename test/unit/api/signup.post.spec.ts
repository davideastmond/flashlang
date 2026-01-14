// @vitest-environment node
import bcrypt from "bcrypt";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as dbModule from "../../../db/index.ts";
import { useH3TestUtils } from "../../setup.ts";

const { defineEventHandler } = useH3TestUtils();

// Mock the database module
const mockInsert = vi.fn();
const mockValues = vi.fn();
const mockFindFirst = vi.fn();

vi.mock("../../../db/index.ts", () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(),
  },
}));

describe("api/signup POST endpoint tests", async () => {
  const handler = await import("../../../server/api/signup/index.post.ts");

  beforeEach(() => {
    mockInsert.mockClear();
    mockValues.mockClear();
    mockFindFirst.mockClear();
    mockValues.mockResolvedValue(undefined);
    mockInsert.mockReturnValue({ values: mockValues });
    (dbModule.db.insert as any) = mockInsert;
    (dbModule.db.query.users.findFirst as any) = mockFindFirst;
  });

  it("is registered as an event handler", () => {
    expect(defineEventHandler).toHaveBeenCalled();
  });

  it("successfully creates a new user with valid data", async () => {
    mockFindFirst.mockResolvedValue(null);

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            password1: "SecurePass123!",
            password2: "SecurePass123!",
            dateOfBirth: "2000-01-01",
          },
        })
    );

    const response = await handler.default(event);

    expect(response).toEqual({ success: true });
    expect(mockFindFirst).toHaveBeenCalled();
    expect(mockInsert).toHaveBeenCalled();
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        name: "John Doe",
        email: "john.doe@example.com",
        passwordHash: expect.any(String),
        dateOfBirth: "2000-01-01",
      })
    );
  });

  it("hashes the password before storing", async () => {
    mockFindFirst.mockResolvedValue(null);
    const password = "TestPassword123!";

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            firstName: "Jane",
            lastName: "Smith",
            email: "jane.smith@example.com",
            password1: password,
            password2: password,
            dateOfBirth: "1995-06-15",
          },
        })
    );

    await handler.default(event);

    const insertedData = mockValues.mock.calls[0][0];
    expect(insertedData.passwordHash).not.toBe(password);
    expect(bcrypt.compareSync(password, insertedData.passwordHash)).toBe(true);
  });

  it("returns validation error for missing first name", async () => {
    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            firstName: "",
            lastName: "Doe",
            email: "test@example.com",
            password1: "Password123!",
            password2: "Password123!",
            dateOfBirth: "2000-01-01",
          },
        })
    );

    const response = await handler.default(event);

    expect(response.status).toBe(400);
    expect(response.message).toBe("Validation error");
    expect(response.data).toBeDefined();
  });

  it("returns validation error for missing last name", async () => {
    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            firstName: "John",
            lastName: "",
            email: "test@example.com",
            password1: "Password123!",
            password2: "Password123!",
            dateOfBirth: "2000-01-01",
          },
        })
    );

    const response = await handler.default(event);

    expect(response.status).toBe(400);
    expect(response.message).toBe("Validation error");
  });

  it("returns validation error for invalid email format", async () => {
    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            firstName: "John",
            lastName: "Doe",
            email: "invalid-email",
            password1: "Password123!",
            password2: "Password123!",
            dateOfBirth: "2000-01-01",
          },
        })
    );

    const response = await handler.default(event);

    expect(response.status).toBe(400);
    expect(response.message).toBe("Validation error");
  });

  it("returns validation error for password too short", async () => {
    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            firstName: "John",
            lastName: "Doe",
            email: "test@example.com",
            password1: "Pass1!",
            password2: "Pass1!",
            dateOfBirth: "2000-01-01",
          },
        })
    );

    const response = await handler.default(event);

    expect(response.status).toBe(400);
    expect(response.message).toBe("Validation error");
  });

  it("returns validation error for password without uppercase letter", async () => {
    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            firstName: "John",
            lastName: "Doe",
            email: "test@example.com",
            password1: "password123!",
            password2: "password123!",
            dateOfBirth: "2000-01-01",
          },
        })
    );

    const response = await handler.default(event);

    expect(response.status).toBe(400);
    expect(response.message).toBe("Validation error");
  });

  it("returns validation error for password without lowercase letter", async () => {
    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            firstName: "John",
            lastName: "Doe",
            email: "test@example.com",
            password1: "PASSWORD123!",
            password2: "PASSWORD123!",
            dateOfBirth: "2000-01-01",
          },
        })
    );

    const response = await handler.default(event);

    expect(response.status).toBe(400);
    expect(response.message).toBe("Validation error");
  });

  it("returns validation error for password without number", async () => {
    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            firstName: "John",
            lastName: "Doe",
            email: "test@example.com",
            password1: "Password!",
            password2: "Password!",
            dateOfBirth: "2000-01-01",
          },
        })
    );

    const response = await handler.default(event);

    expect(response.status).toBe(400);
    expect(response.message).toBe("Validation error");
  });

  it("returns validation error for password without special character", async () => {
    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            firstName: "John",
            lastName: "Doe",
            email: "test@example.com",
            password1: "Password123",
            password2: "Password123",
            dateOfBirth: "2000-01-01",
          },
        })
    );

    const response = await handler.default(event);

    expect(response.status).toBe(400);
    expect(response.message).toBe("Validation error");
  });

  it("returns validation error for user under 13 years old", async () => {
    const today = new Date();
    const tooYoungDate = new Date(
      today.getFullYear() - 12,
      today.getMonth(),
      today.getDate()
    )
      .toISOString()
      .split("T")[0];

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            firstName: "Young",
            lastName: "User",
            email: "young@example.com",
            password1: "Password123!",
            password2: "Password123!",
            dateOfBirth: tooYoungDate,
          },
        })
    );

    const response = await handler.default(event);

    expect(response.status).toBe(400);
    expect(response.message).toBe("Validation error");
  });

  it("returns error when user with email already exists", async () => {
    mockFindFirst.mockResolvedValue({
      id: "existing-user-id",
      email: "existing@example.com",
      name: "Existing User",
    });

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            firstName: "John",
            lastName: "Doe",
            email: "existing@example.com",
            password1: "Password123!",
            password2: "Password123!",
            dateOfBirth: "2000-01-01",
          },
        })
    );

    const response = await handler.default(event);

    expect(response.status).toBe(400);
    expect(response.message).toBe("A user with this email already exists.");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns database error when findFirst query fails", async () => {
    mockFindFirst.mockRejectedValue(new Error("Database connection failed"));

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            firstName: "John",
            lastName: "Doe",
            email: "test@example.com",
            password1: "Password123!",
            password2: "Password123!",
            dateOfBirth: "2000-01-01",
          },
        })
    );

    const response = await handler.default(event);

    expect(response.status).toBe(500);
    expect(response.message).toBe("Database error occurred.");
  });

  it("returns error when user creation fails", async () => {
    mockFindFirst.mockResolvedValue(null);
    mockValues.mockRejectedValue(new Error("Insert failed"));

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            firstName: "John",
            lastName: "Doe",
            email: "test@example.com",
            password1: "Password123!",
            password2: "Password123!",
            dateOfBirth: "2000-01-01",
          },
        })
    );

    const response = await handler.default(event);

    expect(response.status).toBe(500);
    expect(response.message).toBe("Failed to create user.");
  });

  it("generates a valid UUID for new user", async () => {
    mockFindFirst.mockResolvedValue(null);

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            password1: "Password123!",
            password2: "Password123!",
            dateOfBirth: "2000-01-01",
          },
        })
    );

    await handler.default(event);

    const insertedData = mockValues.mock.calls[0][0];
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(insertedData.id).toMatch(uuidRegex);
  });

  it("concatenates first and last name correctly", async () => {
    mockFindFirst.mockResolvedValue(null);

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            firstName: "Alice",
            lastName: "Johnson",
            email: "alice@example.com",
            password1: "Password123!",
            password2: "Password123!",
            dateOfBirth: "1998-03-20",
          },
        })
    );

    await handler.default(event);

    const insertedData = mockValues.mock.calls[0][0];
    expect(insertedData.name).toBe("Alice Johnson");
  });
});
