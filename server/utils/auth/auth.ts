import bcrypt from "bcrypt";
import { AuthOptions, Session } from "next-auth";
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
          throw new Error("We couldn't find a user with these credentials.");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials?.password ?? "",
          queryUser.passwordHash,
        );
        if (!isPasswordValid) {
          throw new Error("We can't sign you in with those credentials.");
        }
        return queryUser;
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token = {
          ...token,
          id: user?.id,
          email: user?.email,
          name: user?.name,
          // Set token expiration to 1 hour
          exp: Math.floor(Date.now() / 1000) + 60 * 60,
        };
      }
      return token;
    },
    session: async ({ session, token }) => {
      session = {
        ...session,
        user: {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
        } as Session["user"],
      };
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour
  },
};
