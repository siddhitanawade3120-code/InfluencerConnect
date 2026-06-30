import { readFileSync } from "fs";
import { resolve } from "path";
import emailjs, { EmailJSResponseStatus } from "@emailjs/nodejs";

function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // ignore
  }
}

loadEnv();

async function main() {
  const serviceId = process.env.EMAILJS_SERVICE_ID?.trim();
  const templateId = process.env.EMAILJS_TEMPLATE_ID?.trim();
  const publicKey = process.env.EMAILJS_PUBLIC_KEY?.trim();
  const privateKey = process.env.EMAILJS_PRIVATE_KEY?.trim();
  const testTo = process.argv[2];

  if (!testTo) {
    console.error("Usage: npx tsx scripts/test-email.ts your@email.com");
    process.exit(1);
  }

  console.log("Sending test to:", testTo);

  try {
    const result = await emailjs.send(
      serviceId!,
      templateId!,
      {
        to_email: testTo,
        subject: "InfluConnect test",
        message_html: "<p>Test from InfluConnect server.</p>",
        message_text: "Test from InfluConnect server.",
      },
      { publicKey: publicKey!, privateKey: privateKey! }
    );
    console.log("SUCCESS", result.status, result.text);
  } catch (err) {
    if (err instanceof EmailJSResponseStatus) {
      console.error("FAILED", err.status, err.text);
    } else {
      console.error("FAILED", err);
    }
    process.exit(1);
  }
}

main();
