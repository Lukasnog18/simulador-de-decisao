import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, AuthState } from "@/types";
import { userStorage } from "@/services/storage";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check for existing session
    const user = userStorage.get();
    setState({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    });
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call - prepared for Supabase auth
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simple validation for demo
    if (!email.includes("@") || password.length < 4) {
      throw new Error("Credenciais inválidas");
    }

    const user: User = {
      id: crypto.randomUUID(),
      email,
      name: email.split("@")[0],
    };

    userStorage.save(user);
    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const register = async (email: string, password: string, name: string) => {
    // Simulate API call - prepared for Supabase auth
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!email.includes("@") || password.length < 4 || !name.trim()) {
      throw new Error("Dados inválidos");
    }

    const user: User = {
      id: crypto.randomUUID(),
      email,
      name,
    };

    userStorage.save(user);
    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = () => {
    userStorage.clear();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
