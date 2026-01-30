import { useSubscription } from "./use-subscription";
import { PlanFeatures } from "@/@backend-types/Plan";

export function usePlanFeatures() {
  const { subscription } = useSubscription();

  const features: PlanFeatures | null = subscription?.features || null;

  /**
   * Verifica se uma feature está disponível
   */
  const hasFeature = (
    key: keyof Pick<
      PlanFeatures,
      | "can_access_reports"
      | "can_access_advanced_charts"
      | "can_filter_feedbacks"
      | "can_export_csv"
      | "show_mentionone_branding"
    >,
  ): boolean => {
    if (!features) {
      // Sem subscription = plano Free
      // Features booleanas são false no Free, exceto show_mentionone_branding
      if (key === "show_mentionone_branding") {
        return true;
      }
      return false;
    }
    const value = features[key];
    return typeof value === "boolean" ? value : false;
  };

  /**
   * Obtém o valor de uma feature numérica
   */
  const getFeatureValue = <
    K extends keyof Pick<PlanFeatures, "max_boxes" | "max_responses_per_month">,
  >(
    key: K,
  ): PlanFeatures[K] | null => {
    if (!features) {
      // Sem subscription = plano Free
      if (key === "max_boxes") {
        return 1 as PlanFeatures[K];
      }
      if (key === "max_responses_per_month") {
        return 15 as PlanFeatures[K];
      }
      return null;
    }
    return features[key] ?? null;
  };

  /**
   * Verifica se tem limite de caixas
   */
  const hasBoxLimit = (): boolean => {
    const maxBoxes = getFeatureValue("max_boxes");
    return maxBoxes !== null;
  };

  /**
   * Obtém o limite de caixas
   */
  const getMaxBoxes = (): number | null => {
    return getFeatureValue("max_boxes");
  };

  /**
   * Verifica se tem limite de respostas por mês
   */
  const hasResponseLimit = (): boolean => {
    const maxResponses = getFeatureValue("max_responses_per_month");
    return maxResponses !== null;
  };

  /**
   * Obtém o limite de respostas por mês
   */
  const getMaxResponsesPerMonth = (): number | null => {
    return getFeatureValue("max_responses_per_month");
  };

  return {
    features,
    hasFeature,
    getFeatureValue,
    hasBoxLimit,
    getMaxBoxes,
    hasResponseLimit,
    getMaxResponsesPerMonth,
  };
}
