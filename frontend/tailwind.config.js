/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'luxury': {
                    'black': '#050505',
                    'gold': '#c9a961',
                    'charcoal': '#1e293b',
                    'midnight': '#0f172a',
                    'beige': '#f2f0ea',
                    'text': '#1a0f11',
                    'puce': '#56453E',
                    'taupe': '#4A4743',
                    'stone': '#928E85',
                    'champagne': '#F2E9DD',
                    'charcoal-black': '#1A1A1A',
                },
            },
        },
    },
}
