import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateGeminiResponse } from "../../../server/utils/gemini/gemini-client";

// Mock the @google/genai module
vi.mock("@google/genai", () => ({
  GoogleGenAI: vi.fn(() => ({
    models: {
      generateContent: vi.fn(),
    },
  })),
}));

describe("generateGeminiResponse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set environment variable for tests
    process.env.GEMINI_API_KEY = "test-api-key";
  });

  it("should return generated text from Gemini", async () => {
    const mockText = "Generated response from Gemini";
    const mockPrompt = "Test prompt for Gemini";

    const { GoogleGenAI } = await import("@google/genai");
    const mockGenerateContent = vi.fn().mockResolvedValue({
      text: mockText,
    });

    (GoogleGenAI as any).mockImplementation(() => ({
      models: {
        generateContent: mockGenerateContent,
      },
    }));

    const result = await generateGeminiResponse(mockPrompt);

    expect(result).toBe(mockText);
    expect(mockGenerateContent).toHaveBeenCalledWith({
      model: "gemini-2.5-flash",
      contents: mockPrompt,
    });
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });

  it("should handle API errors", async () => {
    const { GoogleGenAI } = await import("@google/genai");
    const mockError = new Error("Gemini API Error");

    (GoogleGenAI as any).mockImplementation(() => ({
      models: {
        generateContent: vi.fn().mockRejectedValue(mockError),
      },
    }));

    await expect(generateGeminiResponse("test")).rejects.toThrow(
      "Gemini API Error",
    );
  });

  it("should initialize GoogleGenAI with API key from environment", async () => {
    const { GoogleGenAI } = await import("@google/genai");
    const mockGenerateContent = vi.fn().mockResolvedValue({
      text: "Response",
    });

    (GoogleGenAI as any).mockImplementation(() => ({
      models: {
        generateContent: mockGenerateContent,
      },
    }));

    await generateGeminiResponse("test prompt");

    expect(GoogleGenAI).toHaveBeenCalledWith({
      apiKey: "test-api-key",
    });
  });

  it("should pass different prompts correctly", async () => {
    const prompts = ["First prompt", "Second prompt", "Another test prompt"];

    for (const prompt of prompts) {
      const { GoogleGenAI } = await import("@google/genai");
      const mockGenerateContent = vi.fn().mockResolvedValue({
        text: `Response for ${prompt}`,
      });

      (GoogleGenAI as any).mockImplementation(() => ({
        models: {
          generateContent: mockGenerateContent,
        },
      }));

      const result = await generateGeminiResponse(prompt);

      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      expect(result).toBe(`Response for ${prompt}`);
    }
  });

  it("should handle empty string prompts", async () => {
    const { GoogleGenAI } = await import("@google/genai");
    const mockGenerateContent = vi.fn().mockResolvedValue({
      text: "Empty response",
    });

    (GoogleGenAI as any).mockImplementation(() => ({
      models: {
        generateContent: mockGenerateContent,
      },
    }));

    const result = await generateGeminiResponse("");

    expect(mockGenerateContent).toHaveBeenCalledWith({
      model: "gemini-2.5-flash",
      contents: "",
    });
    expect(result).toBe("Empty response");
  });
});
