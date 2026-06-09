"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  BookOpen, Check, ChevronRight, Cloud, Database,
  Globe, Info, Plug, RefreshCw, ToggleLeft, ToggleRight, Wifi, WifiOff,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSchool } from "@/hooks/use-tenant";
import { useUiStore } from "@/stores/ui.store";
import { SUPPORTED_LOCALES as LOCALE_LIST, type Locale } from "@/config/i18n";
import { routes } from "@/config/routes";

interface Props { params: Promise<{ schoolId: string }> }

const LOCALE_DISPLAY: Record<Locale, string> = { en: "English", fr: "Français", es: "Español" };

const CDN_PROVIDERS = ["Auto (Cloudflare)", "AWS CloudFront", "Bunny CDN", "Custom origin"];

type IntegrationStatus = "connected" | "disconnected" | "pending";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  status: IntegrationStatus;
  category: string;
}

const ERP_INTEGRATIONS: Integration[] = [
  {
    id: "google_classroom",
    name: "Google Classroom",
    description: "Auto-import classes and student rosters from Google Classroom.",
    icon: BookOpen,
    iconColor: "bg-blue-500/10 text-blue-600",
    status: "disconnected",
    category: "ERP",
  },
  {
    id: "powerschool",
    name: "PowerSchool",
    description: "Sync enrolment data from PowerSchool SIS.",
    icon: Database,
    iconColor: "bg-green-500/10 text-green-600",
    status: "disconnected",
    category: "ERP",
  },
  {
    id: "clever",
    name: "Clever",
    description: "Single sign-on and roster sync via Clever.",
    icon: Globe,
    iconColor: "bg-amber-500/10 text-amber-600",
    status: "disconnected",
    category: "ERP",
  },
];

const STATUS_BADGE: Record<IntegrationStatus, { label: string; variant: "positive" | "neutral" | "warning" }> = {
  connected:    { label: "Connected",    variant: "positive" },
  disconnected: { label: "Not connected", variant: "neutral" },
  pending:      { label: "Pending setup", variant: "warning" },
};

function IntegrationCard({ integration }: { integration: Integration }) {
  const [status, setStatus] = useState<IntegrationStatus>(integration.status);
  const Icon = integration.icon;

  return (
    <Card>
      <CardContent className="flex items-start gap-4 p-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${integration.iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm">{integration.name}</p>
            <Badge variant={STATUS_BADGE[status].variant} className="text-xs">{STATUS_BADGE[status].label}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{integration.description}</p>
        </div>
        <Button
          variant={status === "connected" ? "outline" : "default"}
          size="sm"
          className="shrink-0"
          onClick={() => setStatus((s) => s === "connected" ? "disconnected" : "connected")}
        >
          {status === "connected" ? "Disconnect" : "Connect"}
          {status !== "connected" && <ChevronRight className="h-3.5 w-3.5" />}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function IntegrationsPage({ params }: Props) {
  const { schoolId } = use(params);
  const { data: school } = useSchool(schoolId);
  const { locale, setLocale } = useUiStore();

  const [cdnProvider, setCdnProvider] = useState(CDN_PROVIDERS[0]);
  const [cdnOrigin, setCdnOrigin] = useState("");
  const [offlineSync, setOfflineSync] = useState(false);
  const [liveUpload, setLiveUpload] = useState(false);
  const [cdnSaved, setCdnSaved] = useState(false);

  const saveCdn = () => {
    setCdnSaved(true);
    setTimeout(() => setCdnSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={routes.dashboard.schools()} className="hover:text-foreground transition-colors">Schools</Link>
        <span>/</span>
        <Link href={routes.dashboard.school(schoolId)} className="hover:text-foreground transition-colors truncate">{school?.name ?? schoolId}</Link>
        <span>/</span>
        <span className="text-foreground">Integrations</span>
      </nav>

      <PageHeader
        title="Integrations"
        description="Connect SnapSchool to your school's existing tools — ERPs, CDN, and offline sync."
      />

      {/* ERP / SIS */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">Student Information Systems (SIS / ERP)</h2>
        </div>
        <div className="flex items-start gap-2 rounded-lg border bg-blue-50 px-4 py-3 dark:bg-blue-900/10">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Once connected, classes and students will sync automatically every night. You can also trigger a manual sync at any time.
          </p>
        </div>
        <div className="space-y-3">
          {ERP_INTEGRATIONS.map((i) => <IntegrationCard key={i.id} integration={i} />)}
        </div>
      </section>

      {/* CDN */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Cloud className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">CDN / Image Delivery</h2>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base">Photo delivery settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>CDN provider</Label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={cdnProvider}
                onChange={(e) => setCdnProvider(e.target.value)}
              >
                {CDN_PROVIDERS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            {cdnProvider === "Custom origin" && (
              <div className="space-y-1.5">
                <Label htmlFor="cdn-origin">Custom origin URL</Label>
                <Input id="cdn-origin" value={cdnOrigin} onChange={(e) => setCdnOrigin(e.target.value)} placeholder="https://cdn.yourschool.edu" />
              </div>
            )}
            <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
              <p><span className="font-medium">Images are served at: </span>{cdnOrigin || `https://media.snapschool.app/${school?.slug ?? "school"}/`}</p>
              <p>All images are automatically converted to WebP and resized to 3 breakpoints (480, 1024, 2000 px).</p>
            </div>
            <Button size="sm" onClick={saveCdn}>
              {cdnSaved ? <Check className="h-4 w-4" /> : null}
              {cdnSaved ? "Saved!" : "Save CDN settings"}
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Live upload sync */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">Live Upload Sync</h2>
        </div>
        <Card>
          <CardContent className="flex items-start gap-4 p-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${liveUpload ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>
              <Wifi className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Real-time photo sync</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                When enabled, photos uploaded from the mobile app appear in parents' galleries within seconds using WebSocket push.
              </p>
              {liveUpload && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Live sync is active
                </div>
              )}
            </div>
            <button type="button" onClick={() => setLiveUpload((v) => !v)}>
              {liveUpload
                ? <ToggleRight className="h-7 w-7 text-primary" />
                : <ToggleLeft className="h-7 w-7 text-muted-foreground" />}
            </button>
          </CardContent>
        </Card>
      </section>

      {/* Offline sync */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <WifiOff className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">Offline Sync (PWA)</h2>
        </div>
        <Card>
          <CardContent className="flex items-start gap-4 p-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${offlineSync ? "bg-blue-500/10 text-blue-600" : "bg-muted text-muted-foreground"}`}>
              <WifiOff className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Offline access for parents</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Cache recently viewed galleries and orders in the browser. Parents can browse without an internet connection. Requires PWA installation.
              </p>
            </div>
            <button type="button" onClick={() => setOfflineSync((v) => !v)}>
              {offlineSync
                ? <ToggleRight className="h-7 w-7 text-primary" />
                : <ToggleLeft className="h-7 w-7 text-muted-foreground" />}
            </button>
          </CardContent>
        </Card>
      </section>

      {/* Multi-language */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">Multi-Language</h2>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base">Default storefront language</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {LOCALE_LIST.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLocale(code)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${locale === code ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"}`}
                >
                  {locale === code && <Check className="h-3 w-3" />}
                  {LOCALE_DISPLAY[code]}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Parents can switch language from the storefront footer. This setting controls the initial language shown.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Webhook / API */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Plug className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">Webhooks & API</h2>
        </div>
        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Use webhooks to receive real-time event notifications for orders, uploads, and approvals in your own systems.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="webhook-url">Webhook endpoint URL</Label>
              <Input id="webhook-url" placeholder="https://yourschool.edu/webhooks/snapschool" />
            </div>
            <Button size="sm" variant="outline">Save webhook</Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
