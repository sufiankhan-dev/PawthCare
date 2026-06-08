"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { sendEmail, planUpgradeEmail } from "@/lib/email";
import { PLAN_META, type PlanId } from "@/lib/plans";
import { setUserPlan } from "@/lib/queries";
import { requireOwner } from "@/lib/session";

export async function upgradePlanAction() {
  const user = await requireOwner();

  await setUserPlan(user.id, "guardian");

  const tpl = planUpgradeEmail(user.name, PLAN_META.guardian.name);
  await sendEmail({ to: user.email, ...tpl });

  revalidatePath("/app/billing");
  revalidatePath("/app");
  redirect("/app/billing?upgraded=1");
}

export async function changePlanAction(formData: FormData) {
  const user = await requireOwner();
  const plan = String(formData.get("plan") ?? "") as PlanId;
  if (plan !== "companion" && plan !== "guardian") {
    throw new Error("Invalid plan");
  }

  await setUserPlan(user.id, plan);

  if (plan === "guardian") {
    const tpl = planUpgradeEmail(user.name, PLAN_META.guardian.name);
    await sendEmail({ to: user.email, ...tpl });
  }

  revalidatePath("/app/billing");
  revalidatePath("/app");
  redirect(plan === "guardian" ? "/app/billing?upgraded=1" : "/app/billing");
}
