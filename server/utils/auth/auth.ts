import bcrypt from "bcrypt";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "~~/db";
const runtimeConfig = useRuntimeConfig();

console.log("AUTH_SECRET", runtimeConfig.nuxtAuth.secret);
console.log("PROCESS.env AUTH_SECRET", process.env.AUTH_SECRET);

console.log("AUTH_ORIGIN", runtimeConfig.auth?.baseURL);
console.log("PROCESS.env AUTH_ORIGIN", process.env.AUTH_ORIGIN);
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
          throw new Error("We couldn't find a user with these credentials.");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials?.password ?? "",
          queryUser.passwordHash
        );
        if (!isPasswordValid) {
          throw new Error("Invalid e-mail or password.");
        }
        return queryUser;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
};
