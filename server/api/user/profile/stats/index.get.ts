import { getServerSession } from "#auth";
import { count, eq } from "drizzle-orm";
import { db } from "~~/db";
import { studySessions, studySetFlashCards, studySets } from "~~/db/schema";

interface StudySessionData {
  id: string;
  userId: string;
  studySetId: string;
  createdAt: Date;
  updatedAt: Date;
  correctCount?: number;
  totalCount?: number;
}

export default defineEventHandler(async (event) => {
  const serverSession = await getServerSession(event);
  if (!serverSession || !serverSession.user) {
    return createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  try {
    const totalStudySessions = await db
      .select({ value: count() })
      .from(studySessions)
      .where(eq(studySessions.userId, serverSession.user.id as string));

    // Grab all study sessions
    const studySessionData = await db
      .select()
      .from(studySessions)
      .where(eq(studySessions.userId, serverSession.user.id as string));

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

    // Calculate accuracy from study sessions but calculating the average correct rate

    return {
      data: {
        totalStudySets: totalStudySets[0]?.value || 0,
        totalCards: totalCards[0]?.value || 0,
        studyStreak: 7,
        accuracy: calculateAccuracy(studySessionData),
        totalStudySessions: totalStudySessions[0]?.value || 0,
      },
    };
  } catch (error) {
    return createError({
      statusCode: 500,
      statusMessage: "Failed to fetch user stats",
    });
  }
});

function calculateAccuracy(
  studySessionData: Partial<StudySessionData>[]
): number {
  // Loop through and calculate average accuracy
  let totalCorrect = 0;
  let totalQuestions = 0;

  studySessionData.forEach((session) => {
    totalCorrect += session.correctCount || 0;
    totalQuestions += session.totalCount || 0;
  });

  if (totalQuestions === 0) return 0;

  return Math.round((totalCorrect / totalQuestions) * 100);
}
