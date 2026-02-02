"use client";

import { Card } from "@/components/ui/card";
import type { TutorialTopic, TutorialItem } from "./data";
import TutorialVideoCard from "./TutorialVideoCard";

interface TutorialTopicSectionProps {
  topic: TutorialTopic;
  items: TutorialItem[];
  onWatch: (item: TutorialItem) => void;
}

export default function TutorialTopicSection({
  topic,
  items,
  onWatch,
}: TutorialTopicSectionProps) {
  if (items.length === 0) return null;

  return (
    <Card id={`section-${topic.slug}`} className="p-6 scroll-mt-24">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">{topic.label}</h2>
        <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
      </div>
      <ul className="flex flex-col gap-4" aria-label={`Vídeos: ${topic.label}`}>
        {items.map((item) => (
          <li key={item.id}>
            <TutorialVideoCard item={item} onWatch={onWatch} />
          </li>
        ))}
      </ul>
    </Card>
  );
}
