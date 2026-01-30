// Update a study set's title and description
import { getServerSession } from "#auth";
import { and, eq } from "drizzle-orm";
import { getRouterParam } from "h3";
import z from "zod";
import { db } from "~~/db";
import { studySets } from "~~/db/schema";

const updateStudySetValidator = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
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

  const requestBody = await readBody(event);

  try {
    updateStudySetValidator.parse(requestBody);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createError({
        statusCode: 400,
        statusMessage: "Validation error",
        data: error.issues,
      });
    }
  }

  // Update the study set
  const updated = await db
    .update(studySets)
    .set({
      ...(requestBody.title && { title: requestBody.title }),
      ...(requestBody.description !== undefined && {
        description: requestBody.description,
      }),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(studySets.id, studySetId),
        eq(studySets.userId, serverSession.user.id as string),
      ),
    )
    .returning();

  if (!updated || updated.length === 0) {
    return createError({
      statusCode: 404,
      statusMessage: "Study set not found",
    });
  }

  return {
    success: true,
    data: updated[0],
  };
});
