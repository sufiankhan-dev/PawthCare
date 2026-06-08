"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, ScanLine } from "lucide-react";

import { AnalysisView } from "@/components/ai/analysis-view";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AiFinding } from "@/lib/types";

type Result = {
  summary: string;
  riskScore: number;
  urgency: string;
  findings: AiFinding[];
  recommendations: string[];
};

async function fileToScaledDataUrl(file: File, max = 768): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.85);
}

export function PhotoAnalyzer({ petId }: { petId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [focus, setFocus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setResult(null);
    try {
      const dataUrl = await fileToScaledDataUrl(file);
      setPreview(dataUrl);
    } catch {
      setError("Could not read that image.");
    }
  }

  async function analyze() {
    if (!preview) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ petId, image: preview, focus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      setResult(data as Result);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScanLine className="size-4 text-primary" />
          AI photo analysis
        </CardTitle>
        <CardDescription>
          Upload a clear photo (skin, eyes, ears, coat) for an instant AI health
          screening.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFile}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-dashed bg-muted/40 transition-colors hover:bg-muted"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Pet preview"
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <ImagePlus className="size-6" />
              Click to upload a photo
            </span>
          )}
        </button>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="focus">What are you concerned about? (optional)</Label>
          <Input
            id="focus"
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder="e.g. red patch on left ear"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button onClick={analyze} disabled={!preview || loading}>
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <ScanLine className="size-4" />
              Analyze photo
            </>
          )}
        </Button>

        {result && (
          <div className="rounded-xl border bg-muted/30 p-4">
            <AnalysisView
              summary={result.summary}
              riskScore={result.riskScore}
              urgency={result.urgency}
              findings={result.findings}
              recommendations={result.recommendations}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
