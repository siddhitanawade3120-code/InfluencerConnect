/**
 * End-to-end smoke test — run: npx tsx scripts/e2e-test.ts
 * Run: npx tsx scripts/e2e-test.ts
 * Override: BASE_URL=https://your-app.onrender.com npx tsx scripts/e2e-test.ts
 */

const BASE = (
  process.env.BASE_URL ?? "https://influencerconnect-ge8l.onrender.com"
).replace(/\/$/, "");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

type Result = { name: string; ok: boolean; detail?: string };

const results: Result[] = [];
let cookieJar = "";
let adminCookie = "";

function record(name: string, ok: boolean, detail?: string) {
  results.push({ name, ok, detail });
  const icon = ok ? "PASS" : "FAIL";
  console.log(`${icon}  ${name}${detail ? ` — ${detail}` : ""}`);
}

function parseSetCookie(headers: Headers): void {
  const cookies = headers.getSetCookie?.() ?? [];
  if (cookies.length === 0) {
    const single = headers.get("set-cookie");
    if (single) cookies.push(single);
  }
  for (const raw of cookies) {
    const pair = raw.split(";")[0];
    const [key] = pair.split("=");
    const regex = new RegExp(`(?:^|;\\s*)${key}=[^;]*`, "g");
    cookieJar = cookieJar.replace(regex, "").trim();
    cookieJar = cookieJar ? `${cookieJar}; ${pair}` : pair;
  }
}

async function req(
  path: string,
  options: RequestInit & { useAdmin?: boolean } = {}
): Promise<Response> {
  const headers = new Headers(options.headers);
  const jar = options.useAdmin ? adminCookie : cookieJar;
  if (jar) headers.set("Cookie", jar);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (options.useAdmin) {
    parseSetCookie(res.headers);
    adminCookie = cookieJar; // admin uses separate - fix this
  } else {
    parseSetCookie(res.headers);
  }
  return res;
}

async function reqAdmin(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  if (adminCookie) headers.set("Cookie", adminCookie);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const cookies = res.headers.getSetCookie?.() ?? [];
  for (const raw of cookies) {
    const pair = raw.split(";")[0];
    const [key] = pair.split("=");
    adminCookie = adminCookie.replace(new RegExp(`(?:^|;\\s*)${key}=[^;]*`, "g"), "").trim();
    adminCookie = adminCookie ? `${adminCookie}; ${pair}` : pair;
  }
  return res;
}

async function main() {
  console.log(`\nE2E tests against ${BASE}\n${"=".repeat(50)}\n`);

  const ts = Date.now();
  const brandEmail = `e2e-brand-${ts}@test.com`;
  const creatorEmail = `e2e-creator-${ts}@test.com`;
  const password = "TestPass123!";

  // --- Public pages ---
  for (const path of ["/", "/results", "/shortlist", "/signup", "/signup/brand", "/signup/creator", "/login"]) {
    const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
    record(`GET ${path}`, res.status === 200, `status ${res.status}`);
  }

  // --- Public API ---
  const health = await fetch(`${BASE}/api/health`);
  const healthJson = await health.json();
  record(
    "GET /api/health",
    health.ok && healthJson.ok === true && healthJson.db === true,
    JSON.stringify(healthJson)
  );

  const creatorsRes = await fetch(`${BASE}/api/creators`);
  const creators = await creatorsRes.json();
  record(
    "GET /api/creators",
    creatorsRes.ok && Array.isArray(creators) && creators.length > 0,
    `${creators.length} creator(s)`
  );

  const handle = creators[0]?.instagramHandle ?? "foodie_khalasi24";
  if (creators[0]?.profilePicUrl) {
    const proxyUrl = `${BASE}/api/proxy-image?url=${encodeURIComponent(creators[0].profilePicUrl)}`;
    const proxyRes = await fetch(proxyUrl);
    record(
      "GET /api/proxy-image",
      proxyRes.ok && (proxyRes.headers.get("content-type")?.includes("image") ?? false),
      `status ${proxyRes.status}, ${proxyRes.headers.get("content-type")}`
    );
  }

  // --- Brand signup + session ---
  const brandSignup = await req("/api/auth/signup/brand", {
    method: "POST",
    body: JSON.stringify({
      email: brandEmail,
      password,
      name: "E2E Brand User",
      phone: "+91 9999999999",
      businessName: "E2E Cloud Kitchen",
      category: "Cloud Kitchen",
      budgetMin: 500,
      budgetMax: 5000,
      area: "Vasai-Virar",
      city: "Mumbai",
    }),
  });
  const brandSignupJson = await brandSignup.json();
  record(
    "POST /api/auth/signup/brand",
    brandSignup.ok && brandSignupJson.user?.role === "BRAND",
    brandSignupJson.error ?? brandSignupJson.redirect
  );

  const brandMe = await req("/api/auth/me");
  const brandMeJson = await brandMe.json();
  record(
    "GET /api/auth/me (brand session)",
    brandMe.ok && brandMeJson.user?.email === brandEmail,
    brandMeJson.user?.role
  );

  const brandDash = await req("/dashboard/brand", { redirect: "manual" });
  record(
    "GET /dashboard/brand (authenticated)",
    brandDash.status === 200,
    `status ${brandDash.status}`
  );

  const creatorDashBlocked = await req("/dashboard/creator", { redirect: "manual" });
  record(
    "GET /dashboard/creator (brand blocked)",
    creatorDashBlocked.status === 307 || creatorDashBlocked.status === 308,
    `redirect status ${creatorDashBlocked.status}`
  );

  await req("/api/auth/logout", { method: "POST" });
  cookieJar = "";
  const afterLogout = await req("/api/auth/me");
  record(
    "POST /api/auth/logout",
    afterLogout.status === 401,
    `me status ${afterLogout.status}`
  );

  // --- Brand login ---
  const brandLogin = await req("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: brandEmail, password }),
  });
  const brandLoginJson = await brandLogin.json();
  record(
    "POST /api/auth/login (brand)",
    brandLogin.ok && brandLoginJson.redirect === "/dashboard/brand",
    brandLoginJson.error
  );

  // --- Creator signup (claim profile) ---
  cookieJar = "";
  const creatorSignup = await req("/api/auth/signup/creator", {
    method: "POST",
    body: JSON.stringify({
      email: creatorEmail,
      password,
      name: "E2E Creator",
      phone: "+91 8888888888",
      instagramHandle: handle,
      bio: "E2E test creator",
    }),
  });
  const creatorSignupJson = await creatorSignup.json();
  record(
    "POST /api/auth/signup/creator",
    creatorSignup.ok && creatorSignupJson.user?.role === "CREATOR",
    creatorSignupJson.claimedCreator ? "claimed admin profile" : (creatorSignupJson.error ?? "no claim")
  );

  const creatorDash = await req("/dashboard/creator", { redirect: "manual" });
  record(
    "GET /dashboard/creator (authenticated)",
    creatorDash.status === 200,
    `status ${creatorDash.status}`
  );

  // --- Unauthenticated dashboard blocked ---
  cookieJar = "";
  const dashBlocked = await fetch(`${BASE}/dashboard/brand`, { redirect: "manual" });
  record(
    "GET /dashboard/brand (unauthenticated)",
    dashBlocked.status === 307 || dashBlocked.status === 308,
    `status ${dashBlocked.status}`
  );

  // --- Admin (separate from user auth) ---
  const adminLogin = await reqAdmin("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ password: ADMIN_PASSWORD }),
  });
  record("POST /api/admin/login", adminLogin.ok, `status ${adminLogin.status}`);

  const adminCreators = await reqAdmin("/api/creators?activeOnly=false");
  const adminList = await adminCreators.json();
  record(
    "GET /api/creators (admin)",
    adminCreators.ok && Array.isArray(adminList),
    `${Array.isArray(adminList) ? adminList.length : 0} creators`
  );

  // --- Summary ---
  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${"=".repeat(50)}`);
  console.log(`Results: ${passed}/${results.length} passed`);
  if (failed.length) {
    console.log("\nFailed:");
    failed.forEach((f) => console.log(`  - ${f.name}: ${f.detail ?? ""}`));
    process.exit(1);
  }
  console.log("\nAll E2E checks passed.\n");
}

main().catch((err) => {
  console.error("E2E runner crashed:", err);
  process.exit(1);
});
