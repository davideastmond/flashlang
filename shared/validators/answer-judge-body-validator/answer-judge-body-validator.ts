import z from "zod";

export const answerJudgeBodyValidator = z.object({
  question: z.string().min(1, "Question cannot be empty."),
  userAnswer: z.string().min(1, "User answer cannot be empty."),
  correctAnswer: z.string().min(1, "Correct answer cannot be empty."),
});

export const answerJudgeAIResponseFormatValidator = z.object({
  isCorrect: z.boolean(),
  reasoning: z.string().min(1, "Reasoning cannot be empty."),
});
export type AnswerJudgeBody = z.infer<typeof answerJudgeBodyValidator>;
