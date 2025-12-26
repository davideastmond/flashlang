// This route handles creation of new study sets
// We expect at least one flashcard in the request body

import { getServerSession } from "#auth";
import z from "zod";
import { db } from "~~/db";
import { flashCards, studySetFlashCards, studySets } from "~~/db/schema";
import type { CreateStudySetPostRequestBody } from "~~/shared/types/api/create-study-set/definitions";
import { createStudyValidator } from "~~/shared/validators/create-study-set/create-study-set-validator";
export default defineEventHandler(async (event) => {
  const serverSession = await getServerSession(event);
  if (!serverSession || !serverSession.user)
    return createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });

  const requestBody = await readBody<CreateStudySetPostRequestBody>(event);
  try {
    createStudyValidator.parse(requestBody);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createError({
        status: 400,
        message: "Validation error",
        data: error.issues,
      });
    }
  }

  // Create a new study set in the database
  const newStudySet = await db
    .insert(studySets)
    .values({
      id: crypto.randomUUID(),
      userId: serverSession.user.id as string,
      title: requestBody.title,
      description: requestBody.description,
      language: requestBody.language || "en-US",
    })
    .returning();

  console.log("createdStudySet ID:", newStudySet[0].id);

  // Insert flashcards and link them to the study set
  for await (const card of requestBody.flashCards) {
    const flashCardId = crypto.randomUUID();
    await db.insert(flashCards).values({
      id: flashCardId,
      userId: serverSession.user.id as string,
      question: card.question,
      answer: card.answer,
    });

    await db.insert(studySetFlashCards).values({
      studySetId: newStudySet[0].id,
      flashCardId: flashCardId,
    });
  }
  return {
    success: true,
    data: newStudySet[0].id,
  };
});
