/** Instagram / Meta CDN blocks browser hotlinking — proxy through our API */
export function isProxiedImageUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return (
      host.includes("fbcdn.net") ||
      host.includes("cdninstagram.com") ||
      host.endsWith(".instagram.com")
    );
  } catch {
    return false;
  }
}

export function proxiedImageUrl(url: string): string {
  if (!url || !isProxiedImageUrl(url)) return url;
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
}
