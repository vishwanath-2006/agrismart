/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#0f5238",
        "primary-container": "#2d6a4f",
        "on-primary": "#ffffff",
        "on-primary-container": "#a8e7c5",
        "primary-fixed": "#b1f0ce",
        "primary-fixed-dim": "#95d4b3",
        "on-primary-fixed": "#002114",
        "on-primary-fixed-variant": "#0e5138",
        "inverse-primary": "#95d4b3",

        "secondary": "#7d562d",
        "secondary-container": "#ffca98",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#7a532a",
        "secondary-fixed": "#ffdcbd",
        "secondary-fixed-dim": "#f0bd8b",
        "on-secondary-fixed": "#2c1600",
        "on-secondary-fixed-variant": "#623f18",

        "tertiary": "#0d5237",
        "tertiary-container": "#2c6a4e",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#a7e7c4",
        "tertiary-fixed": "#b0f1cc",
        "tertiary-fixed-dim": "#94d4b1",
        "on-tertiary-fixed": "#002113",
        "on-tertiary-fixed-variant": "#0c5136",

        "background": "#f8f9fa",
        "on-background": "#191c1d",

        "surface": "#f8f9fa",
        "surface-dim": "#d9dadb",
        "surface-bright": "#f8f9fa",
        "surface-variant": "#e1e3e4",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f3f4f5",
        "surface-container": "#edeeef",
        "surface-container-high": "#e7e8e9",
        "surface-container-highest": "#e1e3e4",
        "surface-tint": "#2c694e",

        "on-surface": "#191c1d",
        "on-surface-variant": "#404943",
        "inverse-surface": "#2e3132",
        "inverse-on-surface": "#f0f1f2",

        "outline": "#707973",
        "outline-variant": "#bfc9c1",

        "error": "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a"
      },
      borderRadius: {
        "sm": "0.25rem",
        "DEFAULT": "0.5rem",
        "md": "0.5rem",
        "lg": "0.75rem",
        "xl": "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
        "full": "9999px"
      },
      spacing: {
        "unit": "8px",
        "gutter-mobile": "16px",
        "margin-mobile": "16px",
        "gutter-desktop": "24px",
        "margin-desktop": "40px",
        "touch-target-min": "48px"
      },
      fontFamily: {
        "sans": ["Inter", "sans-serif"],
        "display-lg": ["Inter", "sans-serif"],
        "headline-lg": ["Inter", "sans-serif"],
        "headline-lg-mobile": ["Inter", "sans-serif"],
        "title-md": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "label-sm": ["Inter", "sans-serif"]
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["32px", { lineHeight: "40px", fontWeight: "600" }],
        "headline-lg-mobile": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "title-md": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "label-sm": ["14px", { lineHeight: "20px", letterSpacing: "0.01em", fontWeight: "500" }]
      },
      boxShadow: {
        "card": "0 4px 20px rgba(0, 0, 0, 0.05)",
        "elevated": "0 10px 30px rgba(0, 0, 0, 0.12)",
        "subtle": "0 1px 8px rgba(0, 0, 0, 0.04)"
      }
    }
  },
  plugins: []
}
