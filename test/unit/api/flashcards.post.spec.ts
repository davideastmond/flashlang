// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import * as GeminiClient from "../../../server/utils/gemini/gemini-client.ts";
import { useH3TestUtils } from "../../setup.ts";

const { defineEventHandler } = useH3TestUtils();

const mockGeminiResponse = vi.fn();

vi.spyOn(GeminiClient, "generateGeminiResponse").mockImplementation(() =>
  mockGeminiResponse()
);

describe("api/ai/flashcards POST endpoint tests", async () => {
  const handler = await import(
    "../../../server/api/ai/flashcards/index.post.ts"
  );

  it("is registered as an event handler", () => {
    expect(defineEventHandler).toHaveBeenCalled();
  });

  it("generates flashcards with default parameters", async () => {
    const mockFlashcards = [
      { question: "homme", answer: "man" },
      { question: "femme", answer: "woman" },
      { question: "enfant", answer: "child" },
      { question: "maison", answer: "house" },
      { question: "chat", answer: "cat" },
    ];

    mockGeminiResponse.mockResolvedValue(mockFlashcards);

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            topic: "French vocabulary",
            language: "en-US",
            cefrLanguage: "fr-FR",
          },
        })
    );

    const response = await handler.default(event);

    expect(response).toHaveProperty("success", true);
    expect(response).toHaveProperty("flashcards");
    expect(GeminiClient.generateGeminiResponse).toHaveBeenCalledWith(
      expect.stringContaining(
        "Generate a set of 5 flashcards on French vocabulary"
      )
    );
    expect(GeminiClient.generateGeminiResponse).toHaveBeenCalledWith(
      expect.stringContaining("language en-US")
    );
  });

  it("generates flashcards with custom flashCardCount", async () => {
    const mockFlashcards = [
      { question: "hola", answer: "hello" },
      { question: "adiós", answer: "goodbye" },
      { question: "gracias", answer: "thank you" },
    ];

    mockGeminiResponse.mockResolvedValue(mockFlashcards);

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            topic: "Spanish greetings",
            flashCardCount: 3,
            language: "en-US",
            cefrLanguage: "es-ES",
          },
        })
    );

    const response = await handler.default(event);

    expect(response).toHaveProperty("success", true);
    expect(response).toHaveProperty("flashcards");
    expect(GeminiClient.generateGeminiResponse).toHaveBeenCalledWith(
      expect.stringContaining(
        "Generate a set of 3 flashcards on Spanish greetings"
      )
    );
  });

  it("generates flashcards with custom language parameter", async () => {
    const mockFlashcards = [
      { question: "gato", answer: "cat" },
      { question: "perro", answer: "dog" },
    ];

    mockGeminiResponse.mockResolvedValue(mockFlashcards);

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            topic: "Animals",
            language: "es-ES",
            flashCardCount: 2,
            cefrLanguage: "en-US",
          },
        })
    );

    const response = await handler.default(event);

    expect(response).toHaveProperty("success", true);
    expect(response).toHaveProperty("flashcards");
    expect(GeminiClient.generateGeminiResponse).toHaveBeenCalledWith(
      expect.stringContaining("language es-ES")
    );
    expect(GeminiClient.generateGeminiResponse).toHaveBeenCalledWith(
      expect.stringContaining("learning en-US")
    );
  });

  it("generates flashcards with all custom parameters", async () => {
    const mockFlashcards = [
      { question: "Wie geht's?", answer: "How are you?" },
      { question: "Guten Tag", answer: "Good day" },
      { question: "Danke", answer: "Thank you" },
      { question: "Bitte", answer: "Please" },
      { question: "Auf Wiedersehen", answer: "Goodbye" },
      { question: "Ja", answer: "Yes" },
      { question: "Nein", answer: "No" },
      { question: "Entschuldigung", answer: "Excuse me" },
      { question: "Sprechen Sie Englisch?", answer: "Do you speak English?" },
      { question: "Ich verstehe nicht", answer: "I don't understand" },
    ];

    mockGeminiResponse.mockResolvedValue(mockFlashcards);

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            topic: "German phrases",
            language: "de-DE",
            flashCardCount: 10,
            cefrLanguage: "de-DE",
          },
        })
    );

    const response = await handler.default(event);

    expect(response).toHaveProperty("success", true);
    expect(response).toHaveProperty("flashcards");
    expect(GeminiClient.generateGeminiResponse).toHaveBeenCalledWith(
      expect.stringContaining(
        "Generate a set of 10 flashcards on German phrases"
      )
    );
    expect(GeminiClient.generateGeminiResponse).toHaveBeenCalledWith(
      expect.stringContaining("language de-DE")
    );
  });
  it("handles Gemini API errors gracefully", async () => {
    mockGeminiResponse.mockRejectedValue(new Error("API rate limit exceeded"));

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            topic: "Programming concepts",
            cefrLanguage: "en-US",
            language: "en-US",
          },
        })
    );

    const response = await handler.default(event);

    expect(response).toHaveProperty("statusCode", 500);
    expect(response).toHaveProperty(
      "statusMessage",
      "Failed to generate flashcards.API rate limit exceeded"
    );
  });

  it("returns response from Gemini API", async () => {
    const mockResponse = [{ question: "What is 2 + 2?", answer: "4" }];
    mockGeminiResponse.mockResolvedValue(mockResponse);

    const event = await import("../../utils/mock-h3-event.ts").then(
      ({ createMockH3Event }) =>
        createMockH3Event({
          body: {
            topic: "History facts",
            language: "en-US",
            flashCardCount: 7,
            cefrLanguage: "en-US",
          },
        })
    );

    const response = await handler.default(event);

    expect(response).toEqual({
      success: true,
      flashcards: mockResponse,
    });
  });
});
