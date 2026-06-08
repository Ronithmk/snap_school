"use client";

import { LogOut } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useLogout, useSession } from "@/hooks/use-auth";
import { useUiStore } from "@/stores/ui.store";
import { ROLE_LABELS } from "@/config/constants";
import { LOCALE_LABELS, SUPPORTED_LOCALES, isSupportedLocale } from "@/config/i18n";

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
    </div>
  );
}
