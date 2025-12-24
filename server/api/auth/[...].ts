import { NuxtAuthHandler } from "#auth";
import { authOptions } from "~/server/utils/auth/auth";

export default NuxtAuthHandler(authOptions);
