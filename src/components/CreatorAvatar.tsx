"use client";

import { useState } from "react";
import { proxiedImageUrl } from "@/lib/proxy-image";

interface CreatorAvatarProps {
  src: string;
  alt: string;
  handle?: string;
  className?: string;
  fill?: boolean;
  size?: number;
}

function fallbackAvatarUrl(handle?: string, alt?: string): string {
  const seed = encodeURIComponent(handle || alt || "creator");
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=c4705a,8b9a7d,d4a574&fontFamily=DM%20Sans`;
}

export function CreatorAvatar({
  src,
  alt,
  handle,
  className = "",
  fill,
  size = 56,
}: CreatorAvatarProps) {
  const [failed, setFailed] = useState(false);
  const url = failed || !src ? fallbackAvatarUrl(handle, alt) : proxiedImageUrl(src);

  const imgClass = fill ? `h-full w-full object-cover ${className}` : className;

  if (fill) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={alt}
        className={imgClass}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      width={size}
      height={size}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
