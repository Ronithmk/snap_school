import { Construction } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";

interface SchoolFeatureSoonProps {
  feature: string;
  description?: string;
}

export function SchoolFeatureSoon({ feature, description }: SchoolFeatureSoonProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={feature}
        description={description ?? `Manage ${feature.toLowerCase()} for this school.`}
      />
      <div className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border">
        <Construction className="h-10 w-10 text-muted-foreground/30" />
        <div className="text-center">
          <p className="font-medium text-muted-foreground">Coming soon</p>
          <p className="mt-1 text-sm text-muted-foreground/60">This feature is under development.</p>
        </div>
      </div>
    </div>
  );
}
