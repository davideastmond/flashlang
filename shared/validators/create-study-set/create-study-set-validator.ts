import z from "zod";
import type { CreateStudySetPostRequestBody } from "~~/shared/types/api/create-study-set/definitions";
import { SUPPORTED_LANGUAGES } from "~~/shared/types/definitions/supported-languages";
export const createStudyValidator = z.object({
  title: z.string().min(1, "Title is required"),
  language: z.string().refine((val) => {
    // Check against the SUPPORTED_LANGUAGES array
    return SUPPORTED_LANGUAGES.some((lang) => lang.code === val);
  }),
  flashCards: z
    .array(
      z.object({
        question: z.string().min(1, "Question is required"),
        answer: z.string().min(1, "Answer is required"),
      })
    )
    .min(1, "At least one flashcard is required")
    .refine(
      (cards) => {
        // Check for incomplete cards - each card must have both question and answer
        return cards.every(
          (card) => card.question.trim() !== "" && card.answer.trim() !== ""
        );
      },
      { message: "All flashcards must have both question and answer" }
    ),
  description: z.string().optional(),
}) satisfies z.ZodType<CreateStudySetPostRequestBody>;
