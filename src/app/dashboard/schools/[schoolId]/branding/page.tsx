"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  Check, ExternalLink, Globe, ImageIcon, Loader2, Palette,
  ToggleLeft, ToggleRight,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSchool, useUpdateSchool } from "@/hooks/use-tenant";
import { routes } from "@/config/routes";

interface Props { params: Promise<{ schoolId: string }> }

const PRESET_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#06b6d4",
  "#0ea5e9", "#3b82f6", "#64748b", "#1e293b",
];

function ColorSwatch({ color, selected, onClick }: { color: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={color}
      style={{ backgroundColor: color }}
      className={`relative h-8 w-8 rounded-full transition-transform hover:scale-110 ${selected ? "ring-2 ring-offset-2 ring-foreground scale-110" : ""}`}
    >
      {selected && <Check className="absolute inset-0 m-auto h-3.5 w-3.5 text-white drop-shadow" />}
    </button>
  );
}

export default function BrandingPage({ params }: Props) {
  const { schoolId } = use(params);
  const { data: school } = useSchool(schoolId);
  const updateSchool = useUpdateSchool();

  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [customColor, setCustomColor] = useState("");
  const [footerText, setFooterText] = useState("");
  const [showPoweredBy, setShowPoweredBy] = useState(true);
  const [customDomain, setCustomDomain] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (school) {
      setLogoUrl(school.logoUrl ?? "");
      setBannerUrl(school.bannerUrl ?? "");
      setPrimaryColor(school.settings?.primaryColor ?? "#6366f1");
      setFooterText(school.settings?.footerText ?? "");
      setShowPoweredBy(school.settings?.showPoweredBy ?? true);
      setCustomDomain(school.settings?.customDomain ?? "");
      setWhatsappNumber(school.settings?.whatsappNumber ?? "");
      setInstagramUrl(school.settings?.instagramUrl ?? "");
      setFacebookUrl(school.settings?.facebookUrl ?? "");
    }
  }, [school]);

  const handleSave = async () => {
    if (!school) return;
    const effectiveColor = customColor || primaryColor;
    await updateSchool.mutateAsync({
      id: school.id,
      input: {
        logoUrl: logoUrl || undefined,
        bannerUrl: bannerUrl || undefined,
        settings: {
          ...school.settings,
          primaryColor: effectiveColor,
          footerText: footerText || undefined,
          showPoweredBy,
          customDomain: customDomain || undefined,
          whatsappNumber: whatsappNumber || undefined,
          instagramUrl: instagramUrl || undefined,
          facebookUrl: facebookUrl || undefined,
        },
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const effectiveColor = customColor || primaryColor;

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={routes.dashboard.schools()} className="hover:text-foreground transition-colors">Schools</Link>
        <span>/</span>
        <Link href={routes.dashboard.school(schoolId)} className="hover:text-foreground transition-colors truncate">{school?.name ?? schoolId}</Link>
        <span>/</span>
        <span className="text-foreground">Branding</span>
      </nav>

      <PageHeader
        title="White-Label Branding"
        description="Customise your school's public storefront — logo, colours, footer, and social links."
        actions={
          <div className="flex gap-2">
            <Link
              href={school?.slug ? routes.storefront.school(school.slug) : "#"}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              <ExternalLink className="h-4 w-4" />
              Preview storefront
            </Link>
            <Button onClick={handleSave} disabled={updateSchool.isPending}>
              {updateSchool.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
              {saved ? "Saved!" : "Save changes"}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Left column: settings ─── */}
        <div className="col-span-2 space-y-5">

          {/* Identity */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ImageIcon className="h-4 w-4" />Logos & Images</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="logo-url">Logo URL</Label>
                <Input id="logo-url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://cdn.example.com/logo.png" />
                <p className="text-xs text-muted-foreground">Recommended: 200×60 px, transparent PNG</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="banner-url">Hero banner URL</Label>
                <Input id="banner-url" value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} placeholder="https://cdn.example.com/banner.jpg" />
                <p className="text-xs text-muted-foreground">Recommended: 1400×400 px</p>
              </div>
            </CardContent>
          </Card>

          {/* Colours */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Palette className="h-4 w-4" />Brand Colour</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <ColorSwatch key={c} color={c} selected={primaryColor === c && !customColor} onClick={() => { setPrimaryColor(c); setCustomColor(""); }} />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full border" style={{ backgroundColor: effectiveColor }} />
                <div className="flex-1 space-y-1">
                  <Label htmlFor="custom-color">Custom hex color</Label>
                  <Input
                    id="custom-color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    placeholder="#1a2b3c"
                    className="font-mono"
                  />
                </div>
                <input type="color" value={effectiveColor}
                  onChange={(e) => { setCustomColor(e.target.value); setPrimaryColor(""); }}
                  className="h-9 w-9 cursor-pointer rounded-md border border-input" />
              </div>
            </CardContent>
          </Card>

          {/* Footer & branding */}
          <Card>
            <CardHeader><CardTitle className="text-base">Footer & Attribution</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="footer-text">Footer text</Label>
                <Input id="footer-text" value={footerText} onChange={(e) => setFooterText(e.target.value)} placeholder="© 2025 Riverside Photography. All rights reserved." />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Show "Powered by SnapSchool"</p>
                  <p className="text-xs text-muted-foreground">Displays a small attribution badge in the footer</p>
                </div>
                <button type="button" onClick={() => setShowPoweredBy((v) => !v)}>
                  {showPoweredBy
                    ? <ToggleRight className="h-7 w-7 text-primary" />
                    : <ToggleLeft className="h-7 w-7 text-muted-foreground" />}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Custom domain */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Globe className="h-4 w-4" />Custom Domain</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="custom-domain">Domain / subdomain</Label>
                <Input id="custom-domain" value={customDomain} onChange={(e) => setCustomDomain(e.target.value)} placeholder="photos.yourschool.edu" />
              </div>
              <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">DNS setup</p>
                <p>Add a CNAME record pointing <strong>{customDomain || "your-domain.com"}</strong> → <strong>snapschool.app</strong></p>
                <p>Changes can take up to 48 hours to propagate.</p>
              </div>
            </CardContent>
          </Card>

          {/* Social */}
          <Card>
            <CardHeader><CardTitle className="text-base">Social Links</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="whatsapp">WhatsApp number</Label>
                <Input id="whatsapp" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="+1 555 123 4567" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="instagram">Instagram URL</Label>
                <Input id="instagram" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/yourschool" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="facebook">Facebook URL</Label>
                <Input id="facebook" value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} placeholder="https://facebook.com/yourschool" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Right column: live preview ─── */}
        <div className="space-y-4">
          <p className="text-sm font-medium text-muted-foreground">Storefront preview</p>
          <div className="overflow-hidden rounded-xl border shadow-sm">
            {/* Mock browser chrome */}
            <div className="flex items-center gap-1.5 bg-muted/40 px-3 py-2 border-b">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <span className="ml-2 flex-1 rounded bg-background px-2 py-0.5 text-xs text-muted-foreground truncate font-mono">
                {customDomain || `snapschool.app/${school?.slug ?? "school"}`}
              </span>
            </div>

            {/* Nav bar */}
            <div className="flex items-center gap-3 px-4 py-2.5 border-b bg-background" style={{ borderBottomColor: effectiveColor + "33" }}>
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="logo" className="h-7 object-contain" onError={() => {}} />
              ) : (
                <div className="h-7 w-16 rounded bg-muted" />
              )}
              <div className="flex gap-3 ml-auto">
                {["Albums", "Gallery", "Order"].map((n) => (
                  <span key={n} className="text-xs font-medium" style={{ color: effectiveColor }}>{n}</span>
                ))}
              </div>
            </div>

            {/* Banner */}
            <div
              className="relative flex h-24 items-center justify-center overflow-hidden"
              style={{ backgroundColor: effectiveColor + "22" }}
            >
              {bannerUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={bannerUrl} alt="banner" className="absolute inset-0 h-full w-full object-cover" onError={() => {}} />
              ) : (
                <div className="flex flex-col items-center gap-1 text-center">
                  <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">Hero banner will appear here</p>
                </div>
              )}
            </div>

            {/* Body area */}
            <div className="bg-background px-4 pb-4 pt-3 space-y-2">
              <div className="h-3 w-2/3 rounded bg-muted" />
              <div className="h-2.5 w-full rounded bg-muted/60" />
              <div className="h-2.5 w-4/5 rounded bg-muted/60" />
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="aspect-video rounded-md" style={{ backgroundColor: effectiveColor + "33" }} />
                    <div className="h-2 w-3/4 rounded bg-muted" />
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t bg-muted/30 px-4 py-2.5 text-center text-xs text-muted-foreground" style={{ borderColor: effectiveColor + "22" }}>
              {footerText || `© ${new Date().getFullYear()} ${school?.name ?? "Your School"}`}
              {showPoweredBy && <span className="ml-1 opacity-50">· Powered by SnapSchool</span>}
            </div>
          </div>

          {saved && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2.5 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
              <Check className="h-4 w-4" />
              Branding saved successfully
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
