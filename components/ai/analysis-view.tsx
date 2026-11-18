import { AlertTriangle, CheckCircle2, Circle, Info } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Confidence } from "@/lib/ai/schemas";
import { riskTone, URGENCY_META } from "@/lib/format";
import type { AiFinding } from "@/lib/types";
import { cn } from "@/lib/utils";

const SEVERITY = {
  low: {
    icon: CheckCircle2,
    label: "Low",
    className: "text-emerald-600 dark:text-emerald-400",
    row: "bg-emerald-500/[0.06]",
  },
  moderate: {
    icon: Info,
    label: "Moderate",
    className: "text-amber-600 dark:text-amber-400",
    row: "bg-amber-500/[0.07]",
  },
  high: {
    icon: AlertTriangle,
    label: "High",
    className: "text-destructive",
    row: "bg-destructive/[0.06]",
  },
} as const;

const CONFIDENCE_LABEL: Record<Confidence, string> = {
  low: "Low confidence",
  medium: "Medium confidence",
  high: "High confidence",
};

export function AnalysisView({
  summary,
  riskScore,
  urgency,
  findings,
  recommendations,
  confidence,
  showDisclaimer = true,
}: {
  summary: string | null;
  riskScore: number;
  urgency: string;
  findings: AiFinding[];
  recommendations: string[];
  confidence?: Confidence;
  showDisclaimer?: boolean;
}) {
  const tone = riskTone(riskScore);
  const urgencyMeta = URGENCY_META[urgency] ?? URGENCY_META.routine;

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl bg-muted/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-semibold tabular-nums tracking-tight">
              {riskScore}
            </span>
            <span className="text-sm text-muted-foreground">/ 100 risk</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant={tone.badge}>{tone.label} risk</Badge>
            <Badge variant={urgencyMeta.badge}>{urgencyMeta.label}</Badge>
            {confidence && (
              <Badge variant="outline" className="text-muted-foreground">
                {CONFIDENCE_LABEL[confidence]}
              </Badge>
            )}
          </div>
        </div>
        <Progress
          value={riskScore}
          className="mt-3 h-1.5 bg-background"
          indicatorClassName={tone.bar}
          aria-label={`Risk score ${riskScore} out of 100`}
        />
      </div>

      {summary && <p className="text-sm leading-relaxed">{summary}</p>}

      <section>
        <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Observations
        </h4>
        {findings.length === 0 ? (
          <p className="rounded-xl bg-emerald-500/[0.06] px-3.5 py-3 text-sm text-muted-foreground">
            No specific concerns were visible in this photo.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {findings.map((f, i) => {
              const meta = SEVERITY[f.severity] ?? SEVERITY.low;
              const Icon = meta.icon;
              return (
                <li
                  key={i}
                  className={cn("flex items-start gap-3 rounded-xl px-3.5 py-3 text-sm", meta.row)}
                >
                  <Icon className={cn("mt-0.5 size-4 shrink-0", meta.className)} aria-hidden />
                  <div className="min-w-0">
                    <p className="font-medium">
                      {f.label}
                      <span className="sr-only"> ({meta.label} severity)</span>
                    </p>
                    <p className="mt-0.5 text-muted-foreground">{f.detail}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {recommendations.length > 0 && (
        <section>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Next steps
          </h4>
          <ul className="flex flex-col gap-2 text-sm">
            {recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <Circle className="mt-1.5 size-2 shrink-0 fill-primary text-primary" aria-hidden />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {showDisclaimer && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          AI-generated triage, not a veterinary diagnosis. Consult a licensed vet
          for medical concerns.
        </p>
      )}
    </div>
  );
}
