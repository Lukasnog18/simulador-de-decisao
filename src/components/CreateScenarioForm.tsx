import React, { useState } from "react";
import { useScenarios } from "@/contexts/ScenariosContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Sparkles, X, AlertCircle } from "lucide-react";
import { aiService } from "@/services/ai";

export const CreateScenarioForm: React.FC = () => {
  const { createScenario, isLoading } = useScenarios();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [contextWarning, setContextWarning] = useState<string | null>(null);

  const handleDescriptionChange = (value: string) => {
    setFormData({ ...formData, description: value });
    
    // Clear warning while typing if context becomes valid
    if (contextWarning && value.trim().length >= 20) {
      setContextWarning(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Informe o título da decisão");
      return;
    }

    // Validate context
    const validation = aiService.validateContext(formData.description);
    if (!validation.valid) {
      setContextWarning(validation.message || null);
      toast.warning("Contexto insuficiente", {
        description: "Descreva melhor a situação para gerar alternativas mais úteis.",
      });
      return;
    }

    setContextWarning(null);

    try {
      await createScenario(formData.title, formData.description);
      toast.success("Cenário criado com alternativas concretas!");
      setFormData({ title: "", description: "" });
      setIsOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao criar cenário";
      toast.error(message);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="group w-full rounded-lg border-2 border-dashed border-border bg-card/50 p-6 text-center transition-all hover:border-primary/50 hover:bg-card"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-full bg-primary/10 p-3 transition-colors group-hover:bg-primary/20">
            <Plus className="h-5 w-5 text-primary" />
          </div>
          <span className="font-medium text-foreground">
            Novo cenário de decisão
          </span>
          <span className="text-sm text-muted-foreground">
            A IA irá gerar opções concretas de escolha
          </span>
        </div>
      </button>
    );
  }

  return (
    <div className="animate-fade-in rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold">
          Novo cenário de decisão
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsOpen(false);
            setContextWarning(null);
          }}
          className="text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Qual decisão você precisa tomar?</Label>
          <Input
            id="title"
            placeholder="Ex: Escolha de tecnologia para o projeto"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            Descreva o contexto da decisão
          </Label>
          <p className="text-xs text-muted-foreground">
            Inclua objetivos, restrições, preferências e critérios importantes. Quanto mais detalhes, melhores serão as alternativas geradas.
          </p>
          <Textarea
            id="description"
            placeholder="Ex: Projeto pessoal com foco em rapidez de desenvolvimento, baixo custo de hospedagem e oportunidade de aprendizado. Tenho experiência com JavaScript mas quero algo produtivo."
            value={formData.description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            rows={4}
            className={`bg-background resize-none ${contextWarning ? "border-amber-500 focus-visible:ring-amber-500" : ""}`}
          />
          {contextWarning && (
            <div className="flex items-start gap-2 rounded-md bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{contextWarning}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsOpen(false);
              setContextWarning(null);
            }}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-1 gap-2">
            <Sparkles className="h-4 w-4" />
            {isLoading ? "Gerando..." : "Gerar alternativas"}
          </Button>
        </div>
      </form>
    </div>
  );
};
