import Link from "next/link";
import { Check, CheckCircle2, Sparkles } from "lucide-react";

import { changePlanAction } from "@/app/app/billing/actions";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PLAN_META, type PlanId } from "@/lib/plans";
import { getUserBilling } from "@/lib/queries";
import { requireOwner } from "@/lib/session";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>;
}) {
  const user = await requireOwner();
  const { upgraded } = await searchParams;
  const billing = await getUserBilling(user.id);
  const current = (billing.plan as PlanId) ?? "companion";
  const currentMeta = PLAN_META[current] ?? PLAN_META.companion;

  const usagePct =
    billing.unlimited || !Number.isFinite(billing.screeningsLimit)
      ? 0
      : Math.min(
          100,
          Math.round((billing.screeningsUsed / billing.screeningsLimit) * 100),
        );

  return (
    <>
      <PageHeader
        title="Plan & billing"
        description="Manage your PawthCare subscription and usage."
      />

      {upgraded ? (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-300/70 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          <CheckCircle2 className="size-5 shrink-0" />
          <p className="text-sm font-medium">
            You&apos;re on Guardian now — a confirmation email is on its way.
          </p>
        </div>
      ) : null}

      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              Current plan
              <Badge variant={current === "guardian" ? "default" : "secondary"}>
                {currentMeta.name}
              </Badge>
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              {currentMeta.price} {currentMeta.cadence}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {billing.unlimited ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="size-4 text-primary" />
              Unlimited AI photo screenings.
            </p>
          ) : (
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  AI screenings this month
                </span>
                <span className="font-medium">
                  {billing.screeningsUsed} / {billing.screeningsLimit}
                </span>
              </div>
              <Progress value={usagePct} />
              {billing.screeningsLeft <= 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  You&apos;ve used all your free screenings. Upgrade for
                  unlimited access.
                </p>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      <h2 className="mb-3 text-lg font-semibold">Plans</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <PlanCard
          planId="companion"
          isCurrent={current === "companion"}
          action={
            current === "guardian" ? (
              <form action={changePlanAction}>
                <input type="hidden" name="plan" value="companion" />
                <Button type="submit" variant="outline" className="w-full">
                  Switch to Companion
                </Button>
              </form>
            ) : (
              <Button variant="outline" className="w-full" disabled>
                Your current plan
              </Button>
            )
          }
        />
        <PlanCard
          planId="guardian"
          highlight
          isCurrent={current === "guardian"}
          action={
            current === "guardian" ? (
              <Button className="w-full" disabled>
                <Check className="size-4" />
                Active
              </Button>
            ) : (
              <Button asChild className="w-full">
                <Link href="/app/billing/checkout">
                  <Sparkles className="size-4" />
                  Upgrade to Guardian
                </Link>
              </Button>
            )
          }
        />
      </div>
    </>
  );
}

function PlanCard({
  planId,
  isCurrent,
  highlight,
  action,
}: {
  planId: PlanId;
  isCurrent: boolean;
  highlight?: boolean;
  action: React.ReactNode;
}) {
  const meta = PLAN_META[planId];
  return (
    <Card className={highlight ? "border-primary/40 ring-1 ring-primary/20" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{meta.name}</CardTitle>
          {isCurrent ? <Badge variant="secondary">Current</Badge> : null}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-semibold tracking-tight">
            {meta.price}
          </span>
          <span className="text-sm text-muted-foreground">{meta.cadence}</span>
        </div>
        <p className="text-sm text-muted-foreground">{meta.tagline}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ul className="flex flex-col gap-2 text-sm">
          {meta.features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              {f}
            </li>
          ))}
        </ul>
        {action}
      </CardContent>
    </Card>
  );
}
