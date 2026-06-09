import { PostHog } from "posthog-node";

let _posthog: PostHog | null = null;

function getPostHog() {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return null;
  if (!_posthog) {
    _posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
      flushAt: 10,
      flushInterval: 5000,
    });
  }
  return _posthog;
}

export function trackServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>
) {
  const ph = getPostHog();
  if (!ph) return;
  ph.capture({ distinctId, event, properties });
}
