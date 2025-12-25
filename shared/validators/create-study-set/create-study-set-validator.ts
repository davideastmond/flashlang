import z from "zod";
import type { CreateStudySetPostRequestBody } from "~~/shared/types/api/create-study-set/definitions";

export const createStudyValidator = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  flashCards: z
    .array(
      z.object({
        question: z.string().min(1, "Question is required"),
        answer: z.string().min(1, "Answer is required"),
      })
    )
    .min(1, "At least one flashcard is required"),
}) satisfies z.ZodType<CreateStudySetPostRequestBody>;
