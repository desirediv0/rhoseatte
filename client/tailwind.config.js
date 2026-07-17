/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Acumin Pro', 'sans-serif'],
				display: ['var(--font-display)', 'Playfair Display', 'Georgia', 'serif'],
				heading: ['var(--font-display)', 'Playfair Display', 'Georgia', 'serif'],
			},
			letterSpacing: {
				luxe: '0.2em',
				'luxe-lg': '0.3em',
				'luxe-xl': '0.4em',
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				brand: {
					black: '#111111',
					white: '#FFFFFF',
					gray: '#FAFAFA',
					silver: '#EAEAEA',
					dark: '#111111',
					heading: '#111111',
					paragraph: '#666666',
					gold: '#B8976A',
					goldLight: '#C9A96E',
					goldDark: '#A08050',
					success: '#3D7C4F',
					error: '#C24B42',
				},
				noir: {
					DEFAULT: '#111111',
					soft: '#1A1A1A',
					mist: '#2A2A2A',
				},
				ivory: {
					DEFAULT: '#FAFAFA',
					deep: '#EAEAEA',
					warm: '#FAFAFA',
				},
				gold: {
					DEFAULT: '#B8976A',
					light: '#C9A96E',
					dark: '#A08050',
				},
				stone: {
					DEFAULT: '#666666',
					dark: '#444444',
				},
				line: '#EAEAEA',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'var(--radius)',
				sm: 'var(--radius)',
			},
			transitionDuration: {
				400: '400ms',
				600: '600ms',
				800: '800ms',
				1200: '1200ms',
			},
			transitionTimingFunction: {
				luxe: 'cubic-bezier(0.22, 1, 0.36, 1)',
			},
			keyframes: {
				'marquee-x': {
					from: { transform: 'translateX(0)' },
					to: { transform: 'translateX(-50%)' },
				},
				'fade-up': {
					from: { opacity: '0', transform: 'translateY(20px)' },
					to: { opacity: '1', transform: 'translateY(0)' },
				},
				'slow-zoom': {
					from: { transform: 'scale(1.04)' },
					to: { transform: 'scale(1)' },
				},
				shimmer: {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' },
				},
				'spin-slow': {
					to: { transform: 'rotate(360deg)' },
				},
				'float-y': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-8px)' },
				},
			},
			animation: {
				'marquee-x': 'marquee-x 40s linear infinite',
				'fade-up': 'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
				'slow-zoom': 'slow-zoom 1.4s cubic-bezier(0.22, 1, 0.36, 1) both',
				shimmer: 'shimmer 2s linear infinite',
				'spin-slow': 'spin-slow 20s linear infinite',
				'float-y': 'float-y 6s ease-in-out infinite',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
};
