import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM ?? "PawthCare <onboarding@resend.dev>";

const resend = apiKey ? new Resend(apiKey) : null;

type SendArgs = {
  to: string | string[];
  subject: string;
  html: string;
};

/**
 * Sends an email via Resend. If no RESEND_API_KEY is configured the email is
 * logged to the server console (simulated) so the app keeps working in dev.
 * Never throws — email failures must not break the main request.
 */
export async function sendEmail({ to, subject, html }: SendArgs): Promise<void> {
  const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean);
  if (recipients.length === 0) return;

  if (!resend) {
    console.log(
      `[email:simulated] to=${recipients.join(", ")} subject="${subject}"`,
    );
    return;
  }

  try {
    await resend.emails.send({ from, to: recipients, subject, html });
  } catch (err) {
    console.error("[email] send failed:", err);
  }
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

function layout(title: string, body: string): string {
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f6f3ee;padding:32px">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #ece6dd">
      <div style="background:#0f766e;padding:20px 24px;color:#fff;font-size:18px;font-weight:600">
        🐾 PawthCare
      </div>
      <div style="padding:24px">
        <h1 style="margin:0 0 12px;font-size:20px;color:#1c1917">${title}</h1>
        <div style="font-size:14px;line-height:1.6;color:#44403c">${body}</div>
      </div>
      <div style="padding:16px 24px;border-top:1px solid #f1ece4;color:#a8a29e;font-size:12px">
        PawthCare · AI-assisted pet health. This is an automated message.
      </div>
    </div>
  </div>`;
}

export function planUpgradeEmail(name: string, planName: string) {
  return {
    subject: `Your PawthCare plan is now ${planName} 🎉`,
    html: layout(
      `Welcome to ${planName}!`,
      `<p>Hi ${name || "there"},</p>
       <p>Your PawthCare plan has been upgraded to <strong>${planName}</strong>.
       You now have unlimited AI photo screenings and full access to the AI health
       assistant for all your pets.</p>
       <p>Thanks for trusting us with your companions' health.</p>`,
    ),
  };
}

export function appointmentBookedOwnerEmail(input: {
  ownerName: string;
  petName: string;
  vetName?: string;
  when: string;
  reason?: string;
}) {
  return {
    subject: `Appointment confirmed for ${input.petName}`,
    html: layout(
      "Appointment confirmed",
      `<p>Hi ${input.ownerName || "there"},</p>
       <p>Your appointment for <strong>${input.petName}</strong> is booked.</p>
       <ul>
         <li><strong>When:</strong> ${input.when}</li>
         ${input.vetName ? `<li><strong>Vet:</strong> ${input.vetName}</li>` : ""}
         ${input.reason ? `<li><strong>Reason:</strong> ${input.reason}</li>` : ""}
       </ul>
       <p>We'll send a reminder before the visit.</p>`,
    ),
  };
}

export function appointmentClinicEmail(input: {
  petName: string;
  ownerName?: string;
  vetName?: string;
  when: string;
  reason?: string;
}) {
  return {
    subject: `New appointment: ${input.petName} · ${input.when}`,
    html: layout(
      "New appointment booked",
      `<p>A new appointment has been scheduled at your clinic.</p>
       <ul>
         <li><strong>Patient:</strong> ${input.petName}</li>
         ${input.ownerName ? `<li><strong>Owner:</strong> ${input.ownerName}</li>` : ""}
         <li><strong>When:</strong> ${input.when}</li>
         ${input.vetName ? `<li><strong>Vet:</strong> ${input.vetName}</li>` : ""}
         ${input.reason ? `<li><strong>Reason:</strong> ${input.reason}</li>` : ""}
       </ul>`,
    ),
  };
}

export function clinicUpdateEmail(input: {
  title: string;
  message: string;
}) {
  return {
    subject: input.title,
    html: layout(input.title, `<p>${input.message}</p>`),
  };
}
