import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ScenariosProvider } from "@/contexts/ScenariosContext";
import { Header } from "@/components/Header";
import { AuthForm } from "@/components/AuthForm";
import { ScenarioList } from "@/components/ScenarioList";

const Dashboard: React.FC = () => {
  return (
    <ScenariosProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-2xl px-6 py-8">
          <div className="mb-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              Seus cenários de decisão
            </h2>
            <p className="mt-1 text-muted-foreground">
              Organize e analise suas decisões com clareza
            </p>
          </div>
          <ScenarioList />
        </main>
      </div>
    </ScenariosProvider>
  );
};

const Index: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  return <Dashboard />;
};

export default Index;
