import { Hammer } from "lucide-react";
import { Card } from "./card";
import { PageHeader } from "./page-header";

/** Placeholder for pages that are built in a later stage. */
export function ComingSoon({ title, stage, features }: { title: string; stage: number; features: string[] }) {
  return (
    <>
      <PageHeader title={title} />
      <Card>
        <div className="flex items-start gap-3">
          <Hammer className="mt-0.5 size-5 text-coffee-600" aria-hidden />
          <div>
            <p className="font-medium">Coming in stage {stage}</p>
            <p className="mt-1 text-sm text-stone-500">You have access to this page. It will include:</p>
            <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-stone-600">
              {features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </>
  );
}
