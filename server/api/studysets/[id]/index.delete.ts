import { getServerSession } from "#auth";
import { and, eq } from "drizzle-orm";
import { getRouterParam } from "h3";
import { db } from "~~/db";
import { studySets } from "~~/db/schema";
export default defineEventHandler(async (event) => {
  const serverSession = await getServerSession(event);
  if (!serverSession || !serverSession.user) {
    return createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }
  const studySetId = getRouterParam(event, "id");

  try {
    await db
      .delete(studySets)
      .where(
        and(
          eq(studySets.id, studySetId as string),
          eq(studySets.userId, serverSession.user.id as string),
        ),
      );
    // Delete a study set by its ID, ensuring it belongs to the authenticated user
    return {
      success: true,
    };
  } catch (error) {
    return createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
