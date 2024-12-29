/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // מחקנו את output: 'export' כי זה לא נדרש ב-Vercel
};

module.exports = nextConfig;
