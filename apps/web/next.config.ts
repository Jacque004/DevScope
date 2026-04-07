import type { NextConfig } from "next";

/** Base NestJS (sans / final). Les routes sont sous /api côté Nest. */
function apiBaseUrl(): string {
  const raw =
    process.env.API_INTERNAL_URL ??
    process.env.INTERNAL_API_URL ??
    "http://127.0.0.1:3001";
  return raw.replace(/\/$/, "");
}

const nextConfig: NextConfig = {
  /** Réduit l’indicateur de build / marque Next en bas à droite en dev (optionnel). */
  devIndicators: false,
  async redirects() {
    return [
      {
        source: "/favicon.ico",
        destination: "/icon.svg",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    const base = apiBaseUrl();
    return [
      {
        source: "/api/:path*",
        // Nest utilise setGlobalPrefix("api") : il faut conserver /api dans l’URL cible
        destination: `${base}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
