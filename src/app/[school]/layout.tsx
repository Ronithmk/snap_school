import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StorefrontFooter, StorefrontHeader } from "@/components/storefront/storefront-chrome";
import { ScreenshotGuard } from "@/components/storefront/screenshot-guard";
import { db } from "@/lib/db";
import { formatDbSchool } from "@/lib/format-school";

interface TenantLayoutProps {
  children: React.ReactNode;
  params: Promise<{ school: string }>;
}

async function getSchool(slug: string) {
  const row = await db.school.findUnique({ where: { slug } });
  return row ? formatDbSchool(row) : null;
}

export async function generateMetadata({ params }: { params: Promise<{ school: string }> }): Promise<Metadata> {
  const { school: slug } = await params;
  const school = await getSchool(slug);
  if (!school) return {};

  return {
    title: { template: `%s · ${school.name}`, default: school.name },
    description: school.description ?? `Browse and order photos from ${school.name} on SnapSchool.`,
  };
}

/** Resolves the tenant by its slug for every page under `/[school]` and renders the shared storefront chrome. */
export default async function TenantLayout({ children, params }: TenantLayoutProps) {
  const { school: slug } = await params;
  const school = await getSchool(slug);

  if (!school || school.status !== "active") {
    notFound();
  }

  return (
    <div className="flex min-h-svh flex-col">
      <ScreenshotGuard />
      <StorefrontHeader school={school} />
      <main className="flex-1">{children}</main>
      <StorefrontFooter school={school} />
    </div>
  );
}
