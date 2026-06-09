"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  CalendarDays, Loader2, Pencil, Plus, Trash2, Zap,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  usePricingRules, useCreatePricingRule,
  useUpdatePricingRule, useDeletePricingRule,
} from "@/hooks/use-content";
import { useSchool } from "@/hooks/use-tenant";
import { useSchoolClasses, useSchoolAlbums } from "@/hooks/use-albums";
import { routes } from "@/config/routes";
import { formatCurrency } from "@/config/currency";
import type { CreatePricingRuleInput, PricingRule, PricingRuleScope, PricingRuleType } from "@/types";

interface Props { params: Promise<{ schoolId: string }> }

// ── helpers ───────────────────────────────────────────────────────

const TYPE_LABELS: Record<PricingRuleType, string> = {
  percent_off:   "% Off",
  flat_off:      "Flat discount",
  free_shipping: "Free shipping",
};

const SCOPE_LABELS: Record<PricingRuleScope, string> = {
  all:   "All orders",
  album: "Specific album",
  class: "Specific class",
};

function ruleValueLabel(rule: PricingRule, currency: string) {
  if (rule.type === "free_shipping") return "Free shipping";
  if (rule.type === "percent_off") return `${rule.value}% off`;
  return `${formatCurrency(rule.value, currency)} off`;
}

function isExpired(rule: PricingRule) {
  return !!rule.endsAt && new Date(rule.endsAt) < new Date();
}

function isUpcoming(rule: PricingRule) {
  return !!rule.startsAt && new Date(rule.startsAt) > new Date();
}

// ── Rule card ─────────────────────────────────────────────────────

function RuleCard({
  rule, currency, onEdit, onDelete, onToggle,
  isDeleting, isToggling,
}: {
  rule: PricingRule;
  currency: string;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  isDeleting: boolean;
  isToggling: boolean;
}) {
  return (
    <Card className={!rule.enabled ? "opacity-60" : ""}>
      <CardContent className="flex items-start gap-4 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Zap className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-sm">{rule.label}</span>
            <Badge variant="secondary" className="text-xs">{TYPE_LABELS[rule.type]}</Badge>
            <Badge variant="outline" className="text-xs">{SCOPE_LABELS[rule.scope]}{rule.scopeName ? `: ${rule.scopeName}` : ""}</Badge>
            {isExpired(rule) && <Badge variant="negative" className="text-xs">Expired</Badge>}
            {isUpcoming(rule) && <Badge variant="warning" className="text-xs">Upcoming</Badge>}
            {!rule.enabled && <Badge variant="neutral" className="text-xs">Disabled</Badge>}
          </div>

          <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{ruleValueLabel(rule, currency)}</span>
            {rule.minOrderAmount != null && <span>Min. order {formatCurrency(rule.minOrderAmount, currency)}</span>}
            {(rule.startsAt || rule.endsAt) && (
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {rule.startsAt ? new Date(rule.startsAt).toLocaleDateString(undefined, { dateStyle: "medium" }) : "Always"}
                {" – "}
                {rule.endsAt ? new Date(rule.endsAt).toLocaleDateString(undefined, { dateStyle: "medium" }) : "No end"}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onToggle}
            disabled={isToggling}
            title={rule.enabled ? "Disable" : "Enable"}
            className={`relative inline-flex h-5 w-9 cursor-pointer rounded-full border-2 border-transparent transition-colors ${rule.enabled ? "bg-primary" : "bg-muted"}`}
          >
            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${rule.enabled ? "translate-x-4" : "translate-x-0"}`} />
          </button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}><Pencil className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={onDelete} disabled={isDeleting}>
            {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Form sheet ────────────────────────────────────────────────────

const EMPTY_FORM: CreatePricingRuleInput = {
  label: "", type: "percent_off", value: 10,
  scope: "all", enabled: true,
};

function RuleFormSheet({
  schoolId, open, onOpenChange, editing,
}: {
  schoolId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: PricingRule | null;
}) {
  const create = useCreatePricingRule(schoolId);
  const update = useUpdatePricingRule(schoolId);
  const { data: classes } = useSchoolClasses(schoolId);
  const { data: albumsPage } = useSchoolAlbums(schoolId);
  const albums = albumsPage?.data;

  const [form, setForm] = useState<CreatePricingRuleInput>(editing ? {
    label: editing.label,
    type: editing.type,
    value: editing.value,
    scope: editing.scope,
    scopeId: editing.scopeId,
    scopeName: editing.scopeName,
    minOrderAmount: editing.minOrderAmount,
    startsAt: editing.startsAt,
    endsAt: editing.endsAt,
    enabled: editing.enabled,
  } : EMPTY_FORM);

  const set = <K extends keyof CreatePricingRuleInput>(k: K, v: CreatePricingRuleInput[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleScopeItem = (id: string, name: string) => setForm((p) => ({ ...p, scopeId: id, scopeName: name }));

  const handleSubmit = async () => {
    if (editing) {
      await update.mutateAsync({ id: editing.id, input: form });
    } else {
      await create.mutateAsync(form);
    }
    onOpenChange(false);
  };

  const isPending = create.isPending || update.isPending;

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => { onOpenChange(v); if (!v) setForm(EMPTY_FORM); }}
      title={editing ? "Edit pricing rule" : "Add pricing rule"}
      description="Pricing rules are applied at cart time. Higher discounts win."
    >
      <div className="space-y-4">
        {/* Label */}
        <div className="space-y-1.5">
          <Label htmlFor="rule-label">Rule name</Label>
          <Input id="rule-label" value={form.label} onChange={(e) => set("label", e.target.value)} placeholder="e.g. Early-bird 20% off" />
        </div>

        {/* Type */}
        <div className="space-y-1.5">
          <Label>Discount type</Label>
          <div className="grid grid-cols-3 gap-2">
            {(["percent_off", "flat_off", "free_shipping"] as PricingRuleType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set("type", t)}
                className={`rounded-lg border py-2 text-xs font-medium transition-colors ${form.type === t ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border hover:border-primary/30"}`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Value */}
        {form.type !== "free_shipping" && (
          <div className="space-y-1.5">
            <Label htmlFor="rule-value">{form.type === "percent_off" ? "Percentage off" : "Amount off (currency)"}</Label>
            <Input
              id="rule-value"
              type="number"
              min={0}
              max={form.type === "percent_off" ? 100 : undefined}
              value={form.value}
              onChange={(e) => set("value", Number(e.target.value))}
            />
          </div>
        )}

        {/* Scope */}
        <div className="space-y-1.5">
          <Label>Applies to</Label>
          <div className="grid grid-cols-3 gap-2">
            {(["all", "album", "class"] as PricingRuleScope[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setForm((p) => ({ ...p, scope: s, scopeId: undefined, scopeName: undefined }))}
                className={`rounded-lg border py-2 text-xs font-medium transition-colors ${form.scope === s ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border hover:border-primary/30"}`}
              >
                {SCOPE_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Scope item picker */}
        {form.scope === "class" && classes && (
          <div className="space-y-1.5">
            <Label>Select class</Label>
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={form.scopeId ?? ""}
              onChange={(e) => {
                const c = classes.find((x) => x.id === e.target.value);
                if (c) handleScopeItem(c.id, c.name);
              }}
            >
              <option value="">— choose a class —</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}
        {form.scope === "album" && albums && (
          <div className="space-y-1.5">
            <Label>Select album</Label>
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={form.scopeId ?? ""}
              onChange={(e) => {
                const a = albums.find((x) => x.id === e.target.value);
                if (a) handleScopeItem(a.id, a.title);
              }}
            >
              <option value="">— choose an album —</option>
              {albums.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
          </div>
        )}

        {/* Min order */}
        <div className="space-y-1.5">
          <Label htmlFor="rule-min">Minimum order amount (optional)</Label>
          <Input
            id="rule-min"
            type="number"
            min={0}
            placeholder="0"
            value={form.minOrderAmount ?? ""}
            onChange={(e) => set("minOrderAmount", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        {/* Date range */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Start date (optional)</Label>
            <input type="date" value={form.startsAt?.slice(0, 10) ?? ""} onChange={(e) => set("startsAt", e.target.value ? `${e.target.value}T00:00:00.000Z` : undefined)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </div>
          <div className="space-y-1.5">
            <Label>End date (optional)</Label>
            <input type="date" value={form.endsAt?.slice(0, 10) ?? ""} onChange={(e) => set("endsAt", e.target.value ? `${e.target.value}T23:59:59.000Z` : undefined)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={isPending || !form.label} className="w-full">
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {editing ? "Save changes" : "Add rule"}
        </Button>
      </div>
    </Sheet>
  );
}

// ── Page ──────────────────────────────────────────────────────────

export default function PricingRulesPage({ params }: Props) {
  const { schoolId } = use(params);
  const { data: school } = useSchool(schoolId);
  const { data: rules, isLoading } = usePricingRules(schoolId);
  const deleteRule = useDeletePricingRule(schoolId);
  const updateRule = useUpdatePricingRule(schoolId);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<PricingRule | null>(null);

  const currency = school?.settings?.currencyCode ?? "USD";

  const active = (rules ?? []).filter((r) => r.enabled && !isExpired(r));
  const inactive = (rules ?? []).filter((r) => !r.enabled || isExpired(r));

  const openEdit = (rule: PricingRule) => { setEditing(rule); setSheetOpen(true); };
  const openCreate = () => { setEditing(null); setSheetOpen(true); };

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={routes.dashboard.schools()} className="hover:text-foreground transition-colors">Schools</Link>
        <span>/</span>
        <Link href={routes.dashboard.school(schoolId)} className="hover:text-foreground transition-colors truncate">{school?.name ?? schoolId}</Link>
        <span>/</span>
        <span className="text-foreground">Pricing Rules</span>
      </nav>

      <PageHeader
        title="Dynamic Pricing Rules"
        description="Create discounts, promotions, and free-shipping offers that apply automatically at checkout."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add rule
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : (rules ?? []).length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed py-16 text-center">
          <div className="rounded-full bg-muted p-4"><Zap className="h-8 w-8 text-muted-foreground/40" /></div>
          <div>
            <p className="font-medium">No pricing rules yet</p>
            <p className="text-sm text-muted-foreground mt-1">Add a rule to automatically apply discounts or free shipping to orders.</p>
          </div>
          <Button onClick={openCreate}><Plus className="h-4 w-4" />Add pricing rule</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Active rules ({active.length})</h3>
              {active.map((rule) => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  currency={currency}
                  onEdit={() => openEdit(rule)}
                  onDelete={() => deleteRule.mutate(rule.id)}
                  onToggle={() => updateRule.mutate({ id: rule.id, input: { enabled: !rule.enabled } })}
                  isDeleting={deleteRule.isPending && deleteRule.variables === rule.id}
                  isToggling={updateRule.isPending && updateRule.variables?.id === rule.id}
                />
              ))}
            </div>
          )}
          {inactive.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Inactive / expired ({inactive.length})</h3>
              {inactive.map((rule) => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  currency={currency}
                  onEdit={() => openEdit(rule)}
                  onDelete={() => deleteRule.mutate(rule.id)}
                  onToggle={() => updateRule.mutate({ id: rule.id, input: { enabled: !rule.enabled } })}
                  isDeleting={deleteRule.isPending && deleteRule.variables === rule.id}
                  isToggling={updateRule.isPending && updateRule.variables?.id === rule.id}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <RuleFormSheet
        schoolId={schoolId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editing={editing}
      />
    </div>
  );
}
