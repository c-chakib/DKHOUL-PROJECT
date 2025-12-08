/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,ts}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#BC5627', // Terracotta
                    hover: '#A0451F',
                },
                secondary: {
                    DEFAULT: '#1C39BB', // Majorelle Blue
                    hover: '#142a8c',
                },
                sand: {
                    DEFAULT: '#F9F5F0', // Backgrounds
                    dark: '#E8E0D5', // Card Borders
                },
                success: '#47B885', // Mint
                error: '#E04F5F', // Red
                text: {
                    main: '#1F2937', // Dark Gray
                    muted: '#6B7280',
                },
                // Alias for compatibility if needed
                accent: '#47B885',
                dark: '#1F2937',
            },
            fontFamily: {
                heading: ['"Playfair Display"', 'serif'], // Élégance & Tradition
                body: ['"Lato"', 'sans-serif'], // Lisibilité Mobile
            }
        },
    },
    plugins: [],
}
