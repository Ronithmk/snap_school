"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { routes } from "@/config/routes";
import type { School } from "@/types";

interface SchoolFinderProps {
  schools: School[];
}

/** Type-ahead search that links straight to a tenant's storefront — the entry point for parents. */
export function SchoolFinder({ schools }: SchoolFinderProps) {
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return schools.filter((s) => s.name.toLowerCase().includes(needle) || s.slug.includes(needle)).slice(0, 5);
  }, [query, schools]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for your school by name…"
          className="h-12 rounded-full pl-10 text-base shadow-sm"
          aria-label="Search for your school"
        />
      </div>
      {matches.length > 0 && (
        <ul className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
          {matches.map((school) => (
            <li key={school.id}>
              <Link
                href={routes.storefront.school(school.slug)}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-accent"
              >
                <span className="font-medium">{school.name}</span>
                <span className="text-muted-foreground">/{school.slug}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
