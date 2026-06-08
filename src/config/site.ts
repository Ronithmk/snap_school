import { env } from "./env";

export const siteConfig = {
  name: "SnapSchool",
  description:
    "Multi-tenant photography ordering platform for schools and events — separate albums, carts, and checkout per school.",
  url: env.appUrl,
  ogImage: `${env.appUrl}/og.png`,
} as const;
