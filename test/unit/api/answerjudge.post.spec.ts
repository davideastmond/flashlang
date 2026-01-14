// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import * as OpenAIData from "../../../server/utils/open-ai/open-ai-client.ts";
import { useH3TestUtils } from "../../setup.ts";

const { defineEventHandler } = useH3TestUtils();

const mockAIResponse = vi.fn();
// Simple mock implementation based on the prompt content

vi.spyOn(OpenAIData, "generateOpenAIResponse").mockImplementation(() =>
  mockAIResponse()
);
describe("api/ai/answerjudge POST endpoint tests", async () => {
  const handler = await import(
    "../../../server/api/ai/answerjudge/index.post.ts"
  );

  it("is registered as an event handler", () => {
    expect(defineEventHandler).toHaveBeenCalled();
  });
  it("returns a success response", async () => {
    mockAIResponse.mockResolvedValue({
      isCorrect: false,
      reasoning: "The user's answer is incorrect.",
    });
    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            question: "What is the capital of France?",
            userAnswer: "Paris",
            correctAnswer: "Paris",
          },
        })
    );

    const response = await handler.default(event);

    expect(response).toHaveProperty("success", true);
    expect(response).toHaveProperty("data");
  });
  it("returns a 400 error for invalid request body", async () => {
    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            question: "",
            userAnswer: "Paris",
            correctAnswer: "Paris",
          },
        })
    );

    const response = await handler.default(event);
    expect(response).toHaveProperty("statusCode", 400);
    expect(response).toHaveProperty("statusMessage", "Invalid request body.");
  });
  it("returns a 500 error for invalid AI response format", async () => {
    mockAIResponse.mockResolvedValue({
      wrongField: true,
    });
    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            question: "What is the capital of France?",
            userAnswer: "Paris",
            correctAnswer: "Paris",
          },
        })
    );

    const response = await handler.default(event);
    expect(response).toHaveProperty("statusCode", 500);
    expect(response).toHaveProperty(
      "statusMessage",
      "Invalid response format from AI."
    );
  });
  it("handles OpenAI errors gracefully", async () => {
    mockAIResponse.mockRejectedValue(new Error("OpenAI API error"));
    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            question: "What is 2 + 2?",
            userAnswer: "4",
            correctAnswer: "4",
          },
        })
    );

    const response = await handler.default(event);
    expect(response).toHaveProperty("statusCode", 500);
    expect(response).toHaveProperty(
      "statusMessage",
      "Failed to judge the answer."
    );
  });
});
