"use client";

import { useState, useId } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { NPSCampaignWithQuestions, NPSQuestionInput } from "@/src/@backend-types/NPSCampaign";
import { GripVertical, Trash2, Plus } from "lucide-react";

export type OptionFormItem = { label: string; order?: number; tempId?: string };
export type QuestionFormItem = NPSQuestionInput & {
  tempId: string;
  options?: OptionFormItem[];
};

type CampaignFormProps = {
  initialData?: NPSCampaignWithQuestions | null;
  defaultName?: string;
  defaultSlug?: string;
  defaultActive?: boolean;
  onSubmit: (data: {
    name: string;
    slug?: string;
    active?: boolean;
    questions: NPSQuestionInput[];
  }) => Promise<void>;
  isSubmitting: boolean;
  submitLabel: string;
};

function slugFromName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function SortableQuestionRow({
  item,
  onUpdate,
  onRemove,
  onAddOption,
  onRemoveOption,
  onOptionLabelChange,
}: {
  item: QuestionFormItem;
  onUpdate: (tempId: string, data: Partial<QuestionFormItem>) => void;
  onRemove: (tempId: string) => void;
  onAddOption: (questionTempId: string) => void;
  onRemoveOption: (questionTempId: string, optionTempId: string) => void;
  onOptionLabelChange: (questionTempId: string, optionTempId: string, label: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.tempId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const options: OptionFormItem[] = item.options ?? [];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border bg-white p-4 ${isDragging ? "opacity-50 shadow-lg" : "border-gray-200"}`}
    >
      <div className="flex gap-3">
        <button
          type="button"
          className="touch-none cursor-grab active:cursor-grabbing mt-1 p-1 text-gray-400 hover:text-gray-600"
          {...attributes}
          {...listeners}
          aria-label="Arrastar para reordenar"
        >
          <GripVertical size={18} />
        </button>
        <div className="flex-1 space-y-3">
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              value={item.title}
              onChange={(e) => onUpdate(item.tempId, { title: e.target.value })}
              placeholder="Texto da pergunta"
              className="flex-1 min-w-[200px] rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <select
              value={item.type}
              onChange={(e) =>
                onUpdate(item.tempId, {
                  type: e.target.value as "nps" | "multiple_choice",
                })
              }
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="nps">NPS (0-10)</option>
              <option value="multiple_choice">Múltipla escolha</option>
            </select>
            <button
              type="button"
              onClick={() => onRemove(item.tempId)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              aria-label="Remover pergunta"
            >
              <Trash2 size={18} />
            </button>
          </div>
          {item.type === "multiple_choice" && (
            <div className="pl-2 border-l-2 border-gray-100 space-y-2">
              <span className="text-xs font-medium text-gray-500">
                Opções de resposta
              </span>
              {options.map((opt) => (
                <div
                  key={opt.tempId ?? opt.label}
                  className="flex gap-2 items-center"
                >
                  <input
                    type="text"
                    value={opt.label}
                    onChange={(e) =>
                      onOptionLabelChange(
                        item.tempId,
                        opt.tempId ?? opt.label,
                        e.target.value
                      )
                    }
                    placeholder="Texto da opção"
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onRemoveOption(item.tempId, opt.tempId ?? opt.label)
                    }
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                    aria-label="Remover opção"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => onAddOption(item.tempId)}
                className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded"
              >
                <Plus size={14} />
                Adicionar opção
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CampaignForm({
  initialData,
  defaultName = "",
  defaultSlug = "",
  defaultActive = true,
  onSubmit,
  isSubmitting,
  submitLabel,
}: CampaignFormProps) {
  const [name, setName] = useState(
    initialData?.name ?? defaultName
  );
  const [slug, setSlug] = useState(
    initialData?.slug ?? defaultSlug
  );
  const [active, setActive] = useState(
    initialData?.active ?? defaultActive
  );
  const [questions, setQuestions] = useState<QuestionFormItem[]>(() => {
    if (initialData?.questions?.length) {
      return initialData.questions.map((q, i) => ({
        tempId: `q-${q.id}-${i}`,
        title: q.title,
        type: q.type,
        order: i,
        options: (q.options ?? []).map((o, j) => ({
          label: o.label,
          order: j,
          tempId: `o-${o.id}-${j}`,
        })),
      }));
    }
    return [];
  });
  const uid = useId();

  const questionIds = questions.map((q) => q.tempId);

  const sensors = useSensors(
    useSensor(PointerSensor as Parameters<typeof useSensor>[0], { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor as Parameters<typeof useSensor>[0], { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;
    const oldIndex = questions.findIndex((q) => q.tempId === activeId);
    const newIndex = questions.findIndex((q) => q.tempId === overId);
    if (oldIndex === -1 || newIndex === -1) return;
    setQuestions(arrayMove(questions, oldIndex, newIndex));
  };

  const updateQuestion = (tempId: string, data: Partial<QuestionFormItem>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.tempId === tempId ? { ...q, ...data } : q))
    );
  };

  const removeQuestion = (tempId: string) => {
    setQuestions((prev) => prev.filter((q) => q.tempId !== tempId));
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        tempId: `new-${uid}-${Date.now()}`,
        title: "",
        type: "nps" as const,
        order: prev.length,
      },
    ]);
  };

  const addOption = (questionTempId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.tempId !== questionTempId) return q;
        const opts = q.options ?? [];
        return {
          ...q,
          options: [
            ...opts,
            { label: "", order: opts.length, tempId: `opt-${Date.now()}` },
          ],
        };
      })
    );
  };

  const removeOption = (questionTempId: string, optionTempId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.tempId !== questionTempId) return q;
        return {
          ...q,
          options: (q.options ?? []).filter(
            (o: OptionFormItem) => (o.tempId ?? o.label) !== optionTempId
          ),
        };
      })
    );
  };

  const changeOptionLabel = (
    questionTempId: string,
    optionTempId: string,
    label: string
  ) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.tempId !== questionTempId) return q;
        return {
          ...q,
          options: (q.options ?? []).map((o: OptionFormItem) =>
            (o.tempId ?? o.label) === optionTempId ? { ...o, label } : o
          ),
        };
      })
    );
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!initialData && !slug) setSlug(slugFromName(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      active,
      questions: questions.map((q, i) => ({
        title: q.title.trim(),
        type: q.type,
        order: i,
        options:
          q.type === "multiple_choice" && q.options?.length
            ? q.options.map((o, j) => ({ label: o.label.trim(), order: j }))
            : undefined,
      })),
    };
    await onSubmit(payload);
  };

  const inputBase =
    "rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome da campanha *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            placeholder="Ex: NPS Loja Centro – Jan/25"
            className={`w-full ${inputBase}`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug (URL) *
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.replace(/[^a-z0-9-]/g, "-").toLowerCase())}
            placeholder="nps-loja-centro"
            className={`w-full ${inputBase}`}
          />
          <p className="text-xs text-gray-500 mt-1">
            Link da pesquisa: /nps/<strong>{slug || "…"}</strong>
          </p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Campanha ativa</span>
        </label>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Perguntas</h2>
          <button
            type="button"
            onClick={addQuestion}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg"
          >
            <Plus size={16} />
            Adicionar pergunta
          </button>
        </div>
        {questions.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">
            Nenhuma pergunta. Adicione pelo menos uma (ex.: NPS 0-10 ou
            múltipla escolha).
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={questionIds}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {questions.map((item) => (
                  <SortableQuestionRow
                    key={item.tempId}
                    item={item}
                    onUpdate={updateQuestion}
                    onRemove={removeQuestion}
                    onAddOption={addOption}
                    onRemoveOption={removeOption}
                    onOptionLabelChange={changeOptionLabel}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || questions.length === 0}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Salvando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
