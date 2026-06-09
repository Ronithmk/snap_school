"use client";

import Link from "next/link";
import { Camera, Globe, MessageCircle, Share2 } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import { siteConfig } from "@/config/site";
import { routes } from "@/config/routes";
import { useUiStore } from "@/stores/ui.store";
import { SUPPORTED_LOCALES, LOCALE_LABELS, type Locale } from "@/config/i18n";
import type { School } from "@/types";

interface TenantHeaderProps {
  school: School;
}

function LanguageSwitcher() {
  const { locale, setLocale } = useUiStore();
  return (
    <div className="relative group">
      <button
        type="button"
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Switch language"
      >
        <Globe className="h-3.5 w-3.5" />
        <span className="uppercase">{locale}</span>
      </button>
      <div className="absolute right-0 top-full mt-1 hidden min-w-[100px] rounded-lg border bg-popover p-1 shadow-md group-hover:block z-50">
        {SUPPORTED_LOCALES.map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code as Locale)}
            className={`flex w-full items-center rounded-md px-2 py-1.5 text-xs transition-colors ${
              locale === code ? "bg-accent font-medium" : "hover:bg-accent"
            }`}
          >
            {LOCALE_LABELS[code as Locale]}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Persistent chrome for every page under `/[school]` — keeps the tenant's identity visible while staying on-brand. */
export function StorefrontHeader({ school }: TenantHeaderProps) {
  const primaryColor = school.settings?.primaryColor;
  const borderStyle = primaryColor ? { borderBottomColor: `${primaryColor}44` } : undefined;

  return (
    <>
      {/* Hero banner image (if configured on school) */}
      {school.bannerUrl && (
        <div className="relative h-40 overflow-hidden sm:h-56">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={school.bannerUrl} alt={school.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      )}

      <header
        className="sticky top-0 z-30 border-b border-border/60 glass-navbar"
        style={borderStyle}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link href={routes.storefront.school(school.slug)} className="flex min-w-0 items-center gap-2.5">
            {school.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={school.logoUrl} alt={school.name} className="h-9 max-w-[140px] shrink-0 object-contain" />
            ) : (
              <Avatar src={undefined} alt={school.name} fallback={school.name.slice(0, 2).toUpperCase()} className="h-9 w-9 shrink-0" />
            )}
            {!school.logoUrl && (
              <span className="truncate font-semibold tracking-tight" style={primaryColor ? { color: primaryColor } : undefined}>
                {school.name}
              </span>
            )}
          </Link>

          <div className="ml-auto flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            {(!school.settings?.showPoweredBy === false) && (
              <Link
                href={routes.home()}
                className="hidden items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
              >
                <Camera className="h-3.5 w-3.5" />
                {siteConfig.name}
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

export function StorefrontFooter({ school }: TenantHeaderProps) {
  const settings = school.settings;
  const showPoweredBy = settings?.showPoweredBy !== false;
  const footerText = settings?.footerText
    ?? `© ${new Date().getFullYear()} ${school.name}. All photos are protected.`;

  const hasSocial = settings?.whatsappNumber || settings?.instagramUrl || settings?.facebookUrl;

  return (
    <footer className="border-t border-border/50 bg-foreground/[0.015] backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">{footerText}</p>

          <div className="flex items-center gap-3">
            {hasSocial && (
              <>
                {settings?.whatsappNumber && (
                  <Link
                    href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground transition-colors hover:text-[#25D366]"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Link>
                )}
                {settings?.instagramUrl && (
                  <Link
                    href={settings.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground transition-colors hover:text-pink-500"
                    aria-label="Instagram"
                  >
                    <Share2 className="h-4 w-4" />
                  </Link>
                )}
                {settings?.facebookUrl && (
                  <Link
                    href={settings.facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground transition-colors hover:text-blue-600"
                    aria-label="Facebook"
                  >
                    <Share2 className="h-4 w-4" />
                  </Link>
                )}
                <div className="h-4 w-px bg-border" />
              </>
            )}
            {showPoweredBy && (
              <Link href={routes.home()} className="text-xs font-medium text-foreground transition-colors hover:text-primary">
                Powered by {siteConfig.name}
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
