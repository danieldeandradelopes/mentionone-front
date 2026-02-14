"use client";

import { use, useState, useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetNPSCampaignBySlugPublic } from "@/hooks/integration/nps-campaigns/queries";
import { useSubmitNPSResponse } from "@/hooks/integration/nps-campaigns/mutations";
import type { NPSQuestion, NPSQuestionOption } from "@/src/@backend-types/NPSCampaign";

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

  const questions = useMemo(() => campaign?.questions ?? [], [campaign?.questions]);
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
    if (step <= 0) return;
    const nextStep = step - 1;
    const questionWeAreGoingTo = questions[nextStep];
    setAnswers((a) => {
      const next = { ...a };
      if (questionWeAreGoingTo?.type === "nps") {
        next.npsScore = null;
      } else if (questionWeAreGoingTo?.type === "multiple_choice" && questionWeAreGoingTo?.id != null) {
        next.multipleChoice = a.multipleChoice.filter((x) => x.questionId !== questionWeAreGoingTo.id);
      }
      return next;
    });
    setStep(nextStep);
  }, [step, questions]);

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
      <main className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-gray-100 px-4">
        <p className="text-gray-500 text-sm sm:text-base">Carregando pesquisa...</p>
      </main>
    );
  }
  if (isError || !campaign) {
    return (
      <main className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center px-4 py-6 sm:p-6 bg-white">
        <h1 className="text-lg sm:text-xl font-bold text-red-600 mb-2 text-center">Pesquisa não encontrada</h1>
        <p className="text-gray-600 text-sm text-center">{error?.message ?? "Link inválido ou pesquisa inativa."}</p>
      </main>
    );
  }

  const progress = totalSteps > 0 ? ((isSummary ? totalSteps : step + 1) / (totalSteps + 1)) * 100 : 0;

  return (
    <main className="min-h-screen min-h-[100dvh] flex flex-col bg-gray-100">
      <div className="w-full h-1.5 sm:h-1 bg-gray-200 shrink-0">
        <div
          className="h-full bg-indigo-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 max-w-lg mx-auto w-full overflow-auto">
        {isSummary ? (
          <div className="w-full bg-white rounded-2xl shadow-md sm:shadow-lg p-5 sm:p-6 md:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Revise suas respostas</h2>
            <ul className="space-y-2 text-sm text-gray-700 mb-5 sm:mb-6">
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
            <div className="flex gap-3 flex-col-reverse sm:flex-row">
              <button
                type="button"
                onClick={handleBack}
                className="w-full sm:w-auto px-4 py-3 sm:py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl sm:rounded-lg font-medium min-h-[44px] sm:min-h-0 touch-manipulation"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                className="w-full sm:flex-1 py-3 sm:py-2.5 bg-indigo-600 text-white font-medium rounded-xl sm:rounded-lg hover:bg-indigo-700 disabled:opacity-50 min-h-[44px] sm:min-h-0 touch-manipulation"
              >
                {submitMutation.isPending ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>
        ) : currentQuestion ? (
          <div className="w-full bg-white rounded-2xl shadow-md sm:shadow-lg p-5 sm:p-6 md:p-8">
            <p className="text-xs sm:text-sm text-gray-500 mb-1.5 sm:mb-2">
              Pergunta {step + 1} de {totalSteps}
            </p>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 leading-snug">
              {currentQuestion.title}
            </h2>
            {currentQuestion.type === "nps" ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNpsScore(n)}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full font-semibold transition-colors touch-manipulation text-sm sm:text-base ${
                        answers.npsScore === n
                          ? "bg-indigo-600 text-white ring-2 ring-indigo-300"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 text-center px-1">
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
                    className={`w-full text-left px-4 py-3.5 sm:py-3 rounded-xl border-2 transition-colors min-h-[48px] sm:min-h-[44px] touch-manipulation ${
                      answers.multipleChoice.some(
                        (a) => a.questionId === currentQuestion.id && a.optionId === opt.id
                      )
                        ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                        : "border-gray-200 hover:border-gray-300 active:border-gray-400"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
            {currentQuestion.type === "nps" && (
              <div className="mt-6 sm:mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={answers.npsScore === null}
                  className="w-full sm:w-auto px-6 py-3 sm:py-2.5 bg-indigo-600 text-white font-medium rounded-xl sm:rounded-lg hover:bg-indigo-700 disabled:opacity-50 min-h-[44px] sm:min-h-0 touch-manipulation"
                >
                  Próxima
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-sm sm:text-base">Nenhuma pergunta nesta pesquisa.</p>
        )}
      </div>
    </main>
  );
}
