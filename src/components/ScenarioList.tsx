import React from "react";
import { useScenarios } from "@/contexts/ScenariosContext";
import { ScenarioCard } from "./ScenarioCard";
import { CreateScenarioForm } from "./CreateScenarioForm";
import { FileQuestion } from "lucide-react";

export const ScenarioList: React.FC = () => {
  const { scenarios, isLoading } = useScenarios();

  return (
    <div className="space-y-6">
      <CreateScenarioForm />

      {isLoading && scenarios.length === 0 ? (
        <div className="py-12 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : scenarios.length === 0 ? (
        <div className="py-12 text-center">
          <FileQuestion className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">
            Nenhum cenário criado ainda
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie seu primeiro cenário de decisão acima
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {scenarios.map((scenario) => (
            <ScenarioCard key={scenario.id} scenario={scenario} />
          ))}
        </div>
      )}
    </div>
  );
};
