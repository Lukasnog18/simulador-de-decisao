import { Alternative } from "@/types";

// AI service - prepared for Lovable AI integration
// Currently generates placeholder alternatives

const generateId = () => crypto.randomUUID();

const alternativeTemplates = [
  "Considerar os impactos a longo prazo desta escolha",
  "Avaliar os recursos necessários para implementação",
  "Consultar stakeholders relevantes antes de decidir",
  "Criar um plano de contingência para riscos identificados",
  "Estabelecer métricas de sucesso para acompanhamento",
  "Realizar uma análise de custo-benefício detalhada",
  "Identificar dependências e pré-requisitos",
  "Definir um cronograma realista de execução",
];

export const aiService = {
  generateAlternatives: async (
    title: string,
    description: string,
    count: number = 3
  ): Promise<Alternative[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate contextual alternatives based on input
    const alternatives: Alternative[] = [];
    const usedIndices = new Set<number>();

    for (let i = 0; i < count; i++) {
      let index: number;
      do {
        index = Math.floor(Math.random() * alternativeTemplates.length);
      } while (usedIndices.has(index) && usedIndices.size < alternativeTemplates.length);
      
      usedIndices.add(index);

      alternatives.push({
        id: generateId(),
        text: `${alternativeTemplates[index]} para "${title.slice(0, 30)}${title.length > 30 ? '...' : ''}"`,
        createdAt: new Date(),
      });
    }

    return alternatives;
  },
};

// TODO: Replace with actual Lovable AI integration
// export const aiService = {
//   generateAlternatives: async (title: string, description: string, count: number = 3) => {
//     const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-alternatives`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
//       },
//       body: JSON.stringify({ title, description, count }),
//     });
//     return response.json();
//   },
// };
