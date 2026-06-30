import emailjs from "@emailjs/nodejs";

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
    await emailjs.send(
      serviceId,
      templateId,
      {
        to_email: options.to,
        subject: options.subject,
        message_html: options.html,
        message_text: options.text,
      },
      { publicKey, privateKey }
    );
    return true;
  } catch (err) {
    console.error("[email] EmailJS error:", err);
    return false;
  }
}
