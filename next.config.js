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
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    config.experiments.syncWebAssembly = true;
    return config;
  },
  transpilePackages: ['absurd-sql'],
});
