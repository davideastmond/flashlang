import { getServerSession } from "#auth";

export default defineEventHandler(async (event) => {
  const appliesToPaths = [
    "/api/study-sessions",
    "/api/ai/",
    "/api/flash-cards",
    "/api/studysets",
    "/api/user",
  ];

  if (!appliesToPaths.some((path) => event.path.startsWith(path))) {
    return;
  }
  const serverSession = await getServerSession(event);
  if (!serverSession || !serverSession.user) {
    return createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }
});
