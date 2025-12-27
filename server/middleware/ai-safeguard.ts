export default defineEventHandler(async (event) => {
  // Middleware logic to safeguard AI interactions
  const aiEnabled = process.env.AI_ENABLED === "true";

  if (!aiEnabled && event.path.includes("/api/ai/")) {
    throw createError({
      statusCode: 503,
      statusMessage: "AI services are currently disabled.",
    });
  }

  // Proceed to the next middleware or route handler
});
