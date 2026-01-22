

interface ArrowLeftIconProps extends React.SVGProps<SVGSVGElement> {
 size?: number | string;
}

export const ArrowLeftIcon = ({
 size = 24,
 className,
 strokeWidth = 1.5,
}: ArrowLeftIconProps) => {
 return (
  <svg
   xmlns="http://www.w3.org/2000/svg"
   width={size}
   height={size}
   viewBox="0 0 24 24"
   fill="none"
   stroke="currentColor"
   strokeWidth={strokeWidth}
   strokeLinecap="round"
   strokeLinejoin="round"
   className={className}
  >
   <path d="m12 19-7-7 7-7"></path>
   <path d="M19 12H5"></path>
  </svg>
 );
};
