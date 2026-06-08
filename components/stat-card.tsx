import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon,
  hint,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  hint?: string;
  accent?: "default" | "warning" | "destructive";
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-1">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            accent === "warning"
              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              : accent === "destructive"
                ? "bg-destructive/15 text-destructive"
                : "bg-primary/10 text-primary",
          )}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-semibold leading-tight">{value}</p>
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
