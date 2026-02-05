/**
 * Pickleball Passport Mobile - Tailwind Configuration
 *
 * Official Brand Kit Colors and Typography
 * Brand Kit by: inahsempire.social
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Brand Color Palette
      colors: {
        // Primary Brand Colors
        brand: {
          gold: {
            DEFAULT: '#B08D55',
            50: '#F7F3EC',
            100: '#EFE7D9',
            200: '#DFCFB3',
            300: '#CFB78D',
            400: '#BFA267',
            500: '#B08D55',
            600: '#8D7144',
            700: '#6A5533',
            800: '#463822',
            900: '#231C11',
          },
          navy: {
            DEFAULT: '#1D2D44',
            50: '#E8EBF0',
            100: '#D1D7E1',
            200: '#A3AFC3',
            300: '#7587A5',
            400: '#495F87',
            500: '#1D2D44',
            600: '#172436',
            700: '#111B29',
            800: '#0B121B',
            900: '#06090E',
          },
          rust: {
            DEFAULT: '#9C5238',
            50: '#F5EBE8',
            100: '#EBD7D1',
            200: '#D7AFA3',
            300: '#C38775',
            400: '#AF6047',
            500: '#9C5238',
            600: '#7D422D',
            700: '#5E3122',
            800: '#3E2116',
            900: '#1F100B',
          },
          cream: {
            DEFAULT: '#F2EAD3',
            50: '#FDFCF8',
            100: '#FBF9F1',
            200: '#F7F3E3',
            300: '#F2EAD3',
            400: '#E8DDB8',
            500: '#DED09D',
            600: '#D4C382',
            700: '#C4AD5C',
            800: '#A08940',
            900: '#6B5C2B',
          },
        },

        // Semantic Colors
        primary: {
          DEFAULT: '#B08D55',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#F2EAD3',
          foreground: '#1D2D44',
        },
        accent: {
          DEFAULT: '#9C5238',
          foreground: '#FFFFFF',
        },
        background: {
          DEFAULT: '#FDFCF8',
          dark: '#0B121B',
        },
        foreground: {
          DEFAULT: '#1D2D44',
          dark: '#F2EAD3',
        },
        muted: {
          DEFAULT: '#F7F3E3',
          foreground: '#495F87',
        },
        destructive: {
          DEFAULT: '#DC3545',
          foreground: '#FFFFFF',
        },
        border: {
          DEFAULT: '#E8DDB8',
        },

        // Legacy color aliases for backwards compatibility
        ocean: '#1D2D44',
        'ocean-light': '#495F87',
        'ocean-dark': '#0B121B',
        sunset: '#B08D55',
        'sunset-light': '#CFB78D',
        'sunset-dark': '#8D7144',
        sand: '#F2EAD3',
        'sand-light': '#FDFCF8',
        'sand-dark': '#E8DDB8',
        palm: '#2D5A3D',
        'palm-light': '#3D7A52',
        coral: '#9C5238',
        lagoon: '#7587A5',
      },

      // Brand Typography
      fontFamily: {
        // Headings - Nunito Sans (similar to Proxima Nova)
        heading: ['Nunito Sans', 'system-ui', 'sans-serif'],
        // Body - Montserrat
        body: ['Montserrat', 'system-ui', 'sans-serif'],
        // Sans default
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
      },

      // Brand Border Radius
      borderRadius: {
        DEFAULT: '0.625rem',
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },

      // Brand Shadows
      boxShadow: {
        brand: '0 4px 6px -1px rgba(29, 45, 68, 0.1), 0 2px 4px -1px rgba(29, 45, 68, 0.06)',
        'brand-lg': '0 10px 15px -3px rgba(29, 45, 68, 0.1), 0 4px 6px -4px rgba(29, 45, 68, 0.1)',
        gold: '0 4px 14px 0 rgba(176, 141, 85, 0.25)',
        'gold-glow': '0 0 20px rgba(176, 141, 85, 0.4)',
      },
    },
  },
  plugins: [],
};
