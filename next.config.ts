import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

type RemotePattern = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number];

const remotePatterns: RemotePattern[] = [
  { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
  { protocol: "https", hostname: "**.cloudflare.com" },
  { protocol: "https", hostname: "**.amazonaws.com" },
];

// Pick up the bucket's public CDN/custom domain from env so uploaded photos
// (S3 or R2) are served through Next's image optimizer without extra config.
const publicAssetUrl = process.env.S3_PUBLIC_URL || process.env.R2_PUBLIC_URL || "";
if (publicAssetUrl && !/^\[.*\]$/.test(publicAssetUrl)) {
  try {
    const { protocol, hostname } = new URL(publicAssetUrl);
    if (protocol === "http:" || protocol === "https:") {
      remotePatterns.push({ protocol: protocol.slice(0, -1) as "http" | "https", hostname });
    }
  } catch {
    // Ignore malformed URLs — falls back to the patterns above.
  }
}

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp"],
  images: { remotePatterns },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  widenClientFileUpload: true,
  sourcemaps: { disable: true },
});
