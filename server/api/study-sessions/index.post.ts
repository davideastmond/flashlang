import { getServerSession } from "#auth";
import z from "zod";
import { db } from "~~/db";
import { studySessions } from "~~/db/schema";
import type { CreateStudySessionAPIRequest } from "~~/shared/types/api/create-study-session/definitions";
import { createStudySessionValidator } from "~~/shared/validators/create-study-session/create-study-session-validator";

export default defineEventHandler(async (event) => {
  // Add stats to the study-session
  const serverSession = await getServerSession(event);
  if (!serverSession || !serverSession.user) {
    return createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  const requestBody = await readBody<CreateStudySessionAPIRequest>(event);

  try {
    createStudySessionValidator.parse(requestBody);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createError({
        status: 400,
        message: "Validation error",
        data: error.issues,
      });
    }
  }

  // Transform and store the study session in the database
  const objectToInsert = {
    id: crypto.randomUUID(),
    userId: serverSession.user.id as string,
    studySetId: requestBody.studySetId,
    startTime: new Date(requestBody.startTime),
    endTime: new Date(requestBody.endTime),
    correctCount: requestBody.score.correctCount,
    totalCount: requestBody.score.totalCount,
    results: requestBody.results,
  };
  try {
    await db.insert(studySessions).values(objectToInsert);
    return {
      success: true,
    };
  } catch (error) {
    return createError({
      statusCode: 500,
      statusMessage: "Failed to create study session",
    });
  }
});
