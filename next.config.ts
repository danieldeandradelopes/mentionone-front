import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/admin/boxes",
        destination: "/admin/suggestions/boxes",
        permanent: true,
      },
      {
        source: "/admin/boxes/new",
        destination: "/admin/suggestions/boxes/new",
        permanent: true,
      },
      {
        source: "/admin/boxes/:id/edit",
        destination: "/admin/suggestions/boxes/:id/edit",
        permanent: true,
      },
      {
        source: "/admin/boxes/:id/qrcode",
        destination: "/admin/suggestions/boxes/:id/qrcode",
        permanent: true,
      },
      {
        source: "/admin/feedbacks",
        destination: "/admin/suggestions/feedbacks",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    // Permite qualquer hostname (fallback caso remotePatterns não funcione)
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
