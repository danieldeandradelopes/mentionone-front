"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface TutorialVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  youtubeVideoId: string;
}

export default function TutorialVideoModal({
  isOpen,
  onClose,
  title,
  youtubeVideoId,
}: TutorialVideoModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const embedUrl = `https://www.youtube.com/embed/${youtubeVideoId}?autoplay=0`;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-video-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className="relative w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] flex flex-col bg-gray-900 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 border-b border-gray-700 shrink-0">
          <h2
            id="tutorial-video-title"
            className="text-base sm:text-lg font-semibold text-white truncate flex-1 min-w-0"
          >
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className={cn(
              "shrink-0 p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-800",
              "focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900",
            )}
            aria-label="Fechar vídeo"
          >
            <X size={22} />
          </button>
        </div>
        <div className="relative w-full flex-1 min-h-0 aspect-video">
          <iframe
            src={embedUrl}
            title={title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
