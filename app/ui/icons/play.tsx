import React from 'react';

interface PlayIconProps extends React.SVGProps<SVGSVGElement> {
 size?: number | string;
}

export function PlayIcon({ size = 16, className, ...props }: PlayIconProps) {
 return (
  <svg
   xmlns="http://www.w3.org/2000/svg"
   width={size}
   height={size}
   viewBox="0 0 24 24"
   fill="currentColor"
   stroke="currentColor"
   strokeWidth="2"
   strokeLinecap="round"
   strokeLinejoin="round"
   className={`lucide lucide-play ${className || ""}`}
   aria-hidden="true"
   {...props}
  >
   <polygon points="6 3 20 12 6 21 6 3" />
  </svg>
 );
}
