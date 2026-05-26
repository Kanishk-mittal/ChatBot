/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                palette: {
                    yellow: '#FFD41D',
                    orange: '#FFA240',
                    red: '#D73535',
                    brightRed: '#FF4646',
                }
            },
            backgroundImage: {
                'gradient-warm': 'linear-gradient(to bottom right, #FFCC99, #FFB366, #FFA240)',
            }
        },
    },
    plugins: [],
}
