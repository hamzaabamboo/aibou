/** @type {import('next').NextConfig} */

const withPWA = require("next-pwa");

module.exports = withPWA({
  disable: process.env.NODE_ENV === "development",
  // dest: 'public', // comment out this line
  register: true,
  sw: "/sw.js",
})({
  reactStrictMode: true,
  swcMinify: true,
});
