export interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
}

export type SendEmailResult =
  | { ok: true }
  | { ok: false; reason: string };

function getEmailJsConfig() {
  return {
    serviceId: process.env.EMAILJS_SERVICE_ID?.trim() ?? "",
    templateId: process.env.EMAILJS_TEMPLATE_ID?.trim() ?? "",
    publicKey: process.env.EMAILJS_PUBLIC_KEY?.trim() ?? "",
    privateKey: process.env.EMAILJS_PRIVATE_KEY?.trim() ?? "",
  };
}

export function getEmailConfigStatus(): { configured: boolean; missing: string[] } {
  const { serviceId, templateId, publicKey, privateKey } = getEmailJsConfig();
  const missing: string[] = [];
  if (!serviceId) missing.push("EMAILJS_SERVICE_ID");
  if (!templateId) missing.push("EMAILJS_TEMPLATE_ID");
  if (!publicKey) missing.push("EMAILJS_PUBLIC_KEY");
  if (!privateKey) missing.push("EMAILJS_PRIVATE_KEY");
  return { configured: missing.length === 0, missing };
}

export function isEmailConfigured(): boolean {
  return getEmailConfigStatus().configured;
}

/**
 * EmailJS template must set:
 * - To Email: {{to_email}}
 * - Subject: {{subject}}
 * - Body: {{message}}
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const { serviceId, templateId, publicKey, privateKey } = getEmailJsConfig();
  const { missing } = getEmailConfigStatus();

  if (missing.length > 0) {
    console.warn("[email] Missing env:", missing.join(", "));
    return { ok: false, reason: `missing env: ${missing.join(", ")}` };
  }

  const templateParams = {
    to_email: options.to,
    email: options.to,
    user_email: options.to,
    subject: options.subject,
    message: options.text,
    message_html: options.text,
    message_text: options.text,
  };

  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        accessToken: privateKey,
        template_params: templateParams,
      }),
    });

    const body = await response.text();

    if (!response.ok) {
      console.error("[email] EmailJS error:", response.status, body);
      if (response.status === 403 && body.includes("non-browser")) {
        console.error(
          "[email] Enable: EmailJS dashboard → Account → Security → " +
            "Allow API requests from non-browser applications"
        );
      }
      return { ok: false, reason: `EmailJS ${response.status}: ${body.slice(0, 200)}` };
    }

    console.log("[email] sent to", options.to, response.status, body);
    return { ok: true };
  } catch (err) {
    console.error("[email] request failed:", err);
    return { ok: false, reason: err instanceof Error ? err.message : "send failed" };
  }
}
