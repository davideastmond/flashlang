// Add a new flash card to a study set
import { getServerSession } from "#auth";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { db } from "~~/db";
import { flashCards, studySetFlashCards, studySets } from "~~/db/schema";

const addCardValidator = z.object({
  question: z.string().min(1).max(1000),
  answer: z.string().min(1).max(1000),
});

export default defineEventHandler(async (event) => {
  const serverSession = await getServerSession(event);
  if (!serverSession || !serverSession.user) {
    return createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const studySetId = getRouterParam(event, "id");
  if (!studySetId) {
    return createError({
      statusCode: 400,
      statusMessage: "Study set ID is required",
    });
  }

  // Verify the study set exists and belongs to the user
  const studySet = await db
    .select()
    .from(studySets)
    .where(
      and(
        eq(studySets.id, studySetId),
        eq(studySets.userId, serverSession.user.id as string)
      )
    )
    .limit(1);

  if (!studySet || studySet.length === 0) {
    return createError({
      statusCode: 404,
      statusMessage: "Study set not found",
    });
  }

  const requestBody = await readBody(event);

  try {
    addCardValidator.parse(requestBody);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createError({
        statusCode: 400,
        statusMessage: "Validation error",
        data: error.issues,
      });
    }
  }

  // Create the flash card
  const flashCardId = crypto.randomUUID();
  const newCard = await db
    .insert(flashCards)
    .values({
      id: flashCardId,
      userId: serverSession.user.id as string,
      question: requestBody.question,
      answer: requestBody.answer,
    })
    .returning();

  // Link it to the study set
  await db.insert(studySetFlashCards).values({
    studySetId: studySetId,
    flashCardId: flashCardId,
  });

  return {
    success: true,
    data: newCard[0],
  };
});
