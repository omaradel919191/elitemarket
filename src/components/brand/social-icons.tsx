import type { SVGProps } from "react";

// Brand glyphs (lucide-react no longer ships brand icons).
const baseProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function YoutubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M22 8.5a3 3 0 0 0-2.1-2.1C18 6 12 6 12 6s-6 0-7.9.4A3 3 0 0 0 2 8.5 31 31 0 0 0 1.9 12a31 31 0 0 0 .1 3.5 3 3 0 0 0 2.1 2.1C6 18 12 18 12 18s6 0 7.9-.4a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22 12a31 31 0 0 0-.1-3.5Z" />
      <path d="m10 9 5 3-5 3Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TiktokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M15 3v9.5a3.5 3.5 0 1 1-3-3.46" />
      <path d="M15 6.5A4.5 4.5 0 0 0 19.5 11" />
    </svg>
  );
}
