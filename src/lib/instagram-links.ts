export function instagramProfileUrl(handle: string): string {
  const user = handle.replace(/^@/, "").trim();
  return `https://www.instagram.com/${user}/`;
}

/** Opens Instagram DM compose for this user (app on mobile, web on desktop) */
export function instagramDmUrl(handle: string): string {
  const user = handle.replace(/^@/, "").trim();
  return `https://ig.me/m/${user}`;
}
