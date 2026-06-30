import emailjs, { EmailJSResponseStatus } from "@emailjs/nodejs";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

function getEmailJsConfig() {
  return {
    serviceId: process.env.EMAILJS_SERVICE_ID?.trim() ?? "",
    templateId: process.env.EMAILJS_TEMPLATE_ID?.trim() ?? "",
    publicKey: process.env.EMAILJS_PUBLIC_KEY?.trim() ?? "",
    privateKey: process.env.EMAILJS_PRIVATE_KEY?.trim() ?? "",
  };
}

export function isEmailConfigured(): boolean {
  const { serviceId, templateId, publicKey, privateKey } = getEmailJsConfig();
  return Boolean(serviceId && templateId && publicKey && privateKey);
}

/**
 * Sends via EmailJS using one template. In the EmailJS dashboard, set:
 * - To Email: {{to_email}}
 * - Subject: {{subject}}
 * - Body (HTML): {{{message_html}}} or paste {{message_html}} in code view
 * - Optional plain fallback: {{message_text}}
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const { serviceId, templateId, publicKey, privateKey } = getEmailJsConfig();

  if (!serviceId || !templateId || !publicKey || !privateKey) {
    console.warn("[email] EmailJS env vars missing — skipping send to", options.to);
    return false;
  }

  try {
    const result = await emailjs.send(
      serviceId,
      templateId,
      {
        to_email: options.to,
        email: options.to,
        user_email: options.to,
        reply_to: options.to,
        subject: options.subject,
        message: options.text,
        message_html: options.html,
        message_text: options.text,
      },
      { publicKey, privateKey }
    );
    console.log("[email] sent to", options.to, result.status, result.text);
    return true;
  } catch (err) {
    if (err instanceof EmailJSResponseStatus) {
      console.error("[email] EmailJS error:", err.status, err.text);
      if (err.status === 403 && err.text.includes("non-browser")) {
        console.error(
          "[email] Enable server-side sends: EmailJS dashboard → Account → Security → " +
            "Allow API requests from non-browser applications"
        );
      }
    } else {
      console.error("[email] EmailJS error:", err);
    }
    return false;
  }
}
