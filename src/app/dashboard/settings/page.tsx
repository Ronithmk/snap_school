"use client";

import { useState } from "react";
import { DatabaseZap, Eye, LogOut, Megaphone, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useLogout, useSession } from "@/hooks/use-auth";
import { useCacheNamespaces, useClearCache } from "@/hooks/use-cache";
import { useMarketingCampaigns, useMarketingEmails, useSendMarketingCampaign } from "@/hooks/use-marketing";
import { useUiStore } from "@/stores/ui.store";
import { ROLE_LABELS } from "@/config/constants";
import { LOCALE_LABELS, SUPPORTED_LOCALES, isSupportedLocale } from "@/config/i18n";

function CacheCard() {
  const { data: namespaces, isLoading } = useCacheNamespaces();
  const clearCache = useClearCache();
  const [pending, setPending] = useState<string | null>(null);

  function handleClear(tag?: string, label?: string) {
    setPending(tag ?? "all");
    clearCache.mutate(tag, {
      onSuccess: () => toast.success(label ? `${label} cache cleared.` : "All caches cleared."),
      onError: () => toast.error("Failed to clear cache."),
      onSettled: () => setPending(null),
    });
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <DatabaseZap className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Cache</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleClear(undefined, "All")}
            disabled={clearCache.isPending}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear all cache
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          SnapSchool caches expensive dashboard and storefront data for a short time to reduce
          database load. If changes aren&apos;t showing up, clear the relevant cache below.
        </p>
        <Separator />
        {isLoading ? (
          <p className="text-xs text-muted-foreground">Loading cache namespaces…</p>
        ) : (
          <div className="space-y-2">
            {(namespaces ?? []).map((ns) => (
              <div key={ns.tag} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{ns.label}</p>
                  <p className="text-xs text-muted-foreground">{ns.description}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleClear(ns.tag, ns.label)}
                  disabled={clearCache.isPending}
                >
                  {clearCache.isPending && pending === ns.tag ? "Clearing…" : "Empty"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CampaignCard() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const { data: emails } = useMarketingEmails();
  const { data: campaigns } = useMarketingCampaigns();
  const sendCampaign = useSendMarketingCampaign();

  const recipientCount = (emails?.stats.total ?? 0) - (emails?.stats.optedOut ?? 0);
  const previewHtml = `${body.replace(/\n/g, "<br/>")}${imageUrl ? `<br/><img src="${imageUrl}" alt="" style="max-width:100%" />` : ""}`;

  function handleSend() {
    if (!subject.trim() || !body.trim()) {
      toast.error("Add a subject and a message before sending.");
      return;
    }
    if (!window.confirm(`Send this campaign to ${recipientCount} subscriber${recipientCount === 1 ? "" : "s"}?`)) return;

    sendCampaign.mutate(
      { subject, body: previewHtml },
      {
        onSuccess: (result) => {
          toast.success(
            result.emailsSent
              ? `Campaign sent to ${result.recipientCount} subscribers.`
              : `Campaign saved (${result.recipientCount} recipients) — email sending isn't configured yet.`,
          );
          setSubject("");
          setBody("");
          setImageUrl("");
          setShowPreview(false);
        },
        onError: () => toast.error("Failed to send campaign."),
      },
    );
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Marketing campaign</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Compose a message and send it to every parent who hasn&apos;t opted out of marketing emails
          ({recipientCount} subscriber{recipientCount === 1 ? "" : "s"}).
        </p>
        <Separator />

        <div className="space-y-1.5">
          <Label htmlFor="campaign-subject">Subject</Label>
          <Input id="campaign-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What's new at SnapSchool" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="campaign-body">Message</Label>
          <Textarea
            id="campaign-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your campaign letter here…"
            className="min-h-[160px]"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="campaign-image">Image URL (optional)</Label>
          <Input id="campaign-image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" />
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowPreview((v) => !v)}>
            <Eye className="h-3.5 w-3.5" />
            {showPreview ? "Hide preview" : "Preview"}
          </Button>
          <Button size="sm" onClick={handleSend} disabled={sendCampaign.isPending}>
            <Send className="h-3.5 w-3.5" />
            {sendCampaign.isPending ? "Sending…" : "Send to all subscribers"}
          </Button>
        </div>

        {showPreview ? (
          <div className="rounded-lg border border-border/60 p-4">
            <p className="mb-2 text-sm font-semibold">{subject || "(no subject)"}</p>
            {/* eslint-disable-next-line react/no-danger */}
            <div className="text-sm" dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        ) : null}

        {campaigns && campaigns.length > 0 ? (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium">Recent campaigns</p>
              {campaigns.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <Badge variant="secondary">{c.recipientCount} sent</Badge>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default function DashboardSettingsPage() {
  const { user } = useSession();
  const logout = useLogout();
  const locale = useUiStore((s) => s.locale);
  const setLocale = useUiStore((s) => s.setLocale);

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account, appearance, and language preferences." />

      <Card>
        <CardContent className="space-y-4 p-5">
          <h2 className="text-sm font-semibold">Account</h2>
          {user ? (
            <div className="flex flex-wrap items-center gap-4">
              <Avatar src={user.avatarUrl} alt={user.name} fallback={user.name.slice(0, 2).toUpperCase()} className="h-12 w-12" />
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="truncate text-sm text-muted-foreground">{user.email}</p>
              </div>
              <Badge variant="neutral">{ROLE_LABELS[user.role]}</Badge>
            </div>
          ) : null}
          <Separator />
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Sign out</p>
              <p className="text-xs text-muted-foreground">End your current session on this device.</p>
            </div>
            <Button variant="outline" onClick={() => logout()}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5">
          <h2 className="text-sm font-semibold">Appearance</h2>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-muted-foreground">Choose how SnapSchool looks on this device.</p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5">
          <h2 className="text-sm font-semibold">Language</h2>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Display language</p>
              <p className="text-xs text-muted-foreground">Applies across the dashboard and storefront.</p>
            </div>
            <div className="w-44">
              <Label htmlFor="settings-locale" className="sr-only">
                Display language
              </Label>
              <Select
                id="settings-locale"
                value={locale}
                onChange={(e) => {
                  if (isSupportedLocale(e.target.value)) setLocale(e.target.value);
                }}
              >
                {SUPPORTED_LOCALES.map((value) => (
                  <option key={value} value={value}>
                    {LOCALE_LABELS[value]}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {user?.role === "platform_admin" ? <CampaignCard /> : null}
      {user?.role === "platform_admin" ? <CacheCard /> : null}
    </div>
  );
}
