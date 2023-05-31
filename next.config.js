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
  async headers() {
    return [
      {
        source: '/',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' }
        ]
      },
      {
        source: "/_next/:path*",
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
    ]
  }
}
);
