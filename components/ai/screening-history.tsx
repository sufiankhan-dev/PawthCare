import { ChevronDown, ScanLine } from "lucide-react";

import { AnalysisView } from "@/components/ai/analysis-view";
import { Badge } from "@/components/ui/badge";
import { formatDate, riskTone, URGENCY_META } from "@/lib/format";
import type { AiAnalysis } from "@/lib/types";

/** Compact, expandable list of saved AI screenings. */
export function ScreeningHistory({
  analyses,
  limit = 5,
}: {
  analyses: AiAnalysis[];
  limit?: number;
}) {
  return (
    <ul className="flex flex-col gap-2">
      {analyses.slice(0, limit).map((a) => {
        const tone = riskTone(a.riskScore);
        const urgency = URGENCY_META[a.urgency] ?? URGENCY_META.routine;
        return (
          <li key={a.id}>
            <details className="group rounded-xl bg-muted/50 transition-colors open:bg-muted/30 open:ring-1 open:ring-border/70">
              <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl p-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
                {a.thumbUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.thumbUrl}
                    alt=""
                    className="size-12 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-card text-muted-foreground">
                    <ScanLine className="size-4" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium">
                    {a.summary || "Photo screening"}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(a.createdAt)}
                    </span>
                    <Badge variant={tone.badge}>{a.riskScore}/100</Badge>
                    <Badge variant={urgency.badge} className="hidden sm:inline-flex">
                      {urgency.label}
                    </Badge>
                  </div>
                </div>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-3 pb-4 pt-1 sm:px-4">
                <AnalysisView
                  summary={a.summary}
                  riskScore={a.riskScore}
                  urgency={a.urgency}
                  findings={a.findings}
                  recommendations={a.recommendations}
                />
              </div>
            </details>
          </li>
        );
      })}
    </ul>
  );
}
