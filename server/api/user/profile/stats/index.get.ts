import { getServerSession } from "#auth";
import { count, desc, eq } from "drizzle-orm";
import { db } from "~~/db";
import { studySessions, studySetFlashCards, studySets } from "~~/db/schema";

type StudySessionData = typeof studySessions.$inferSelect;

export default defineEventHandler(async (event) => {
  const serverSession = await getServerSession(event);
  if (!serverSession || !serverSession.user) {
    return createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  try {
    // Grab all study sessions to calculate
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
        eq(studySets.id, studySetFlashCards.studySetId),
      );

    const namedListOfStudySessions = await db
      .select({
        id: studySessions.id,
        title: studySets.title,
        startTime: studySessions.startTime,
        totalCount: studySessions.totalCount,
        correctCount: studySessions.correctCount,
        studySetId: studySets.id,
      })
      .from(studySessions)
      .where(eq(studySessions.userId, serverSession.user.id as string))
      .innerJoin(studySets, eq(studySessions.studySetId, studySets.id))
      .orderBy(desc(studySessions.startTime))
      .limit(3);

    // return {
    //   data: {
    //     totalStudySets: totalStudySets[0]?.value || 0,
    //     totalCards: totalCards[0]?.value || 0,
    //     studyStreak: calculateStudyStreakDays(
    //       studySessionData as Partial<StudySessionData>[]
    //     ),
    //     accuracy: calculateAccuracy(
    //       studySessionData as Partial<StudySessionData>[]
    //     ),
    //     totalStudySessions: studySessionData.length,
    //     recentSessions: namedListOfStudySessions,
    //   },
    // };
    return {
      totalStudySets: totalStudySets[0]?.value || 0,
      totalCards: totalCards[0]?.value || 0,
      studyStreak: calculateStudyStreakDays(
        studySessionData as Partial<StudySessionData>[],
      ),
      accuracy: calculateAccuracy(
        studySessionData as Partial<StudySessionData>[],
      ),
      totalStudySessions: studySessionData.length,
      recentSessions: namedListOfStudySessions,
    };
  } catch (error) {
    return createError({
      statusCode: 500,
      statusMessage: "Failed to fetch user stats",
    });
  }
});

function calculateAccuracy(
  studySessionData: Partial<StudySessionData>[],
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

function calculateStudyStreakDays(
  studySessionData: Partial<StudySessionData>[],
): number {
  if (!studySessionData || studySessionData.length === 0) {
    return 0;
  }

  // Extract unique dates (YYYY-MM-DD format) from study sessions and sort them in descending order
  const uniqueDates = Array.from(
    new Set(
      studySessionData
        .filter((session) => session.startTime)
        .map((session) => {
          const date = new Date(session.startTime!);
          return new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
          ).getTime();
        }),
    ),
  ).sort((a, b) => b - a); // Sort descending (most recent first)

  if (uniqueDates.length === 0) {
    return 0;
  }

  const today = new Date();
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ).getTime();
  const yesterdayMidnight = todayMidnight - 24 * 60 * 60 * 1000;

  // Check if the most recent session is today or yesterday
  const mostRecentDate = uniqueDates[0];
  if (
    mostRecentDate !== todayMidnight &&
    mostRecentDate !== yesterdayMidnight
  ) {
    // Streak is broken if last session was not today or yesterday
    return 0;
  }

  let streak = 1;

  // Count consecutive days backwards
  for (let i = 1; i < uniqueDates.length; i++) {
    const currentDate = uniqueDates[i];
    const previousDate = uniqueDates[i - 1];
    const dayDifference = (previousDate - currentDate) / (24 * 60 * 60 * 1000);

    if (dayDifference === 1) {
      streak++;
    } else {
      // Streak is broken
      break;
    }
  }

  return streak;
}
