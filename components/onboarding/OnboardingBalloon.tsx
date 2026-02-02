"use client";

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface OnboardingBalloonProps {
  onStart: () => void;
  onLater: () => void;
  onDismiss: () => void;
  isDismissing: boolean;
}

export default function OnboardingBalloon({
  onStart,
  onLater,
  onDismiss,
  isDismissing,
}: OnboardingBalloonProps) {
  return (
    <>
      {/* Fundo escurecido para destacar o card */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
        aria-hidden="true"
      />
      <div
        role="region"
        aria-label="Configuração inicial"
        className="fixed left-4 right-4 top-1/2 z-50 mx-auto max-w-lg -translate-y-1/2 rounded-2xl border-2 border-indigo-500 bg-white p-6 shadow-2xl ring-4 ring-indigo-500/20"
      >
        <div className="flex gap-4">
          <div className="shrink-0 flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-500 text-white shadow-lg">
            <Sparkles size={28} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xl font-bold text-gray-900">
              Complete sua configuração
            </p>
            <p className="mt-1.5 text-base text-gray-600">
              Em poucos passos configure sua empresa e a primeira caixa de
              feedback.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={onStart}
                className="px-6 py-2.5 text-base font-semibold"
              >
                Começar
              </Button>
              <button
                type="button"
                onClick={onLater}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 rounded-lg transition"
              >
                Agora não
              </button>
              <button
                type="button"
                onClick={onDismiss}
                disabled={isDismissing}
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition disabled:opacity-50"
              >
                {isDismissing ? "Salvando..." : "Não mostrar de novo"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
