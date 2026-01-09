/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#4CAF50",
        secondary: "#7F56D9",
        textPrimary: "#2e5a2e",
        textSecondary: "#688f68",
        textDark: "#1b361b",
        placeholderText: "#767676",
        background: "#e8f5e9",
        cardBackground: "#f1f8f2",
        inputBackground: "#f4faf5",
        border: "#c8e6c9",
        white: "#ffffff",
        black: "#000000",
      },
      fontFamily: {
        'manrope': ['Manrope-Regular'],
        'manrope-medium': ['Manrope-Medium'],
        'manrope-semibold': ['Manrope-SemiBold'],
        'manrope-bold': ['Manrope-Bold'],
        'poppins': ['Poppins-Regular'],
        'poppins-medium': ['Poppins-Medium'],
        'poppins-semibold': ['Poppins-SemiBold'],
        'poppins-bold': ['Poppins-Bold'],
      },
    },
  },
  plugins: [],
};
