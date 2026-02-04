"use client";

import { use, useState, useMemo } from "react";
import QRCode from "qrcode-generator";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Copy, Check, Printer } from "lucide-react";
import {
  useGetBox,
  useGetBoxBrandingById,
} from "@/hooks/integration/boxes/queries";
import { usePlanFeatures } from "@/hooks/utils/use-plan-features";

const basePath = "/admin/suggestions/boxes";

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
  const { data: boxBranding } = useGetBoxBrandingById(boxId);
  const showMentionOneBranding = usePlanFeatures().hasFeature(
    "show_mentionone_branding",
  );

  const publicUrl = getPublicUrl();
  const boxUrl = box?.slug ? `${publicUrl}/qr/${box.slug}` : "";

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
          href={basePath}
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
        href={basePath}
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
              <div className="flex gap-2 sm:w-auto w-full">
                <button
                  onClick={handleCopyUrl}
                  disabled={!boxUrl}
                  className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
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
                <button
                  type="button"
                  onClick={() => window.print()}
                  disabled={!boxUrl}
                  className="flex-1 sm:flex-none px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  <Printer size={18} />
                  Imprimir
                </button>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500 text-center">
            Escaneie este QR Code para acessar o formulário de feedback desta
            box
          </p>
        </div>
      </div>

      {svgTag && (
        <div
          id="qrcode-print-area"
          className="hidden print:block bg-white text-black p-0 m-0"
          style={{
            width: "210mm",
            minHeight: "297mm",
            padding: "15mm",
            boxSizing: "border-box",
          }}
        >
          <div className="flex flex-col min-h-full break-inside-avoid">
            <header className="mb-4 break-inside-avoid">
              <h1 className="text-xl font-bold">{box.name}</h1>
              {box.location && (
                <p className="text-sm text-gray-600">{box.location}</p>
              )}
            </header>
            <p className="text-sm mb-6 break-inside-avoid">
              Escaneie o QR Code abaixo com a câmera do celular para acessar o
              formulário de feedback e deixar sua sugestão.
            </p>
            <div
              className="flex justify-center my-6 break-inside-avoid"
              style={{
                maxWidth: "120mm",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              <div
                className="bg-white border-2 border-gray-300 p-4"
                dangerouslySetInnerHTML={{ __html: svgTag }}
              />
            </div>
            <div className="mt-auto pt-6 break-inside-avoid">
              {showMentionOneBranding ? (
                <div className="flex flex-col items-start gap-2">
                  <Image
                    src="/short-logo.png"
                    alt="Mention One"
                    width={140}
                    height={40}
                    className="h-10 w-auto object-contain object-left"
                  />
                  <p className="text-lg font-semibold text-gray-800">
                    Mention One
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-start gap-2">
                  {boxBranding?.logo_url ? (
                    <Image
                      src={boxBranding.logo_url}
                      alt={boxBranding.client_name || box.name}
                      width={120}
                      height={48}
                      className="max-h-12 w-auto object-contain"
                      unoptimized
                    />
                  ) : null}
                  <p className="text-lg font-semibold text-gray-800">
                    {boxBranding?.client_name || box.name}
                  </p>
                </div>
              )}
            </div>
            <footer className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
              Desenvolvido por MentionOne
            </footer>
          </div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body * {
                visibility: hidden;
              }
              #qrcode-print-area,
              #qrcode-print-area * {
                visibility: visible;
              }
              #qrcode-print-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 210mm;
                min-height: 297mm;
                margin: 0;
                padding: 15mm;
                box-sizing: border-box;
              }
            }
          `,
        }}
      />
    </div>
  );
}
