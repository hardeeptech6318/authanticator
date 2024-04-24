

/** @type {import('tailwindcss').Config} */

// const flowbite = require("flowbite-react/tailwind");

import flowbite from "flowbite-react/tailwind"

export default {
  important: true,
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flowbite/**/*.js",
    flowbite.content(),
  ],
  theme: {
    extend: {},
  },
  plugins: [
    flowbite.plugin(),
    require('flowbite/plugin')
]
}

