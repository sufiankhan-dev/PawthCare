import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { riskTone, URGENCY_META } from "@/lib/format";
import type { AiFinding } from "@/lib/types";

const severityIcon = {
  low: <CheckCircle2 className="size-4 text-emerald-500" />,
  moderate: <Info className="size-4 text-amber-500" />,
  high: <AlertTriangle className="size-4 text-destructive" />,
};

export function AnalysisView({
  summary,
  riskScore,
  urgency,
  findings,
  recommendations,
}: {
  summary: string | null;
  riskScore: number;
  urgency: string;
  findings: AiFinding[];
  recommendations: string[];
}) {
  const tone = riskTone(riskScore);
  const urgencyMeta = URGENCY_META[urgency] ?? URGENCY_META.routine;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant={tone.badge}>{tone.label} risk</Badge>
        <Badge variant={urgencyMeta.badge}>{urgencyMeta.label}</Badge>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Risk score</span>
          <span className="font-medium">{riskScore}/100</span>
        </div>
        <Progress value={riskScore} indicatorClassName={tone.bar} />
      </div>

      {summary && <p className="text-sm">{summary}</p>}

      {findings.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">Observations</p>
          <ul className="flex flex-col gap-2">
            {findings.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5">{severityIcon[f.severity]}</span>
                <span>
                  <span className="font-medium">{f.label}.</span> {f.detail}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recommendations.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">Recommendations</p>
          <ul className="list-inside list-disc text-sm text-muted-foreground">
            {recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        AI-generated triage, not a veterinary diagnosis. Consult a licensed vet
        for medical concerns.
      </p>
    </div>
  );
}
