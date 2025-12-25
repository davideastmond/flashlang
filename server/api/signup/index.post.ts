import bcrypt from "bcrypt";
import { z } from "zod";
import { db } from "~~/db";
import { users } from "~~/db/schema";
import type { SignupData } from "~~/shared/types/api/signup/definitions";
import { signupValidator } from "~~/shared/validators/signup/signup-validator";
export default defineEventHandler(async (event) => {
  /* Register new user*/
  const requestBody = await readBody<SignupData>(event);

  // Validate request body
  try {
    signupValidator.parse(requestBody);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createError({
        status: 400,
        message: "Validation error",
        data: error.issues,
      });
    }
  }

  try {
    // Ensure a user with the same email doesn't already exist
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, requestBody.email),
    });
    if (existingUser) {
      return createError({
        status: 400,
        message: "A user with this email already exists.",
      });
    }
  } catch (error) {
    return createError({
      status: 500,
      message: "Database error occurred.",
    });
  }

  try {
    await db.insert(users).values({
      id: crypto.randomUUID(),
      name: `${requestBody.firstName} ${requestBody.lastName}`,
      email: requestBody.email,
      passwordHash: bcrypt.hashSync(requestBody.password1, 10),
      dateOfBirth: requestBody.dateOfBirth,
    });
    return { success: true };
  } catch (error) {
    console.error("Error creating user:", error);
    return createError({
      status: 500,
      message: "Failed to create user.",
    });
  }
});
