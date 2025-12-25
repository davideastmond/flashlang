// next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and `getServerSession`
   * The user property is extended to include 'id'.
   */
  interface Session {
    user?: {
      id?: string;
    } & DefaultSession["user"];
  }
}
