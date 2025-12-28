import z from "zod";

export const createStudySessionValidator = z.object({
  studySetId: z.uuid(),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid startTime format",
  }),
  endTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid endTime format",
  }),
  results: z.array(
    z.object({
      cardId: z.uuid(),
      userAnswer: z.string(),
      isCorrect: z.boolean(),
      answeredAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid answeredAt format",
      }),
    })
  ),
  score: z.object({
    correctCount: z.number().min(0),
    totalCount: z.number().min(1),
    percentage: z.number().min(0).max(100),
  }),
});
