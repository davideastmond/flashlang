import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateOpenAIResponse } from "../../../server/utils/open-ai/open-ai-client";

// Mock the openai module
vi.mock("openai", () => ({
  default: vi.fn(() => ({
    responses: {
      create: vi.fn(),
    },
  })),
}));

describe("generateOpenAIResponse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return generated text from OpenAI", async () => {
    const mockOutput = "Generated response text";
    const mockPrompt = "Test prompt";

    const OpenAIApi: any = (await import("openai")).default;
    const mockCreate = vi.fn().mockResolvedValue({
      output_text: mockOutput,
    });

    OpenAIApi.mockImplementation(() => ({
      responses: {
        create: mockCreate,
      },
    }));

    const result = await generateOpenAIResponse(mockPrompt);

    expect(result).toBe(mockOutput);
    expect(mockCreate).toHaveBeenCalledWith({
      model: "gpt-5-nano",
      input: mockPrompt,
    });
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it("should handle API errors", async () => {
    const OpenAIApi: any = (await import("openai")).default;

    OpenAIApi.mockImplementation(() => ({
      responses: {
        create: vi.fn().mockRejectedValue(new Error("API Error")),
      },
    }));

    await expect(generateOpenAIResponse("test")).rejects.toThrow("API Error");
  });

  it("should pass different prompts correctly", async () => {
    const prompts = ["Prompt 1", "Prompt 2", "Another test prompt"];

    for (const prompt of prompts) {
      const OpenAIApi: any = (await import("openai")).default;
      const mockCreate = vi.fn().mockResolvedValue({
        output_text: `Response for ${prompt}`,
      });

      OpenAIApi.mockImplementation(() => ({
        responses: {
          create: mockCreate,
        },
      }));

      const result = await generateOpenAIResponse(prompt);

      expect(mockCreate).toHaveBeenCalledWith({
        model: "gpt-5-nano",
        input: prompt,
      });
      expect(result).toBe(`Response for ${prompt}`);
    }
  });
});
