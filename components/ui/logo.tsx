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
      src="/logo.png"
      alt="The Pickleball Passport"
      width={dimension}
      height={dimension}
      className={className}
      priority
    />
  );
}

// Image-based logo icon using the official TPP logo
export function LogoIcon({ size = 'md', className = '' }: LogoProps) {
  const dimension = sizeMap[size];

  return (
    <Image
      src="/logo.png"
      alt="The Pickleball Passport"
      width={dimension}
      height={dimension}
      className={className}
      priority
    />
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
