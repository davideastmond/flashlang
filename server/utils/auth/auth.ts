import bcrypt from "bcrypt";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "~~/db";
const runtimeConfig = useRuntimeConfig();

export const authOptions: AuthOptions = {
  secret: runtimeConfig.nuxtAuth.secret,
  providers: [
    CredentialsProvider.default({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials: Record<string, string>) => {
        const queryUser = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.email, credentials?.email ?? ""),
        });
        if (!queryUser) {
          throw new Error("No user found with the provided email.");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials?.password ?? "",
          queryUser.passwordHash
        );
        if (!isPasswordValid) {
          throw new Error("Invalid password.");
        }
        return queryUser;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
};
