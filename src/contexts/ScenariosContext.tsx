import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Scenario, Alternative } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { aiService } from "@/services/ai";
import { useAuth } from "./AuthContext";

interface ScenariosContextType {
  scenarios: Scenario[];
  isLoading: boolean;
  createScenario: (title: string, description: string) => Promise<Scenario>;
  updateScenario: (id: string, updates: Partial<Pick<Scenario, "title" | "description">>) => Promise<void>;
  deleteScenario: (id: string) => Promise<void>;
  addAlternative: (scenarioId: string, content: string) => Promise<void>;
  updateAlternative: (scenarioId: string, alternativeId: string, content: string) => Promise<void>;
  deleteAlternative: (scenarioId: string, alternativeId: string) => Promise<void>;
  regenerateAlternatives: (scenarioId: string) => Promise<void>;
  refreshScenarios: () => Promise<void>;
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

  const fetchScenarios = useCallback(async () => {
    if (!user) {
      setScenarios([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch scenarios
      const { data: scenariosData, error: scenariosError } = await supabase
        .from("scenarios")
        .select("*")
        .order("updated_at", { ascending: false });

      if (scenariosError) throw scenariosError;

      // Fetch all alternatives for these scenarios
      const scenarioIds = scenariosData?.map((s) => s.id) || [];
      
      let alternativesData: Alternative[] = [];
      if (scenarioIds.length > 0) {
        const { data, error: alternativesError } = await supabase
          .from("alternatives")
          .select("*")
          .in("scenario_id", scenarioIds)
          .order("created_at", { ascending: true });

        if (alternativesError) throw alternativesError;
        alternativesData = data || [];
      }

      // Map alternatives to scenarios
      const scenariosWithAlternatives: Scenario[] = (scenariosData || []).map((scenario) => ({
        ...scenario,
        alternatives: alternativesData.filter((alt) => alt.scenario_id === scenario.id),
      }));

      setScenarios(scenariosWithAlternatives);
    } catch (error) {
      console.error("Error fetching scenarios:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  const createScenario = async (title: string, description: string): Promise<Scenario> => {
    if (!user) throw new Error("Usuário não autenticado");

    setIsLoading(true);
    try {
      // Generate AI alternatives
      const generatedAlternatives = await aiService.generateAlternatives(title, description, 3);

      // Insert scenario
      const { data: scenarioData, error: scenarioError } = await supabase
        .from("scenarios")
        .insert({
          user_id: user.id,
          title,
          description,
        })
        .select()
        .single();

      if (scenarioError) throw scenarioError;

      // Insert alternatives
      const alternativesToInsert = generatedAlternatives.map((alt) => ({
        scenario_id: scenarioData.id,
        content: alt.text,
      }));

      const { data: alternativesData, error: alternativesError } = await supabase
        .from("alternatives")
        .insert(alternativesToInsert)
        .select();

      if (alternativesError) throw alternativesError;

      const newScenario: Scenario = {
        ...scenarioData,
        alternatives: alternativesData || [],
      };

      setScenarios((prev) => [newScenario, ...prev]);
      return newScenario;
    } finally {
      setIsLoading(false);
    }
  };

  const updateScenario = async (id: string, updates: Partial<Pick<Scenario, "title" | "description">>) => {
    const { error } = await supabase
      .from("scenarios")
      .update(updates)
      .eq("id", id);

    if (error) throw error;

    setScenarios((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s
      )
    );
  };

  const deleteScenario = async (id: string) => {
    const { error } = await supabase
      .from("scenarios")
      .delete()
      .eq("id", id);

    if (error) throw error;

    setScenarios((prev) => prev.filter((s) => s.id !== id));
  };

  const addAlternative = async (scenarioId: string, content: string) => {
    const { data, error } = await supabase
      .from("alternatives")
      .insert({
        scenario_id: scenarioId,
        content,
      })
      .select()
      .single();

    if (error) throw error;

    setScenarios((prev) =>
      prev.map((s) => {
        if (s.id === scenarioId) {
          return {
            ...s,
            alternatives: [...s.alternatives, data],
            updated_at: new Date().toISOString(),
          };
        }
        return s;
      })
    );
  };

  const updateAlternative = async (scenarioId: string, alternativeId: string, content: string) => {
    const { error } = await supabase
      .from("alternatives")
      .update({ content })
      .eq("id", alternativeId);

    if (error) throw error;

    setScenarios((prev) =>
      prev.map((s) => {
        if (s.id === scenarioId) {
          return {
            ...s,
            alternatives: s.alternatives.map((a) =>
              a.id === alternativeId ? { ...a, content } : a
            ),
            updated_at: new Date().toISOString(),
          };
        }
        return s;
      })
    );
  };

  const deleteAlternative = async (scenarioId: string, alternativeId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!scenario || scenario.alternatives.length <= 1) {
      throw new Error("Cenário deve ter pelo menos uma alternativa");
    }

    const { error } = await supabase
      .from("alternatives")
      .delete()
      .eq("id", alternativeId);

    if (error) throw error;

    setScenarios((prev) =>
      prev.map((s) => {
        if (s.id === scenarioId) {
          return {
            ...s,
            alternatives: s.alternatives.filter((a) => a.id !== alternativeId),
            updated_at: new Date().toISOString(),
          };
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
      const generatedAlternatives = await aiService.generateAlternatives(
        scenario.title,
        scenario.description || "",
        3
      );

      const alternativesToInsert = generatedAlternatives.map((alt) => ({
        scenario_id: scenarioId,
        content: alt.text,
      }));

      const { data, error } = await supabase
        .from("alternatives")
        .insert(alternativesToInsert)
        .select();

      if (error) throw error;

      setScenarios((prev) =>
        prev.map((s) => {
          if (s.id === scenarioId) {
            return {
              ...s,
              alternatives: [...s.alternatives, ...(data || [])],
              updated_at: new Date().toISOString(),
            };
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
        refreshScenarios: fetchScenarios,
      }}
    >
      {children}
    </ScenariosContext.Provider>
  );
};
