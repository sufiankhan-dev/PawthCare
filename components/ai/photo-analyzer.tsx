"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ImagePlus,
  Loader2,
  Lock,
  RotateCcw,
  ScanLine,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

import { AnalysisView } from "@/components/ai/analysis-view";
import { Badge } from "@/components/ui/badge";
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
import {
  MAX_UPLOAD_BYTES,
  SUPPORTED_IMAGE_TYPES,
  type PhotoAnalysisResult,
} from "@/lib/ai/schemas";
import { cn } from "@/lib/utils";

/** Longest edge sent to the model: enough detail for skin/eye close-ups. */
const ANALYSIS_MAX_EDGE = 1280;
/** Longest edge of the thumbnail stored with the screening history. */
const THUMB_MAX_EDGE = 320;
/** Images smaller than this on their shortest edge are rejected. */
const MIN_EDGE = 200;

const ACCEPT = [...SUPPORTED_IMAGE_TYPES, ".heic", ".heif"].join(",");

const STAGES = [
  "Preparing photo…",
  "Analyzing with Gemini…",
  "Checking observations…",
] as const;

type Prepared = { image: string; thumbnail: string; name: string };

class UploadError extends Error {}

function encodeCanvas(bitmap: ImageBitmap, maxEdge: number, quality: number) {
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new UploadError("Your browser can't process images.");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}

async function prepareImage(file: File): Promise<Prepared> {
  const isHeic = /\.(heic|heif)$/i.test(file.name) || /heic|heif/.test(file.type);
  const typeOk =
    (SUPPORTED_IMAGE_TYPES as readonly string[]).includes(file.type) || isHeic;
  if (!typeOk) {
    throw new UploadError("Unsupported file. Please choose a JPEG, PNG, WebP, or HEIC photo.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadError(
      `That photo is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`,
    );
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new UploadError(
      isHeic
        ? "This browser can't open HEIC photos. Please convert it to JPEG and try again."
        : "We couldn't read that image. It may be corrupted.",
    );
  }

  try {
    if (Math.min(bitmap.width, bitmap.height) < MIN_EDGE) {
      throw new UploadError("That photo is too small for a reliable screening. Try a larger, closer photo.");
    }
    return {
      image: encodeCanvas(bitmap, ANALYSIS_MAX_EDGE, 0.88),
      thumbnail: encodeCanvas(bitmap, THUMB_MAX_EDGE, 0.8),
      name: file.name,
    };
  } finally {
    bitmap.close();
  }
}

async function readError(res: Response): Promise<{ message: string; code?: string }> {
  try {
    const data = (await res.json()) as { error?: string; code?: string };
    if (data.error) return { message: data.error, code: data.code };
  } catch {
    // non-JSON body (e.g. a proxy error page)
  }
  if (res.status === 413) return { message: "That image is too large to upload." };
  return { message: "Analysis failed. Please try again." };
}

export function PhotoAnalyzer({
  petId,
  petName,
  unlimited = true,
  screeningsLeft = Infinity,
}: {
  petId: string;
  petName?: string;
  unlimited?: boolean;
  screeningsLeft?: number;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [prepared, setPrepared] = useState<Prepared | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [focus, setFocus] = useState("");
  const [stage, setStage] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PhotoAnalysisResult | null>(null);
  const [limitHit, setLimitHit] = useState(false);

  const loading = stage !== null;
  const limited = !unlimited;
  const locked = limited && (screeningsLeft <= 0 || limitHit);

  useEffect(() => () => abortRef.current?.abort(), []);

  const handleFile = useCallback(async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setResult(null);
    setPreparing(true);
    try {
      setPrepared(await prepareImage(file));
    } catch (err) {
      setError(err instanceof UploadError ? err.message : "We couldn't read that image.");
    } finally {
      setPreparing(false);
    }
  }, []);

  // Allow pasting an image from the clipboard while the analyzer is visible.
  useEffect(() => {
    if (locked || loading) return;
    function onPaste(e: ClipboardEvent) {
      const file = Array.from(e.clipboardData?.files ?? []).find((f) =>
        f.type.startsWith("image/"),
      );
      if (file) {
        e.preventDefault();
        void handleFile(file);
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handleFile, locked, loading]);

  function reset() {
    abortRef.current?.abort();
    setPrepared(null);
    setResult(null);
    setError(null);
    setFocus("");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function analyze() {
    if (!prepared || loading) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setError(null);
    setResult(null);
    setStage(0);
    const timers = [
      setTimeout(() => setStage(1), 600),
      setTimeout(() => setStage(2), 6000),
    ];

    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId,
          image: prepared.image,
          thumbnail: prepared.thumbnail,
          focus: focus.trim() || undefined,
        }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const { message, code } = await readError(res);
        if (code === "limit_reached") setLimitHit(true);
        setError(message);
        return;
      }
      setResult((await res.json()) as PhotoAnalysisResult);
      router.refresh();
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(
        err instanceof TypeError
          ? "Network error. Check your connection and try again."
          : "Analysis failed. Please try again.",
      );
    } finally {
      timers.forEach(clearTimeout);
      if (abortRef.current === controller) abortRef.current = null;
      setStage(null);
    }
  }

  function cancel() {
    abortRef.current?.abort();
  }

  const header = (
    <CardHeader>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-2">
            <ScanLine className="size-4 text-primary" />
            AI photo screening
          </CardTitle>
          <CardDescription className="mt-1">
            A clear, well-lit close-up of skin, eyes, ears, teeth, or coat works best.
          </CardDescription>
        </div>
        {limited && !locked && Number.isFinite(screeningsLeft) ? (
          <Badge variant="secondary">{screeningsLeft} left</Badge>
        ) : null}
      </div>
    </CardHeader>
  );

  if (locked) {
    return (
      <Card>
        {header}
        <CardContent>
          <div className="flex flex-col items-center gap-3 rounded-xl bg-muted/60 px-6 py-10 text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Lock className="size-5" />
            </span>
            <p className="text-sm font-medium">
              You&apos;ve used all your free screenings this month
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Upgrade to <strong>Guardian</strong> for unlimited AI photo
              screening and the full AI health assistant.
            </p>
            <Button asChild className="mt-1">
              <Link href="/app/billing/checkout">
                <Sparkles className="size-4" />
                Upgrade
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {header}
      <CardContent className="flex flex-col gap-4">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />

        {prepared ? (
          <div className="relative overflow-hidden rounded-xl bg-muted/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={prepared.image}
              alt={petName ? `Photo of ${petName} to screen` : "Photo to screen"}
              className={cn(
                "mx-auto max-h-80 w-full object-contain transition-opacity",
                loading && "opacity-60",
              )}
            />
            {!loading && (
              <div className="absolute right-2 top-2 flex gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-card/90 backdrop-blur"
                  onClick={() => inputRef.current?.click()}
                >
                  <RotateCcw />
                  Replace
                </Button>
                <Button
                  size="icon-sm"
                  variant="outline"
                  className="bg-card/90 backdrop-blur"
                  onClick={reset}
                  aria-label="Remove photo"
                >
                  <X />
                </Button>
              </div>
            )}
            {loading && (
              <div
                className="absolute inset-x-3 bottom-3 flex items-center gap-2.5 rounded-xl bg-card/95 px-3.5 py-2.5 text-sm shadow-soft backdrop-blur"
                role="status"
                aria-live="polite"
              >
                <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
                <span className="flex-1">{STAGES[stage ?? 0]}</span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {(stage ?? 0) + 1}/{STAGES.length}
                </span>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              void handleFile(e.dataTransfer.files?.[0]);
            }}
            disabled={preparing}
            className={cn(
              "flex min-h-52 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              dragging
                ? "border-primary/60 bg-primary/5"
                : "border-border bg-muted/40 hover:border-primary/40 hover:bg-muted/70",
            )}
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-card text-primary shadow-soft">
              {preparing ? (
                <Loader2 className="size-5 animate-spin" />
              ) : dragging ? (
                <Upload className="size-5" />
              ) : (
                <ImagePlus className="size-5" />
              )}
            </span>
            <span className="text-sm font-medium">
              {preparing
                ? "Preparing photo…"
                : dragging
                  ? "Drop to upload"
                  : "Drop a photo here or click to browse"}
            </span>
            <span className="text-xs text-muted-foreground">
              JPEG, PNG, WebP, or HEIC · up to {MAX_UPLOAD_BYTES / 1024 / 1024} MB · or paste
            </span>
          </button>
        )}

        {prepared && !result && (
          <div className="flex flex-col gap-2">
            <Label htmlFor={`focus-${petId}`}>
              What are you concerned about?{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id={`focus-${petId}`}
              value={focus}
              maxLength={300}
              disabled={loading}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="e.g. red patch on left ear"
            />
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl bg-destructive/[0.07] px-3.5 py-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {prepared && !result && (
          <div className="flex gap-2">
            <Button onClick={analyze} disabled={loading} className="flex-1" size="lg">
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <ScanLine />
                  {error ? "Try again" : "Analyze photo"}
                </>
              )}
            </Button>
            {loading && (
              <Button variant="outline" size="lg" onClick={cancel}>
                Cancel
              </Button>
            )}
          </div>
        )}

        {result && (
          <div className="flex flex-col gap-4 border-t border-border/60 pt-5">
            <AnalysisView
              summary={result.summary}
              riskScore={result.riskScore}
              urgency={result.urgency}
              findings={result.findings}
              recommendations={result.recommendations}
              confidence={result.confidence}
            />
            <Button variant="outline" onClick={reset}>
              <ImagePlus />
              Screen another photo
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
