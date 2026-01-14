import z from "zod";
import { SUPPORTED_LANGUAGES } from "~~/shared/types/definitions/supported-languages";

export const createFlashCardBodyValidator = z.object({
  topic: z.string().min(1, "Topic is required"),
  language: z
    .string()
    .optional()
    .refine((val) => {
      // Basic validation to check if language is a non-empty string when provided
      return SUPPORTED_LANGUAGES.some((lang) => lang.code === val);
    }),
  cefrLanguage: z.string().refine((val) => {
    return SUPPORTED_LANGUAGES.some((lang) => lang.code === val);
  }),
});

export const createFlashCardAIFormatResponseValidator = z.array(
  z.object({
    question: z.string().min(1, "Question is required"),
    answer: z.string().min(1, "Answer is required"),
  })
);
