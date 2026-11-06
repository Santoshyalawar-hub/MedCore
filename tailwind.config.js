export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          500: "#0284c7",
          600: "#0369a1",
          700: "#075985",
          800: "#0c4a6e",
          900: "#082f49",
        },
        teal: { 600: "#0f766e" },
        navy: {
          700: "#13324f",
          800: "#0f2a43",
          900: "#0b1f33",
          950: "#071626",
        },
      },
      fontFamily: {
        display: [
          "Manrope",
          "ui-sans-serif",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,31,51,.05),0 10px 28px -14px rgba(11,31,51,.14)",
        lift: "0 2px 4px rgba(11,31,51,.05),0 18px 40px -16px rgba(11,31,51,.24)",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fade: {
          "0%": { opacity: "0", transform: "scale(.985)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slowzoom: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.08)" },
        },
      },
      animation: {
        rise: "rise .7s cubic-bezier(.2,.7,.2,1) both",
        fade: ".45s ease-out both fade",
        slowzoom: "slowzoom 22s ease-in-out infinite alternate",
      },
    },
  },
};
