export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Alternative {
  id: string;
  text: string;
  createdAt: Date;
}

export interface Scenario {
  id: string;
  userId: string;
  title: string;
  description: string;
  alternatives: Alternative[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
