import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Check, Lock } from "lucide-react";

import { upgradePlanAction } from "@/app/app/billing/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PLAN_META } from "@/lib/plans";
import { getUserBilling } from "@/lib/queries";
import { requireOwner } from "@/lib/session";

export default async function CheckoutPage() {
  const user = await requireOwner();
  const billing = await getUserBilling(user.id);
  if (billing.plan === "guardian") redirect("/app/billing");

  const plan = PLAN_META.guardian;

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href="/app/billing"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to billing
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Upgrade to {plan.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">{plan.name} plan</span>
              <span className="font-semibold">
                {plan.price}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  {plan.cadence}
                </span>
              </span>
            </div>
            <ul className="mt-3 flex flex-col gap-1.5 text-sm text-muted-foreground">
              {plan.features.slice(0, 3).map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="size-4 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <form action={upgradePlanAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="card">Card number</Label>
              <Input
                id="card"
                inputMode="numeric"
                placeholder="4242 4242 4242 4242"
                autoComplete="off"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="exp">Expiry</Label>
                <Input id="exp" placeholder="MM / YY" autoComplete="off" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" placeholder="123" autoComplete="off" />
              </div>
            </div>

            <Button type="submit" className="mt-1">
              <Lock className="size-4" />
              Pay {plan.price} & upgrade
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              This is a demo checkout — no real card is charged.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
