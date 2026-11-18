import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-2xl bg-muted/50 px-6 py-10 text-center",
        className,
      )}
    >
      {icon && (
        <span className="mb-1 flex size-11 items-center justify-center rounded-full bg-card text-muted-foreground shadow-soft [&_svg]:size-5">
          {icon}
        </span>
      )}
      <p className="text-sm font-medium">{title}</p>
      {description && (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
