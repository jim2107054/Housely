/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#7F56D9",
        secondary: "#7F56D9",
        accent: "#F9A826",
        textPrimary: "#252B5C",
        textSecondary: "#53587A",
        textDark: "#1F2544",
        placeholderText: "#A1A5C1",
        background: "#FFFFFF",
        cardBackground: "#F5F4F8",
        inputBackground: "#F5F4F8",
        border: "#ECEDF3",
        white: "#ffffff",
        black: "#000000",
        yellow: "#FFC42D",
        purple: "#7F56D9",
        darkBlue: "#252B5C",
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
