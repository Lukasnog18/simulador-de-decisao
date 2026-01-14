export interface User {
  id: string;
  email: string;
}

export interface Alternative {
  id: string;
  scenario_id: string;
  content: string;
  created_at: string;
}

export interface Scenario {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  alternatives: Alternative[];
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
