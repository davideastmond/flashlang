// Fetch a specific study set with its flash cards
import { getServerSession } from "#auth";
import { and, desc, eq } from "drizzle-orm";
import { getRouterParam } from "h3";
import { db } from "~~/db";
import {
  flashCards,
  studySessions,
  studySetFlashCards,
  studySets,
} from "~~/db/schema";

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

  // Fetch the study set
  const studySet = await db
    .select()
    .from(studySets)
    .where(
      and(
        eq(studySets.id, studySetId),
        eq(studySets.userId, serverSession.user.id as string),
      ),
    )
    .limit(1);

  if (!studySet || studySet.length === 0) {
    return createError({
      statusCode: 404,
      statusMessage: "Study set not found",
    });
  }

  // Fetch all flash cards for this study set
  const cards = await db
    .select({
      id: flashCards.id,
      question: flashCards.question,
      answer: flashCards.answer,
      createdAt: flashCards.createdAt,
      updatedAt: flashCards.updatedAt,
    })
    .from(flashCards)
    .innerJoin(
      studySetFlashCards,
      eq(flashCards.id, studySetFlashCards.flashCardId),
    )
    .where(eq(studySetFlashCards.studySetId, studySetId));

  const lastStudiedAtStat = await db
    .select()
    .from(studySessions)
    .where(eq(studySessions.studySetId, studySetId))
    .orderBy(desc(studySessions.startTime))
    .limit(1);

  return {
    success: true,
    data: {
      ...studySet[0],
      flashCards: cards,
      lastStudiedAt: lastStudiedAtStat.length > 0 ? lastStudiedAtStat[0] : null,
    },
  };
});
