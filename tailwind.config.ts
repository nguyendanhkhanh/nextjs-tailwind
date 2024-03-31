import type { Config } from "tailwindcss";

const config: Config = {

  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'base': "url('https://marketplace.canva.com/EAF5Wgpb4fQ/1/0/900w/canva-pastel-pink-simple-coquette-shiny-bow-pattern-phone-wallpaper-lTXdwVxIm9g.jpg')",
      },
      colors: {
        'base': '#242757'
      },
      keyFrames: {
        fadeIn: {
          from: { opacity: 0 }, to: { opacity: 1 }
        }
      },
      animation: {
        'fadeIn': 'fadeIn 1s ease-in-out'
      }
    },
  },
  daisyui: {
    themes: ["valentine"]
  },
  plugins: [require("daisyui")],
};
export default config;
