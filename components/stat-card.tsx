import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ACCENTS = {
  default: "bg-primary/10 text-primary",
  warning: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
  destructive: "bg-destructive/10 text-destructive",
} as const;

export function StatCard({
  label,
  value,
  icon,
  hint,
  accent = "default",
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  hint?: string;
  accent?: keyof typeof ACCENTS;
}) {
  return (
    <Card size="sm">
      <CardContent className="flex items-center gap-3.5">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl [&_svg]:size-[1.15rem]",
            ACCENTS[accent],
          )}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-xl font-semibold leading-tight tabular-nums sm:text-2xl">
            {value}
          </p>
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          {hint && <p className="truncate text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
