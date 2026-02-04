"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";

type Props = { params: Promise<{ slug: string }> };

export default function NPSThankYouPage({ params }: Props) {
  const { slug } = use(params);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Obrigado! 🎉
        </h1>
        <p className="text-gray-600 mb-6">
          Sua resposta foi registrada com sucesso. Sua opinião é muito importante.
        </p>
        <Link
          href={`/nps/${slug}`}
          className="text-indigo-600 hover:underline font-medium"
        >
          Responder novamente
        </Link>
        <footer className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400">MentionOne</p>
        </footer>
      </div>
    </main>
  );
}
