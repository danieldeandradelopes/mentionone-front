"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TutorialItem } from "./data";

interface TutorialVideoCardProps {
  item: TutorialItem;
  onWatch: (item: TutorialItem) => void;
}

const YOUTUBE_THUMBNAIL = (videoId: string) =>
  `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

export default function TutorialVideoCard({
  item,
  onWatch,
}: TutorialVideoCardProps) {
  return (
    <article
      className={`
        flex flex-col sm:flex-row gap-4 p-4 rounded-xl border transition
        ${item.featured ? "bg-indigo-50/80 border-indigo-200" : "bg-white border-gray-200 hover:border-gray-300"}
      `}
    >
      <button
        type="button"
        onClick={() => onWatch(item)}
        className="relative shrink-0 w-full sm:w-48 aspect-video rounded-lg overflow-hidden bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        aria-label={`Assistir: ${item.title}`}
      >
        <Image
          src={YOUTUBE_THUMBNAIL(item.youtubeVideoId)}
          alt=""
          width={320}
          height={180}
          className="object-cover w-full h-full"
          unoptimized
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition">
          <span className="flex items-center justify-center w-14 h-14 rounded-full bg-white/90 text-indigo-600">
            <Play size={28} fill="currentColor" className="ml-1" />
          </span>
        </span>
        {item.duration && (
          <span className="absolute bottom-2 right-2 px-2 py-0.5 text-xs font-medium bg-black/70 text-white rounded">
            {item.duration}
          </span>
        )}
      </button>
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          {item.featured && (
            <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded">
              Comece por aqui
            </span>
          )}
        </div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">
          {item.title}
        </h3>
        {item.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {item.description}
          </p>
        )}
        <Button type="button" onClick={() => onWatch(item)} className="w-fit">
          Assistir
        </Button>
      </div>
    </article>
  );
}
