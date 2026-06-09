"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Tag, Trash2, X } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useLabProducts } from "@/hooks/use-lab";
import { useSchool } from "@/hooks/use-tenant";
import { routes } from "@/config/routes";

interface Props { params: Promise<{ schoolId: string }> }

export default function SchoolTagsPage({ params }: Props) {
  const { schoolId } = use(params);
  const { data: school } = useSchool(schoolId);
  const { data: products, isLoading } = useLabProducts(schoolId);
  const [newTag, setNewTag] = useState("");
  const [localTags, setLocalTags] = useState<string[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Collect existing tags from products
  const productTags = useMemo(() => {
    if (!products?.data) return new Map<string, number>();
    const map = new Map<string, number>();
    for (const p of products.data) {
      for (const t of p.tags) {
        map.set(t, (map.get(t) ?? 0) + 1);
      }
    }
    return map;
  }, [products]);

  // Combine product tags + locally created tags
  const allTags = useMemo(() => {
    const tags = new Map<string, number>(productTags);
    for (const t of localTags) {
      if (!tags.has(t)) tags.set(t, 0);
    }
    return [...tags.entries()].sort((a, b) => b[1] - a[1]);
  }, [productTags, localTags]);

  const filteredProducts = useMemo(() => {
    if (!activeTag || !products?.data) return products?.data ?? [];
    return products.data.filter((p) => p.tags.includes(activeTag));
  }, [activeTag, products]);

  const addTag = () => {
    const trimmed = newTag.trim();
    if (!trimmed || allTags.some(([t]) => t === trimmed)) return;
    setLocalTags((prev) => [...prev, trimmed]);
    setNewTag("");
  };

  const removeLocalTag = (tag: string) => {
    setLocalTags((prev) => prev.filter((t) => t !== tag));
    if (activeTag === tag) setActiveTag(null);
  };

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={routes.dashboard.schools()} className="hover:text-foreground transition-colors">Schools</Link>
        <span>/</span>
        <Link href={routes.dashboard.school(schoolId)} className="hover:text-foreground transition-colors truncate">{school?.name ?? schoolId}</Link>
        <span>/</span>
        <span className="text-foreground">Tags</span>
      </nav>

      <PageHeader title="Tags" description="View and manage tags used on products in this school." />

      {/* Tag creation */}
      <div className="flex gap-2">
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") addTag(); }}
          placeholder="New tag name…"
          className="sm:w-64"
        />
        <Button onClick={addTag} disabled={!newTag.trim()}>
          <Plus className="h-4 w-4" />
          Add tag
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-7 w-20 rounded-full" />)}
        </div>
      ) : allTags.length === 0 ? (
        <EmptyState icon={Tag} title="No tags yet" description="Add a tag above or assign tags in the Product Library." />
      ) : (
        <div className="space-y-4">
          {/* Tag cloud */}
          <div className="flex flex-wrap gap-2">
            {allTags.map(([tag, count]) => {
              const isLocal = !productTags.has(tag);
              const isActive = activeTag === tag;
              return (
                <div key={tag} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveTag(isActive ? null : tag)}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      isActive
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-foreground hover:border-primary/40"
                    }`}
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                    {count > 0 && (
                      <span className="ml-0.5 rounded-full bg-muted px-1 tabular-nums">{count}</span>
                    )}
                  </button>
                  {isLocal && (
                    <button type="button" onClick={() => removeLocalTag(tag)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Filtered products */}
          {activeTag && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  Products tagged &ldquo;{activeTag}&rdquo; ({filteredProducts.length})
                </p>
                <Button variant="ghost" size="sm" onClick={() => setActiveTag(null)}>
                  <X className="h-4 w-4" />
                  Clear filter
                </Button>
              </div>
              {filteredProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No products use this tag.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {filteredProducts.map((p) => (
                    <Badge key={p.id} variant="secondary" className="text-xs">{p.name}</Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
