// Makes a request to the Gemini API to generate flashcards based on input criteria in the post request
// post request parameters: topic (string) - the topic for which to generate flashcards
// number of flashcards to generate (default 5)

import z from "zod";
import { AIGenerateFlashcardsPostRequestBody } from "~~/shared/types/api/ai-generate-flashcards/definitions";
import {
  createFlashCardAIFormatResponseValidator,
  createFlashCardBodyValidator,
} from "~~/shared/validators/create-flashcard-body-validator/create-flashcard-body-validator";
import { generateGeminiResponse } from "../../../utils/gemini/gemini-client";
export default defineEventHandler(async (event) => {
  const body = await readBody<AIGenerateFlashcardsPostRequestBody>(event);

  try {
    createFlashCardBodyValidator.parse(body);
  } catch (error) {
    return createError({
      statusCode: 400,
      statusMessage: "Validation error.",
    });
  }
  const { topic, language = "en-US", flashCardCount = 5, cefrLanguage } = body;

  const prompt = `Generate a set of ${flashCardCount} flashcards on ${topic} where user is learning ${cefrLanguage}. 
    The flashcard questions should be written in the language ${language}.
    Each flashcard object should have a question and an answer. Format the response and return it as an array of objects with "question" and "answer" fields. 
    Example output would be '[{"question": "homme", "answer": "man"}, {"question": "to be", "answer": "être"}, {"question": "cat", "answer": "chat"}]'. 
    Return pure JSON and remove new lines as the response should be able to be parsed with JSON.parse(). 
    The answers should be concise and be able to be answered as one word or a short phrase with no extra parentheses or punctuation.
    The topic of the input should be centered on educational content. Nonsensical or non-educational topics should be returned as an empty array.`;

  try {
    const response = await generateGeminiResponse(prompt);
    try {
      createFlashCardAIFormatResponseValidator.parse(
        JSON.parse(response as any),
      );
      return {
        success: true,
        flashcards: response,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return createError({
          statusCode: 500,
          statusMessage:
            "Invalid AI response format." + JSON.stringify(error.issues),
        });
      }

      return createError({
        statusCode: 500,
        statusMessage:
          "AI response is not valid JSON: " + (error as Error).message,
      });
    }
  } catch (error) {
    return createError({
      statusCode: 500,
      statusMessage:
        "Failed to generate flashcards." + (error as Error).message,
    });
  }
});
