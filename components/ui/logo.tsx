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
      {/* Pickleball ball */}
      <circle cx="60" cy="60" r="56" fill="#B08D55" />
      {/* Outer ring for depth */}
      <circle cx="60" cy="60" r="56" fill="none" stroke="#8D7144" strokeWidth="3" />

      {/* Pickleball holes — evenly spaced, punched-through look */}
      {/* Row 1 */}
      <circle cx="40" cy="38" r="7" fill="#1D2D44" opacity="0.75" />
      <circle cx="60" cy="32" r="7" fill="#1D2D44" opacity="0.75" />
      <circle cx="80" cy="38" r="7" fill="#1D2D44" opacity="0.75" />
      {/* Row 2 */}
      <circle cx="28" cy="58" r="7" fill="#1D2D44" opacity="0.75" />
      <circle cx="48" cy="58" r="7" fill="#1D2D44" opacity="0.75" />
      <circle cx="72" cy="58" r="7" fill="#1D2D44" opacity="0.75" />
      <circle cx="92" cy="58" r="7" fill="#1D2D44" opacity="0.75" />
      {/* Row 3 */}
      <circle cx="40" cy="78" r="7" fill="#1D2D44" opacity="0.75" />
      <circle cx="60" cy="84" r="7" fill="#1D2D44" opacity="0.75" />
      <circle cx="80" cy="78" r="7" fill="#1D2D44" opacity="0.75" />
    </svg>
  );
}

export default Logo;
