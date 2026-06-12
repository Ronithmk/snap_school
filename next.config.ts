import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

type RemotePattern = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number];

const remotePatterns: RemotePattern[] = [
  { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
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

// Scope the S3 image source to the configured bucket/region instead of all of *.amazonaws.com.
const awsRegion = process.env.AWS_REGION;
const s3Bucket = process.env.S3_BUCKET_NAME;
if (awsRegion && s3Bucket && !/^\[.*\]$/.test(awsRegion) && !/^\[.*\]$/.test(s3Bucket)) {
  remotePatterns.push({ protocol: "https", hostname: `${s3Bucket}.s3.${awsRegion}.amazonaws.com` });
}

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "img-src 'self' https: data:",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://*.posthog.com",
      "style-src 'self' 'unsafe-inline'",
      "connect-src 'self' https://*.razorpay.com https://*.posthog.com https://*.sentry.io https://*.ingest.sentry.io",
      "frame-src 'self' https://*.razorpay.com",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp"],
  images: { remotePatterns },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  widenClientFileUpload: true,
  sourcemaps: { disable: true },
});
