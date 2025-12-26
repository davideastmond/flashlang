import { getServerSession } from "#auth";
import { count, eq } from "drizzle-orm";
import { db } from "~~/db";
import { studySetFlashCards, studySets } from "~~/db/schema";

// This route is used to calculate stats for the dashboard
/* 
stats.value = {
  totalStudySets: 0,
  totalSessions: 12,
  totalCards: 156,
  studyStreak: 7,
  accuracy: 85,
};

*/
export default defineEventHandler(async (event) => {
  const serverSession = await getServerSession(event);
  if (!serverSession || !serverSession.user) {
    return createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  try {
    // So far we can calculate the totalCards and the totalStudySets
    const totalStudySets = await db
      .select({ value: count() })
      .from(studySets)
      .where(eq(studySets.userId, serverSession.user.id as string));
    const totalCards = await db
      .select({ value: count() })
      .from(studySets)
      .where(eq(studySets.userId, serverSession.user.id as string))
      .innerJoin(
        studySetFlashCards,
        eq(studySets.id, studySetFlashCards.studySetId)
      );

    return {
      data: {
        totalStudySets: totalStudySets[0]?.value || 0,
        totalCards: totalCards[0]?.value || 0,
        studyStreak: 7,
        accuracy: 85,
        totalSessions: 12,
      },
    };
  } catch (error) {
    return createError({
      statusCode: 500,
      statusMessage: "Failed to fetch user stats",
    });
  }
});
