import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Scenario, Alternative } from "@/types";
import { scenarioStorage } from "@/services/storage";
import { aiService } from "@/services/ai";
import { useAuth } from "./AuthContext";

interface ScenariosContextType {
  scenarios: Scenario[];
  isLoading: boolean;
  createScenario: (title: string, description: string) => Promise<Scenario>;
  updateScenario: (id: string, updates: Partial<Pick<Scenario, "title" | "description">>) => void;
  deleteScenario: (id: string) => void;
  addAlternative: (scenarioId: string, text: string) => void;
  updateAlternative: (scenarioId: string, alternativeId: string, text: string) => void;
  deleteAlternative: (scenarioId: string, alternativeId: string) => void;
  regenerateAlternatives: (scenarioId: string) => Promise<void>;
}

const ScenariosContext = createContext<ScenariosContextType | null>(null);

export const useScenarios = () => {
  const context = useContext(ScenariosContext);
  if (!context) {
    throw new Error("useScenarios must be used within a ScenariosProvider");
  }
  return context;
};

interface ScenariosProviderProps {
  children: ReactNode;
}

export const ScenariosProvider: React.FC<ScenariosProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const userScenarios = scenarioStorage.getAll(user.id);
      setScenarios(userScenarios.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
    } else {
      setScenarios([]);
    }
    setIsLoading(false);
  }, [user]);

  const createScenario = async (title: string, description: string): Promise<Scenario> => {
    if (!user) throw new Error("Usuário não autenticado");

    setIsLoading(true);

    try {
      const alternatives = await aiService.generateAlternatives(title, description, 3);

      const scenario: Scenario = {
        id: crypto.randomUUID(),
        userId: user.id,
        title,
        description,
        alternatives,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      scenarioStorage.save(scenario);
      setScenarios((prev) => [scenario, ...prev]);
      return scenario;
    } finally {
      setIsLoading(false);
    }
  };

  const updateScenario = (id: string, updates: Partial<Pick<Scenario, "title" | "description">>) => {
    setScenarios((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = { ...s, ...updates, updatedAt: new Date() };
          scenarioStorage.save(updated);
          return updated;
        }
        return s;
      })
    );
  };

  const deleteScenario = (id: string) => {
    scenarioStorage.delete(id);
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  };

  const addAlternative = (scenarioId: string, text: string) => {
    const newAlternative: Alternative = {
      id: crypto.randomUUID(),
      text,
      createdAt: new Date(),
    };

    setScenarios((prev) =>
      prev.map((s) => {
        if (s.id === scenarioId) {
          const updated = {
            ...s,
            alternatives: [...s.alternatives, newAlternative],
            updatedAt: new Date(),
          };
          scenarioStorage.save(updated);
          return updated;
        }
        return s;
      })
    );
  };

  const updateAlternative = (scenarioId: string, alternativeId: string, text: string) => {
    setScenarios((prev) =>
      prev.map((s) => {
        if (s.id === scenarioId) {
          const updated = {
            ...s,
            alternatives: s.alternatives.map((a) =>
              a.id === alternativeId ? { ...a, text } : a
            ),
            updatedAt: new Date(),
          };
          scenarioStorage.save(updated);
          return updated;
        }
        return s;
      })
    );
  };

  const deleteAlternative = (scenarioId: string, alternativeId: string) => {
    setScenarios((prev) =>
      prev.map((s) => {
        if (s.id === scenarioId && s.alternatives.length > 1) {
          const updated = {
            ...s,
            alternatives: s.alternatives.filter((a) => a.id !== alternativeId),
            updatedAt: new Date(),
          };
          scenarioStorage.save(updated);
          return updated;
        }
        return s;
      })
    );
  };

  const regenerateAlternatives = async (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!scenario) return;

    setIsLoading(true);
    try {
      const newAlternatives = await aiService.generateAlternatives(
        scenario.title,
        scenario.description,
        3
      );

      setScenarios((prev) =>
        prev.map((s) => {
          if (s.id === scenarioId) {
            const updated = {
              ...s,
              alternatives: [...s.alternatives, ...newAlternatives],
              updatedAt: new Date(),
            };
            scenarioStorage.save(updated);
            return updated;
          }
          return s;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScenariosContext.Provider
      value={{
        scenarios,
        isLoading,
        createScenario,
        updateScenario,
        deleteScenario,
        addAlternative,
        updateAlternative,
        deleteAlternative,
        regenerateAlternatives,
      }}
    >
      {children}
    </ScenariosContext.Provider>
  );
};
