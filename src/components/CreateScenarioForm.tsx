import React, { useState } from "react";
import { useScenarios } from "@/contexts/ScenariosContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Sparkles, X } from "lucide-react";

export const CreateScenarioForm: React.FC = () => {
  const { createScenario, isLoading } = useScenarios();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      await createScenario(formData.title, formData.description);
      toast.success("Cenário criado com alternativas geradas!");
      setFormData({ title: "", description: "" });
      setIsOpen(false);
    } catch (error) {
      toast.error("Erro ao criar cenário");
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
            A IA irá gerar alternativas para você
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
          onClick={() => setIsOpen(false)}
          className="text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título da decisão</Label>
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
          <Label htmlFor="description">Descreva o contexto</Label>
          <Textarea
            id="description"
            placeholder="Descreva a situação, os fatores envolvidos e o que você precisa decidir..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={4}
            className="bg-background resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-1 gap-2">
            <Sparkles className="h-4 w-4" />
            {isLoading ? "Gerando..." : "Criar com IA"}
          </Button>
        </div>
      </form>
    </div>
  );
};
