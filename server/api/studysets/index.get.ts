// Fetch all study sets for the authenticated user
import { getServerSession } from "#auth";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "~~/db";
import { studySetFlashCards, studySets } from "~~/db/schema";

export default defineEventHandler(async (event) => {
  const serverSession = await getServerSession(event);
  if (!serverSession || !serverSession.user) {
    return createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  // Fetch all study sets for the user with card counts
  const userStudySets = await db
    .select({
      id: studySets.id,
      title: studySets.title,
      description: studySets.description,
      createdAt: studySets.createdAt,
      updatedAt: studySets.updatedAt,
      cardCount: sql<number>`cast(count(${studySetFlashCards.flashCardId}) as int)`,
    })
    .from(studySets)
    .leftJoin(
      studySetFlashCards,
      eq(studySets.id, studySetFlashCards.studySetId)
    )
    .where(eq(studySets.userId, serverSession.user.id as string))
    .groupBy(studySets.id)
    .orderBy(desc(studySets.createdAt));

  return {
    success: true,
    data: userStudySets,
  };
});
