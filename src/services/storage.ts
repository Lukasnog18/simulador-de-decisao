import { Scenario, User } from "@/types";

const SCENARIOS_KEY = "decision_simulator_scenarios";
const USER_KEY = "decision_simulator_user";

// Scenario storage - prepared for Supabase migration
export const scenarioStorage = {
  getAll: (userId: string): Scenario[] => {
    const data = localStorage.getItem(SCENARIOS_KEY);
    if (!data) return [];
    const scenarios: Scenario[] = JSON.parse(data);
    return scenarios
      .filter((s) => s.userId === userId)
      .map((s) => ({
        ...s,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
        alternatives: s.alternatives.map((a) => ({
          ...a,
          createdAt: new Date(a.createdAt),
        })),
      }));
  },

  save: (scenario: Scenario): Scenario => {
    const data = localStorage.getItem(SCENARIOS_KEY);
    const scenarios: Scenario[] = data ? JSON.parse(data) : [];
    const index = scenarios.findIndex((s) => s.id === scenario.id);

    if (index >= 0) {
      scenarios[index] = scenario;
    } else {
      scenarios.push(scenario);
    }

    localStorage.setItem(SCENARIOS_KEY, JSON.stringify(scenarios));
    return scenario;
  },

  delete: (id: string): void => {
    const data = localStorage.getItem(SCENARIOS_KEY);
    if (!data) return;
    const scenarios: Scenario[] = JSON.parse(data);
    const filtered = scenarios.filter((s) => s.id !== id);
    localStorage.setItem(SCENARIOS_KEY, JSON.stringify(filtered));
  },
};

// User storage - prepared for Supabase auth migration
export const userStorage = {
  get: (): User | null => {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  save: (user: User): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear: (): void => {
    localStorage.removeItem(USER_KEY);
  },
};
