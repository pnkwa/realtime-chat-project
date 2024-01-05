/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    
    plugins: [require("daisyui")],
    
    theme: {
        extend: {
            colors: {
                green: "#C7DCA7",
                yellow: "#FCE09B",
                pink: "#FFCCCC",
                cream: "#F9F5EB",
                blue: "#ADC4CE",
                black: "#1E1E1E",
                darkGreen: "#889771"
            }
        }
    }
};

