// AI service - generates placeholder alternatives
// Currently simulates AI generation

interface GeneratedAlternative {
  text: string;
}

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
  ): Promise<GeneratedAlternative[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate contextual alternatives based on input
    const alternatives: GeneratedAlternative[] = [];
    const usedIndices = new Set<number>();

    for (let i = 0; i < count; i++) {
      let index: number;
      do {
        index = Math.floor(Math.random() * alternativeTemplates.length);
      } while (usedIndices.has(index) && usedIndices.size < alternativeTemplates.length);
      
      usedIndices.add(index);

      alternatives.push({
        text: `${alternativeTemplates[index]} para "${title.slice(0, 30)}${title.length > 30 ? '...' : ''}"`,
      });
    }

    return alternatives;
  },
};
