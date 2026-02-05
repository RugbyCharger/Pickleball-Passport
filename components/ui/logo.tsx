import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

const sizeMap = {
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
};

export function Logo({ size = 'md', className = '' }: LogoProps) {
  const dimension = sizeMap[size];

  return (
    <Image
      src="/logo.svg"
      alt="Pickleball Passport"
      width={dimension}
      height={dimension}
      className={className}
      priority
    />
  );
}

// Inline SVG version for places where Image component isn't ideal
export function LogoIcon({ size = 'md', className = '' }: LogoProps) {
  const dimension = sizeMap[size];

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Pickleball Passport"
    >
      {/* Background circle */}
      <circle cx="60" cy="60" r="56" fill="#1D2D44" />

      {/* Pickleball (ball with holes) */}
      <circle cx="60" cy="60" r="40" fill="#B08D55" />

      {/* Pickleball holes pattern */}
      <circle cx="45" cy="45" r="5" fill="#1D2D44" />
      <circle cx="60" cy="40" r="5" fill="#1D2D44" />
      <circle cx="75" cy="45" r="5" fill="#1D2D44" />
      <circle cx="40" cy="60" r="5" fill="#1D2D44" />
      <circle cx="55" cy="58" r="5" fill="#1D2D44" />
      <circle cx="70" cy="55" r="5" fill="#1D2D44" />
      <circle cx="80" cy="60" r="5" fill="#1D2D44" />
      <circle cx="45" cy="75" r="5" fill="#1D2D44" />
      <circle cx="60" cy="72" r="5" fill="#1D2D44" />
      <circle cx="75" cy="75" r="5" fill="#1D2D44" />
      <circle cx="52" cy="85" r="4" fill="#1D2D44" />
      <circle cx="68" cy="85" r="4" fill="#1D2D44" />

      {/* PTP Letters overlay */}
      <text
        x="60"
        y="68"
        textAnchor="middle"
        fontFamily="system-ui, sans-serif"
        fontSize="28"
        fontWeight="bold"
        fill="#1D2D44"
      >
        PTP
      </text>
    </svg>
  );
}

// Simple pickleball icon (just the ball, no text)
export function PickleballIcon({ size = 'md', className = '' }: LogoProps) {
  const dimension = sizeMap[size];

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Pickleball"
    >
      {/* Pickleball (ball with holes) */}
      <circle cx="60" cy="60" r="56" fill="#B08D55" />

      {/* Pickleball holes pattern */}
      <circle cx="35" cy="35" r="8" fill="#1D2D44" opacity="0.3" />
      <circle cx="60" cy="30" r="8" fill="#1D2D44" opacity="0.3" />
      <circle cx="85" cy="35" r="8" fill="#1D2D44" opacity="0.3" />
      <circle cx="30" cy="60" r="8" fill="#1D2D44" opacity="0.3" />
      <circle cx="55" cy="55" r="8" fill="#1D2D44" opacity="0.3" />
      <circle cx="80" cy="50" r="8" fill="#1D2D44" opacity="0.3" />
      <circle cx="90" cy="70" r="8" fill="#1D2D44" opacity="0.3" />
      <circle cx="35" cy="85" r="8" fill="#1D2D44" opacity="0.3" />
      <circle cx="60" cy="80" r="8" fill="#1D2D44" opacity="0.3" />
      <circle cx="85" cy="85" r="8" fill="#1D2D44" opacity="0.3" />
      <circle cx="45" cy="105" r="6" fill="#1D2D44" opacity="0.3" />
      <circle cx="75" cy="105" r="6" fill="#1D2D44" opacity="0.3" />
    </svg>
  );
}

export default Logo;
