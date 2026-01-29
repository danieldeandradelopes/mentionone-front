"use client";

import Link from "next/link";

interface UpgradeBannerProps {
  message: string;
  ctaText?: string;
  ctaLink?: string;
}

export default function UpgradeBanner({
  message,
  ctaText = "Fazer upgrade",
  ctaLink = "/prices", // Ajustar quando tiver página de planos
}: UpgradeBannerProps) {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-lg shadow-lg mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex-1">
          <p className="font-semibold mb-1">Limite atingido</p>
          <p className="text-sm opacity-90">{message}</p>
        </div>
        <Link
          href={ctaLink}
          className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition whitespace-nowrap"
        >
          {ctaText}
        </Link>
      </div>
    </div>
  );
}

