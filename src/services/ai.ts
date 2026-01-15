// AI service - generates concrete decision alternatives via Lovable AI Gateway

import { supabase } from "@/integrations/supabase/client";

interface GeneratedAlternative {
  text: string;
}

export const aiService = {
  generateAlternatives: async (
    title: string,
    description: string,
    count: number = 3
  ): Promise<GeneratedAlternative[]> => {
    const { data, error } = await supabase.functions.invoke("generate-alternatives", {
      body: { title, description, count },
    });

    if (error) {
      console.error("Error generating alternatives:", error);
      throw new Error(error.message || "Erro ao gerar alternativas");
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    if (!data?.alternatives || !Array.isArray(data.alternatives)) {
      throw new Error("Resposta inválida da IA");
    }

    return data.alternatives.map((text: string) => ({ text }));
  },

  validateContext: (description: string): { valid: boolean; message?: string } => {
    if (!description || description.trim().length < 20) {
      return {
        valid: false,
        message: "Descreva melhor o contexto da sua decisão (mínimo 20 caracteres). Inclua fatores como objetivos, restrições, preferências e critérios importantes.",
      };
    }
    return { valid: true };
  },
};
