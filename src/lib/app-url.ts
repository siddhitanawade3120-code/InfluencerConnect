/** Public base URL for links in emails (no trailing slash). */
export function getAppUrl(): string {
  const fromEnv = process.env.APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const netlify = process.env.URL?.trim();
  if (netlify) {
    const host = netlify.replace(/^https?:\/\//, "");
    return `https://${host}`;
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`;

  return "http://localhost:3000";
}

export function inquiryUrl(inquiryId: string): string {
  return `${getAppUrl()}/dashboard/inquiries/${inquiryId}`;
}
