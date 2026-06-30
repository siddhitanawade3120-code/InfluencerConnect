import { readFileSync } from "fs";
import { resolve } from "path";
import { statusChangeEmailForBrand } from "../src/lib/inquiry-email-templates";
import { sendEmail, isEmailConfigured } from "../src/lib/email";

function loadEnv() {
  const raw = readFileSync(resolve(process.cwd(), ".env"), "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

async function main() {
  const to = process.argv[2];
  if (!to) {
    console.error("Usage: npx tsx scripts/test-accept-email.ts brand@email.com");
    process.exit(1);
  }

  console.log("configured:", isEmailConfigured());
  const email = statusChangeEmailForBrand({
    inquiryId: "test-id",
    creatorName: "Test Creator",
    creatorHandle: "testcreator",
    action: "ACCEPT",
    previousStatus: "PENDING",
    newStatus: "CONFIRMED",
    offeredBudget: 5000,
  });

  console.log("subject:", email.subject);
  console.log("preview:\n", email.text.slice(0, 300));

  const ok = await sendEmail({ to, ...email });
  console.log(ok ? "SENT" : "FAILED");
}

main();
