"use client";

import { use, useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetNPSCampaignBySlugPublic } from "@/hooks/integration/nps-campaigns/queries";
import { useSubmitNPSResponse } from "@/hooks/integration/nps-campaigns/mutations";
import type { NPSCampaignWithQuestions, NPSQuestion, NPSQuestionOption } from "@/src/@backend-types/NPSCampaign";

type Props = { params: Promise<{ slug: string }> };

type AnswersState = {
  npsScore: number | null;
  multipleChoice: { questionId: number; optionId: number }[];
};

export default function NPSFormPage({ params }: Props) {
  const { slug } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const branchSlug = searchParams.get("branch");

  const { data: campaign, isLoading, isError, error } = useGetNPSCampaignBySlugPublic(slug);
  const submitMutation = useSubmitNPSResponse(slug);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AnswersState>({
    npsScore: null,
    multipleChoice: [],
  });

  const questions = campaign?.questions ?? [];
  const totalSteps = questions.length;
  const isSummary = step >= totalSteps && totalSteps > 0;
  const currentQuestion = !isSummary ? questions[step] : null;

  const handleNext = useCallback(() => {
    if (isSummary) return;
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
    } else {
      setStep(totalSteps); // go to summary
    }
  }, [step, totalSteps, isSummary]);

  const handleBack = useCallback(() => {
    if (step > 0) setStep((s) => s - 1);
  }, [step]);

  const setNpsScore = (score: number) => {
    setAnswers((a) => ({ ...a, npsScore: score }));
  };

  const setMultipleChoiceAnswer = (questionId: number, optionId: number) => {
    setAnswers((a) => ({
      ...a,
      multipleChoice: a.multipleChoice.filter((x) => x.questionId !== questionId).concat([{ questionId, optionId }]),
    }));
  };

  const handleSubmit = async () => {
    if (!campaign) return;
    const payload: {
      nps_score?: number | null;
      branch_slug?: string | null;
      answers?: { question_id: number; option_id: number }[];
    } = {
      branch_slug: branchSlug || null,
      answers: answers.multipleChoice.map((a) => ({ question_id: a.questionId, option_id: a.optionId })),
    };
    const hasNpsQuestion = questions.some((q: NPSQuestion) => q.type === "nps");
    if (hasNpsQuestion && answers.npsScore !== null) {
      payload.nps_score = answers.npsScore;
    }
    try {
      await submitMutation.mutateAsync(payload);
      router.push(`/nps/${slug}/thank-you`);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !isSummary) {
        const q = currentQuestion;
        if (q?.type === "nps" && answers.npsScore !== null) handleNext();
        else if (q?.type === "multiple_choice" && answers.multipleChoice.some((a) => a.questionId === q.id)) handleNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentQuestion, answers, isSummary, handleNext]);

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Carregando pesquisa...</p>
      </main>
    );
  }
  if (isError || !campaign) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
        <h1 className="text-xl font-bold text-red-600 mb-2">Pesquisa não encontrada</h1>
        <p className="text-gray-600 text-sm">{error?.message ?? "Link inválido ou pesquisa inativa."}</p>
      </main>
    );
  }

  const progress = totalSteps > 0 ? ((isSummary ? totalSteps : step + 1) / (totalSteps + 1)) * 100 : 0;

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <div className="w-full h-1 bg-gray-200">
        <div
          className="h-full bg-indigo-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-lg mx-auto w-full">
        {isSummary ? (
          <div className="w-full bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Revise suas respostas</h2>
            <ul className="space-y-2 text-sm text-gray-700 mb-6">
              {answers.npsScore !== null && (
                <li>
                  <strong>NPS:</strong> {answers.npsScore}
                </li>
              )}
              {answers.multipleChoice.map((a) => {
                const q = questions.find((x: NPSQuestion) => x.id === a.questionId);
                const opt = q?.options?.find((o: NPSQuestionOption) => o.id === a.optionId);
                return (
                  <li key={`${a.questionId}-${a.optionId}`}>
                    <strong>{q?.title}:</strong> {opt?.label}
                  </li>
                );
              })}
            </ul>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                className="flex-1 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitMutation.isPending ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>
        ) : currentQuestion ? (
          <div className="w-full bg-white rounded-2xl shadow-lg p-8">
            <p className="text-sm text-gray-500 mb-2">
              Pergunta {step + 1} de {totalSteps}
            </p>
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              {currentQuestion.title}
            </h2>
            {currentQuestion.type === "nps" ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 justify-center">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNpsScore(n)}
                      className={`w-12 h-12 rounded-full font-semibold transition ${
                        answers.npsScore === n
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 text-center">
                  0 = muito insatisfeito, 10 = muito satisfeito
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {(currentQuestion.options ?? []).map((opt: NPSQuestionOption) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setMultipleChoiceAnswer(currentQuestion.id, opt.id);
                      if (step < totalSteps - 1) setTimeout(handleNext, 200);
                      else setStep(totalSteps);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition ${
                      answers.multipleChoice.some(
                        (a) => a.questionId === currentQuestion.id && a.optionId === opt.id
                      )
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
            {currentQuestion.type === "nps" && (
              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={answers.npsScore === null}
                  className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">Nenhuma pergunta nesta pesquisa.</p>
        )}
      </div>
    </main>
  );
}
