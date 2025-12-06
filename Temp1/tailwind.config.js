/** @type {import('tailwindcss').Config} */
export default {
  content: ["/views/index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        zentry: ["zentry-regular", "sans-serif"], // let us use these fonts within our apk
        general: ["general", "sans-serif"],
        "circular-web": ["circular-web", "sans-serif"],
        "robert-medium": ["robert-medium", "sans-serif"],
        "robert-regular": ["robert-regular", "sans-serif"],
        vogue: ["vogue", "sans-serif"],
        newyork: ["newyork", "sans-serif"],
        classyvogue: ["classyvogue", "sans-serif"],
        sagita: ["sagita", "sans-serif"],
        lamoric: ["lamoric", "sans-serif"],
        cream: ["cream", "sans-serif"],
        transformers : [ "transformers", "sans-serif"],
        bitsumis : [ "bitsumis", "sans-serif"],
        batman : [ "batman", "sans-serif"],
      },

      colors: {
        blue: {
          50: "#dfdff0",
          75: "#dfdff2",
          100: "#f0f2fa",
          200: "#010101",
          300: "#4fb7dd",
        },

        violet: {
          300: "#5724ff",
        },

        yellow: {
          100: "#8e983f",
          300: "#edff66",
        },
      },
    },
  },
  plugins: [],
};
