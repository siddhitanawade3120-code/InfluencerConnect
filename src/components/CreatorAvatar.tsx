"use client";

import { proxiedImageUrl } from "@/lib/proxy-image";

interface CreatorAvatarProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  size?: number;
}

export function CreatorAvatar({ src, alt, className = "", fill, size = 56 }: CreatorAvatarProps) {
  const url = proxiedImageUrl(src);

  if (fill) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={alt}
        className={`h-full w-full object-cover ${className}`}
        loading="lazy"
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
    />
  );
}
