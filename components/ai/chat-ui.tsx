"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import type { UIMessage } from "ai";
import { AlertCircle, ArrowUp, RotateCcw, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChatStatus = "submitted" | "streaming" | "ready" | "error";

export function textOfMessage(message: UIMessage): string {
  return message.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("");
}

/** Turns a useChat error into a readable sentence. */
export function chatErrorMessage(error: Error | undefined): string {
  if (!error) return "";
  const raw = error.message?.trim();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { error?: string };
      if (parsed.error) return parsed.error;
    } catch {
      // plain-text message
    }
    if (raw.length < 200 && !raw.startsWith("<")) return raw;
  }
  return "Something went wrong. Please try again.";
}

/* ------------------------------------------------------------------------ */
/* Minimal, safe Markdown rendering for assistant replies (no raw HTML).     */
/* ------------------------------------------------------------------------ */

function renderInline(text: string): React.ReactNode[] {
  // **bold** and *italic* / _italic_
  const nodes: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|_[^_\s][^_]*_)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const token = m[0];
    if (token.startsWith("**")) {
      nodes.push(<strong key={i++} className="font-semibold">{token.slice(2, -2)}</strong>);
    } else {
      nodes.push(<em key={i++}>{token.slice(1, -1)}</em>);
    }
    last = m.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

type Block =
  | { kind: "p"; lines: string[] }
  | { kind: "h"; text: string }
  | { kind: "ul" | "ol"; items: string[] };

function parseBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trimEnd();
    const bullet = /^\s*[-*•]\s+(.*)$/.exec(line);
    const numbered = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    const heading = /^\s*#{1,6}\s+(.*)$/.exec(line);
    const prev = blocks[blocks.length - 1];

    if (!line.trim()) {
      blocks.push({ kind: "p", lines: [] });
    } else if (heading) {
      blocks.push({ kind: "h", text: heading[1] });
    } else if (bullet || numbered) {
      const kind = bullet ? "ul" : "ol";
      const item = (bullet ?? numbered)![1];
      if (prev && prev.kind === kind) prev.items.push(item);
      else blocks.push({ kind, items: [item] });
    } else if (prev && prev.kind === "p") {
      prev.lines.push(line);
    } else {
      blocks.push({ kind: "p", lines: [line] });
    }
  }
  return blocks.filter((b) => b.kind !== "p" || b.lines.length > 0);
}

export function MarkdownText({ text }: { text: string }) {
  const blocks = parseBlocks(text);
  return (
    <div className="flex flex-col gap-2.5">
      {blocks.map((b, i) => {
        if (b.kind === "h") {
          return (
            <p key={i} className="font-semibold">
              {renderInline(b.text)}
            </p>
          );
        }
        if (b.kind !== "p") {
          const List = b.kind;
          return (
            <List
              key={i}
              className={cn(
                "flex flex-col gap-1 pl-5",
                b.kind === "ul" ? "list-disc" : "list-decimal",
              )}
            >
              {b.items.map((item, j) => (
                <li key={j} className="pl-0.5">
                  {renderInline(item)}
                </li>
              ))}
            </List>
          );
        }
        return (
          <p key={i}>
            {b.lines.map((l, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {renderInline(l)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------------ */

export function ChatMessages({
  messages,
  status,
  error,
  onRetry,
  empty,
  className,
}: {
  messages: UIMessage[];
  status: ChatStatus;
  error?: Error;
  onRetry: () => void;
  empty: React.ReactNode;
  className?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const last = messages[messages.length - 1];
  const waiting =
    status === "submitted" ||
    (status === "streaming" && last?.role === "assistant" && !textOfMessage(last));

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, status, error]);

  return (
    <div
      ref={scrollRef}
      className={cn("flex-1 overflow-y-auto overscroll-contain px-4 py-5", className)}
      aria-live="polite"
    >
      {messages.length === 0 ? (
        empty
      ) : (
        <div className="flex flex-col gap-4">
          {messages.map((m) => {
            const text = textOfMessage(m);
            if (!text) return null;
            const isUser = m.role === "user";
            return (
              <div
                key={m.id}
                className={cn("flex", isUser ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    isUser
                      ? "whitespace-pre-wrap rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md bg-muted",
                  )}
                >
                  {isUser ? text : <MarkdownText text={text} />}
                </div>
              </div>
            );
          })}

          {waiting && !error && (
            <div className="flex justify-start" role="status" aria-label="Assistant is typing">
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-muted px-4 py-3.5">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="size-1.5 animate-pulse rounded-full bg-muted-foreground/60"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl bg-destructive/[0.07] px-3.5 py-3 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span className="flex-1">{chatErrorMessage(error)}</span>
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex shrink-0 items-center gap-1 rounded-md font-medium underline-offset-4 hover:underline"
              >
                <RotateCcw className="size-3.5" />
                Retry
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ChatSuggestions({
  suggestions,
  onPick,
}: {
  suggestions: string[];
  onPick: (s: string) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {suggestions.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onPick(s)}
          className="rounded-full bg-muted px-3.5 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {s}
        </button>
      ))}
    </div>
  );
}

export function ChatComposer({
  onSend,
  onStop,
  status,
  placeholder,
  maxLength = 4000,
}: {
  onSend: (text: string) => void;
  onStop: () => void;
  status: ChatStatus;
  placeholder: string;
  maxLength?: number;
}) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  function submit() {
    const text = value.trim();
    if (!text || busy) return;
    onSend(text);
    setValue("");
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="border-t border-border/60 p-3"
    >
      <div className="flex items-end gap-2 rounded-2xl bg-muted/70 p-1.5 pl-4 ring-1 ring-transparent transition-shadow focus-within:bg-card focus-within:ring-ring/40">
        <textarea
          ref={ref}
          rows={1}
          value={value}
          maxLength={maxLength}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={placeholder}
          aria-label="Message"
          className="max-h-40 min-h-9 flex-1 resize-none bg-transparent py-2 text-base outline-none placeholder:text-muted-foreground md:text-sm"
        />
        {busy ? (
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={onStop}
            aria-label="Stop generating"
            className="rounded-xl"
          >
            <Square className="size-3.5 fill-current" />
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon"
            disabled={!value.trim()}
            aria-label="Send message"
            className="rounded-xl"
          >
            <ArrowUp />
          </Button>
        )}
      </div>
    </form>
  );
}
