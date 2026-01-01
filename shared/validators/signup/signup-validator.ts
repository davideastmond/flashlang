import { z } from "zod";

export const signupValidator = z.object({
  firstName: z.string().nonempty("First name is required"),
  lastName: z.string().nonempty("Last name is required"),
  email: z.email("Invalid email address"),
  password1: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(50)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character"
    ),

  dateOfBirth: z.string().refine(
    (date) => {
      const dob = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      return (
        age > 13 ||
        (age === 13 && monthDiff >= 0 && today.getDate() >= dob.getDate())
      );
    },
    { message: "You must be at least 13 years old to sign up" }
  ),
});

export const signupFormValidator = signupValidator
  .extend({
    password2: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(50)
      .nonempty(),
  })
  .refine((data) => data.password1 === data.password2, {
    message: "Passwords do not match",
    path: ["password2"],
  });
