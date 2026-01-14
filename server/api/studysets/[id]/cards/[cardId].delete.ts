// Delete a flash card from a study set
import { getServerSession } from "#auth";
import { and, eq } from "drizzle-orm";
import { getRouterParam } from "h3";
import { db } from "~~/db";
import { flashCards, studySetFlashCards, studySets } from "~~/db/schema";

export default defineEventHandler(async (event) => {
  const serverSession = await getServerSession(event);
  if (!serverSession || !serverSession.user) {
    return createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const studySetId = getRouterParam(event, "id");
  const cardId = getRouterParam(event, "cardId");

  if (!studySetId || !cardId) {
    return createError({
      statusCode: 400,
      statusMessage: "Study set ID and card ID are required",
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

  // Delete the association
  await db
    .delete(studySetFlashCards)
    .where(
      and(
        eq(studySetFlashCards.studySetId, studySetId),
        eq(studySetFlashCards.flashCardId, cardId)
      )
    );

  // Delete the flash card itself
  await db
    .delete(flashCards)
    .where(
      and(
        eq(flashCards.id, cardId),
        eq(flashCards.userId, serverSession.user.id as string)
      )
    );

  return {
    success: true,
    message: "Flash card deleted successfully",
  };
});
