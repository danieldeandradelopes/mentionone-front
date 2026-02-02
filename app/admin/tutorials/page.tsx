"use client";

import { useMemo, useState, useCallback } from "react";
import {
  TUTORIAL_TOPICS,
  getTutorialsByTopic,
  type TutorialItem,
} from "./data";
import TutorialTopicSection from "./TutorialTopicSection";
import TutorialVideoModal from "./TutorialVideoModal";
import { Search } from "lucide-react";
import { cn } from "@/app/lib/utils";

function matchesSearch(item: TutorialItem, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  return (
    item.title.toLowerCase().includes(q) ||
    (item.description?.toLowerCase().includes(q) ?? false)
  );
}

function getFilteredData(
  tutorialsByTopic: Map<string, TutorialItem[]>,
  searchQuery: string,
  topicSlug: string | null,
) {
  const filteredByTopic = new Map<string, TutorialItem[]>();

  const topicsToConsider =
    topicSlug !== null
      ? TUTORIAL_TOPICS.filter((t) => t.slug === topicSlug)
      : TUTORIAL_TOPICS;

  for (const topic of topicsToConsider) {
    const items = tutorialsByTopic.get(topic.slug) ?? [];
    const filtered = items.filter((item) => matchesSearch(item, searchQuery));
    if (filtered.length > 0) {
      filteredByTopic.set(topic.slug, filtered);
    }
  }

  return filteredByTopic;
}

export default function TutorialsPage() {
  const [modalVideo, setModalVideo] = useState<TutorialItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [topicFilter, setTopicFilter] = useState<string | null>(null);

  const tutorialsByTopic = useMemo(() => getTutorialsByTopic(), []);

  const filteredByTopic = useMemo(
    () => getFilteredData(tutorialsByTopic, searchQuery, topicFilter),
    [tutorialsByTopic, searchQuery, topicFilter],
  );

  const visibleTopics = useMemo(
    () => TUTORIAL_TOPICS.filter((t) => filteredByTopic.has(t.slug)),
    [filteredByTopic],
  );

  const setTopicByPill = useCallback((slug: string | null) => {
    setTopicFilter((current) => (current === slug ? null : slug));
  }, []);

  const handleWatch = (item: TutorialItem) => {
    setModalVideo(item);
  };

  const handleCloseModal = () => {
    setModalVideo(null);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setTopicFilter(null);
  };

  const hasActiveFilters = searchQuery.trim() !== "" || topicFilter !== null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-800">Tutoriais</h1>
        <p className="text-gray-600 mt-1">
          Vídeos para configurar e usar todas as funcionalidades do MentionOne.
        </p>
      </header>

      {/* Barra de busca, filtro e navegação — acima do conteúdo */}
      <div className="flex flex-col gap-4 p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="relative flex-1 min-w-0">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="search"
              placeholder="Buscar por título ou assunto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              aria-label="Buscar tutoriais"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="min-w-[140px] sm:min-w-0">
              <label
                htmlFor="topic-filter"
                className="sr-only sm:not-sr-only sm:block text-xs font-medium text-gray-500 mb-1"
              >
                Categoria
              </label>
              <select
                id="topic-filter"
                value={topicFilter ?? ""}
                onChange={(e) =>
                  setTopicFilter(e.target.value === "" ? null : e.target.value)
                }
                className="w-full sm:w-auto min-w-0 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              >
                <option value="">Todas</option>
                {TUTORIAL_TOPICS.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 whitespace-nowrap"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        <nav
          className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100"
          aria-label="Filtrar por assunto"
        >
          <span className="text-xs font-medium text-gray-500 mr-1 shrink-0">
            Assunto:
          </span>
          <button
            type="button"
            onClick={() => setTopicByPill(null)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition",
              "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1",
              topicFilter === null
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900",
            )}
          >
            Todas
          </button>
          {TUTORIAL_TOPICS.map((topic) => {
            const isSelected = topicFilter === topic.slug;
            return (
              <button
                key={topic.slug}
                type="button"
                onClick={() => setTopicByPill(topic.slug)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium transition",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1",
                  isSelected
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900",
                )}
              >
                {topic.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Conteúdo */}
      <div className="flex flex-col gap-8">
        {visibleTopics.map((topic) => {
          const items = filteredByTopic.get(topic.slug) ?? [];
          return (
            <TutorialTopicSection
              key={topic.slug}
              topic={topic}
              items={items}
              onWatch={handleWatch}
            />
          );
        })}
        {visibleTopics.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
            Nenhum tutorial encontrado. Tente outros termos ou outra categoria.
          </div>
        )}
      </div>

      <TutorialVideoModal
        isOpen={!!modalVideo}
        onClose={handleCloseModal}
        title={modalVideo?.title ?? ""}
        youtubeVideoId={modalVideo?.youtubeVideoId ?? ""}
      />
    </div>
  );
}
