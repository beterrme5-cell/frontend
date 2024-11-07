/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2A85FF",
        darkPrimary: "#1378FF",
        lightBlue: "#F7F7F8",
        darkBlue: "#212121",
        gray: {
          light: "#DBDBDB",
          dark: "#6C6685",
        },
      },
      fontFamily: {
        jakartaSans: ['"Plus Jakarta Sans"'],
      },
    },
  },
  plugins: [],
};
