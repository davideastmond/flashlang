// Makes a request to the Gemini API to generate flashcards based on input criteria in the post request
// post request parameters: topic (string) - the topic for which to generate flashcards
// number of flashcards to generate (default 5)

import { AIGenerateFlashcardsPostRequestBody } from "~~/shared/types/api/ai-generate-flashcards/definitions";

export default defineEventHandler(async (event) => {
  const body = await readBody<AIGenerateFlashcardsPostRequestBody>(event);
  const { topic, flashCardCount = 5 } = body;

  const prompt = `Generate a set of ${flashCardCount} flashcards on the topic of ${topic}. 
    Each flashcard object should have a question and an answer. Format the response and return it as an array of objects with "question" and "answer" fields. 
    Example output would be '[{"question": "homme", "answer": "man"}, {"question": "to be", "answer": "être"}, {"question": "cat", "answer": "chat"}]'. 
    Return pure JSON and remove new lines as the response should be able to be parsed with JSON.parse(). 
    The answers should be concise and be able to be answered as one word or a short phrase with no extra parentheses or punctuation.
    The topic of the input should be centered on educational content. Nonsensical or non-educational topics should be returned as an empty array.`;

  const response = await generateGeminiResponse(prompt);

  return {
    success: true,
    flashcards: response,
  };
});
