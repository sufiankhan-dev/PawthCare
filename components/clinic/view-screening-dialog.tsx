"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

import { AnalysisView } from "@/components/ai/analysis-view";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/format";
import type { AiAnalysis } from "@/lib/types";

export function ViewScreeningDialog({
  petName,
  analysis,
}: {
  petName?: string;
  analysis: AiAnalysis;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Sparkles className="size-4" />
          View screening
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            AI screening{petName ? ` · ${petName}` : ""}
          </DialogTitle>
          <DialogDescription>
            Shared by the owner · {formatDate(analysis.createdAt)}
          </DialogDescription>
        </DialogHeader>
        <AnalysisView
          summary={analysis.summary}
          riskScore={analysis.riskScore}
          urgency={analysis.urgency}
          findings={analysis.findings}
          recommendations={analysis.recommendations}
        />
      </DialogContent>
    </Dialog>
  );
}
