"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  Check, ExternalLink, Globe, ImageIcon, Layers, Loader2, Palette,
  ToggleLeft, ToggleRight,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WatermarkOverlay } from "@/components/storefront/watermark-overlay";
import { useSchool, useUpdateSchool } from "@/hooks/use-tenant";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import type { WatermarkSettings } from "@/types/tenant";

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

  const [logoUrl, setLogoUrl] = useState<string | undefined>();
  const [bannerUrl, setBannerUrl] = useState<string | undefined>();
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [customColor, setCustomColor] = useState("");
  const [footerText, setFooterText] = useState("");
  const [showPoweredBy, setShowPoweredBy] = useState(true);
  const [customDomain, setCustomDomain] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [saved, setSaved] = useState(false);

  // Watermark
  const [wmEnabled, setWmEnabled] = useState(false);
  const [wmLineCount, setWmLineCount] = useState<1 | 2 | 3>(1);
  const [wmLines, setWmLines] = useState<string[]>(["", "", ""]);
  const [wmOpacity, setWmOpacity] = useState(0.20);
  const [wmPattern, setWmPattern] = useState<WatermarkSettings["pattern"]>("diagonal");
  const [wmColor, setWmColor] = useState<WatermarkSettings["color"]>("white");

  useEffect(() => {
    if (school) {
      setLogoUrl(school.logoUrl ?? undefined);
      setBannerUrl(school.bannerUrl ?? undefined);
      setPrimaryColor(school.settings?.primaryColor ?? "#6366f1");
      setFooterText(school.settings?.footerText ?? "");
      setShowPoweredBy(school.settings?.showPoweredBy ?? true);
      setCustomDomain(school.settings?.customDomain ?? "");
      setWhatsappNumber(school.settings?.whatsappNumber ?? "");
      setInstagramUrl(school.settings?.instagramUrl ?? "");
      setFacebookUrl(school.settings?.facebookUrl ?? "");
      const wm = school.settings?.watermark;
      if (wm) {
        setWmEnabled(wm.enabled);
        const count = Math.min(3, Math.max(1, wm.lines.length || 1)) as 1 | 2 | 3;
        setWmLineCount(count);
        const padded = [...wm.lines, "", "", ""].slice(0, 3);
        setWmLines(padded);
        setWmOpacity(wm.opacity ?? 0.20);
        setWmPattern(wm.pattern ?? "diagonal");
        setWmColor(wm.color ?? "white");
      }
    }
  }, [school]);

  const handleSave = async () => {
    if (!school) return;
    const effectiveColor = customColor || primaryColor;
    await updateSchool.mutateAsync({
      id: school.id,
      input: {
        logoUrl,
        bannerUrl,
        settings: {
          ...school.settings,
          primaryColor: effectiveColor,
          footerText: footerText || undefined,
          showPoweredBy,
          customDomain: customDomain || undefined,
          whatsappNumber: whatsappNumber || undefined,
          instagramUrl: instagramUrl || undefined,
          facebookUrl: facebookUrl || undefined,
          watermark: {
            enabled: wmEnabled,
            lines: wmLines.slice(0, wmLineCount).filter(Boolean),
            opacity: wmOpacity,
            pattern: wmPattern,
            color: wmColor,
          },
        },
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Computed watermark for live preview
  const previewWatermark: WatermarkSettings = {
    enabled: wmEnabled,
    lines: wmLines.slice(0, wmLineCount).filter(Boolean),
    opacity: wmOpacity,
    pattern: wmPattern,
    color: wmColor,
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
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ImageIcon className="h-4 w-4" />
                Logos & Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo */}
              <div className="space-y-2">
                <Label>School logo</Label>
                <ImageUpload
                  value={logoUrl}
                  onChange={setLogoUrl}
                  accept="any"
                  label="Upload logo"
                  hint="PNG, SVG, PDF · max 10 MB · recommended 200×60 px"
                  aspectRatio="3/1"
                />
              </div>

              {/* Hero banner */}
              <div className="space-y-2">
                <Label>Hero banner</Label>
                <ImageUpload
                  value={bannerUrl}
                  onChange={setBannerUrl}
                  accept="image"
                  label="Upload hero banner"
                  hint="JPG, PNG · max 10 MB · recommended 1400×400 px"
                  aspectRatio="16/5"
                />
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

          {/* Watermark */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Layers className="h-4 w-4" />
                Photo Watermark
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Enable watermark on previews</p>
                  <p className="text-xs text-muted-foreground">Shown on storefront previews only — purchased HD files are never watermarked</p>
                </div>
                <button type="button" onClick={() => setWmEnabled((v) => !v)}>
                  {wmEnabled
                    ? <ToggleRight className="h-7 w-7 text-primary" />
                    : <ToggleLeft className="h-7 w-7 text-muted-foreground" />}
                </button>
              </div>

              {wmEnabled && (
                <>
                  {/* Number of lines */}
                  <div className="space-y-1.5">
                    <Label>Number of text lines</Label>
                    <div className="flex gap-2">
                      {([1, 2, 3] as const).map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setWmLineCount(n)}
                          className={cn(
                            "flex-1 rounded-md border py-2 text-sm font-medium transition-colors",
                            wmLineCount === n
                              ? "bg-primary text-primary-foreground border-primary"
                              : "hover:bg-accent",
                          )}
                        >
                          {n} line{n > 1 ? "s" : ""}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Line text inputs */}
                  <div className="space-y-2">
                    <Label>Watermark text</Label>
                    {Array.from({ length: wmLineCount }).map((_, i) => (
                      <Input
                        key={i}
                        value={wmLines[i] ?? ""}
                        onChange={(e) => {
                          const next = [...wmLines];
                          next[i] = e.target.value;
                          setWmLines(next);
                        }}
                        placeholder={
                          i === 0
                            ? school?.name ?? "School Name"
                            : i === 1
                            ? "DO NOT REPRODUCE"
                            : `© ${new Date().getFullYear()}`
                        }
                      />
                    ))}
                  </div>

                  {/* Layout pattern */}
                  <div className="space-y-1.5">
                    <Label>Layout</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { value: "diagonal", label: "Diagonal" },
                          { value: "tiled", label: "Tiled" },
                          { value: "center", label: "Center" },
                        ] as const
                      ).map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setWmPattern(value)}
                          className={cn(
                            "rounded-md border py-2 text-xs font-medium transition-colors",
                            wmPattern === value
                              ? "bg-primary text-primary-foreground border-primary"
                              : "hover:bg-accent",
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color */}
                  <div className="space-y-1.5">
                    <Label>Text colour</Label>
                    <div className="flex gap-2">
                      {(
                        [
                          { value: "white", label: "White", dot: "bg-white border border-neutral-300" },
                          { value: "black", label: "Black", dot: "bg-neutral-900" },
                        ] as const
                      ).map(({ value, label, dot }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setWmColor(value)}
                          className={cn(
                            "flex flex-1 items-center gap-2 rounded-md border px-3 py-2.5 text-sm transition-colors",
                            wmColor === value ? "ring-2 ring-primary border-primary" : "hover:bg-accent",
                          )}
                        >
                          <span className={cn("h-4 w-4 rounded-full", dot)} />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Opacity slider */}
                  <div className="space-y-1.5">
                    <Label>Opacity — {Math.round(wmOpacity * 100)}%</Label>
                    <input
                      type="range"
                      min={5}
                      max={40}
                      step={1}
                      value={Math.round(wmOpacity * 100)}
                      onChange={(e) => setWmOpacity(parseInt(e.target.value) / 100)}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Subtle (5%)</span>
                      <span>Bold (40%)</span>
                    </div>
                  </div>
                </>
              )}
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
                <img src={logoUrl} alt="logo" className="h-7 max-w-[80px] object-contain" />
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
                <img src={bannerUrl} alt="banner" className="absolute inset-0 h-full w-full object-cover" />
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

          {/* Watermark preview */}
          {wmEnabled && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Watermark preview</p>
              <div className="relative overflow-hidden rounded-xl border shadow-sm" style={{ aspectRatio: "4/3" }}>
                {/* Simulated photo background */}
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-300 via-neutral-400 to-neutral-600" />
                {/* Fake image content lines */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-20">
                  {[80, 60, 70].map((w, i) => (
                    <div key={i} className="h-3 rounded-full bg-white" style={{ width: `${w}%` }} />
                  ))}
                </div>
                <WatermarkOverlay watermark={previewWatermark} />
              </div>
              <p className="text-[11px] text-muted-foreground">
                This is how the watermark will appear on photo previews in the storefront.
              </p>
            </div>
          )}

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
