"use client";

import { use, useState, useMemo } from "react";
import QRCode from "qrcode-generator";
import Link from "next/link";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { useGetBox } from "@/hooks/integration/boxes/queries";

function getPublicUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export default function QrCodePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const boxId = Number(id);
  const [copied, setCopied] = useState(false);
  const { data: box, isLoading, error } = useGetBox(boxId);

  const publicUrl = getPublicUrl();
  // Usa o slug da box na URL do QR Code
  const boxUrl = box?.slug ? `${publicUrl}/qr/${box.slug}` : "";

  // Gera QRCode apenas quando temos a URL
  const svgTag = useMemo(() => {
    if (!boxUrl) return "";
    const qr = QRCode(0, "L");
    qr.addData(boxUrl);
    qr.make();
    return qr.createSvgTag({
      cellSize: 6,
      margin: 4,
    });
  }, [boxUrl]);

  const handleCopyUrl = () => {
    if (!boxUrl) return;
    navigator.clipboard.writeText(boxUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="text-gray-500 text-center py-8">Carregando...</div>
      </div>
    );
  }

  if (error || !box) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="text-red-500 text-center py-8">
          Erro ao carregar informações da caixa. Tente novamente.
        </div>
        <Link
          href="/admin/boxes"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mt-4"
        >
          <ArrowLeft size={18} />
          Voltar para todas as caixas
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <Link
        href="/admin/boxes"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={18} />
        Voltar para todas as caixas
      </Link>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
        <h1 className="text-2xl font-bold mb-2">QR Code da Box</h1>
        <div className="mb-6">
          <p className="text-lg font-semibold text-gray-800">{box.name}</p>
          <p className="text-sm text-gray-500">{box.location}</p>
        </div>

        <div className="flex flex-col items-center gap-6">
          {svgTag && (
            <div
              className="bg-white p-6 rounded-lg border-2 border-gray-200"
              dangerouslySetInnerHTML={{ __html: svgTag }}
            />
          )}

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL do QR Code:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={boxUrl}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              <button
                onClick={handleCopyUrl}
                disabled={!boxUrl}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap sm:w-auto w-full"
              >
                {copied ? (
                  <>
                    <Check size={18} />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    Copiar
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-500 text-center">
            Escaneie este QR Code para acessar o formulário de feedback desta
            box
          </p>
        </div>
      </div>
    </div>
  );
}
