import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `Você é um especialista em tomada de decisão que gera alternativas concretas e específicas.

REGRAS OBRIGATÓRIAS:
1. Cada alternativa deve representar uma OPÇÃO REAL e DISTINTA de escolha
2. As alternativas devem ser MUTUAMENTE EXCLUSIVAS sempre que possível
3. NUNCA use termos genéricos como: "avaliar", "analisar", "consultar", "estudar", "definir", "planejar", "considerar"
4. NUNCA gere etapas de processo, checklist, boas práticas ou conselhos abstratos
5. As alternativas devem ser ESPECÍFICAS, OBJETIVAS e diretamente relacionadas ao contexto
6. Cada alternativa deve ser uma ação concreta que o usuário pode escolher fazer

EXEMPLOS CORRETOS:
- "Usar Next.js com Supabase" (alternativa de tecnologia)
- "Morar em uma capital com maior oferta de serviços" (alternativa de local)
- "Contratar um desenvolvedor freelancer" (alternativa de recursos)

EXEMPLOS INCORRETOS (NUNCA FAÇA ISSO):
- "Avaliar os prós e contras de cada opção" (processo, não decisão)
- "Consultar especialistas na área" (conselho, não alternativa)
- "Definir critérios de sucesso" (metodologia, não escolha)

Se o contexto for vago demais, gere alternativas gerais mas ainda assim concretas e acionáveis.

Responda APENAS com um JSON no formato: {"alternatives": ["alternativa 1", "alternativa 2", "alternativa 3"]}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, count = 3 } = await req.json();

    if (!title || title.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Título é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const userPrompt = `Gere ${count} alternativas concretas de decisão para:

TÍTULO DA DECISÃO: ${title}

${description ? `CONTEXTO: ${description}` : "CONTEXTO: Não fornecido pelo usuário"}

Lembre-se: as alternativas devem ser OPÇÕES REAIS de escolha, não sugestões de processo ou metodologia.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos à sua conta." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erro ao gerar alternativas");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Resposta vazia da IA");
    }

    // Parse JSON from response
    let alternatives: string[];
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        alternatives = parsed.alternatives || [];
      } else {
        // Fallback: split by newlines if not JSON
        alternatives = content
          .split("\n")
          .filter((line: string) => line.trim().length > 0)
          .slice(0, count);
      }
    } catch {
      // Fallback parsing
      alternatives = content
        .split("\n")
        .filter((line: string) => line.trim().length > 0 && !line.startsWith("{") && !line.startsWith("}"))
        .map((line: string) => line.replace(/^[\d\.\-\*]+\s*/, "").trim())
        .filter((line: string) => line.length > 0)
        .slice(0, count);
    }

    if (alternatives.length === 0) {
      throw new Error("Não foi possível gerar alternativas");
    }

    return new Response(
      JSON.stringify({ alternatives }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-alternatives error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
