import React, { useState } from "react";
import { Scenario } from "@/types";
import { useScenarios } from "@/contexts/ScenariosContext";
import { AlternativeItem } from "./AlternativeItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ScenarioCardProps {
  scenario: Scenario;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario }) => {
  const {
    updateScenario,
    deleteScenario,
    addAlternative,
    updateAlternative,
    deleteAlternative,
    regenerateAlternatives,
    isLoading,
  } = useScenarios();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingAlternative, setIsAddingAlternative] = useState(false);
  const [newAlternative, setNewAlternative] = useState("");
  const [editData, setEditData] = useState({
    title: scenario.title,
    description: scenario.description,
  });

  const handleSaveEdit = () => {
    if (!editData.title.trim() || !editData.description.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }
    updateScenario(scenario.id, editData);
    setIsEditing(false);
    toast.success("Cenário atualizado");
  };

  const handleCancelEdit = () => {
    setEditData({ title: scenario.title, description: scenario.description });
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteScenario(scenario.id);
    toast.success("Cenário excluído");
  };

  const handleAddAlternative = () => {
    if (!newAlternative.trim()) return;
    addAlternative(scenario.id, newAlternative.trim());
    setNewAlternative("");
    setIsAddingAlternative(false);
    toast.success("Alternativa adicionada");
  };

  const handleRegenerate = async () => {
    await regenerateAlternatives(scenario.id);
    toast.success("Novas alternativas geradas");
  };

  return (
    <article className="animate-fade-in rounded-lg border border-border bg-card transition-shadow hover:shadow-sm">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-start justify-between gap-4 p-5 text-left"
      >
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-lg font-semibold text-foreground line-clamp-2">
            {scenario.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {scenario.description}
          </p>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{scenario.alternatives.length} alternativas</span>
            <span>•</span>
            <span>
              {format(scenario.updatedAt, "d 'de' MMM, yyyy", { locale: ptBR })}
            </span>
          </div>
        </div>
        <div className="flex-shrink-0 text-muted-foreground">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-border px-5 pb-5 animate-slide-down">
          {/* Edit Mode */}
          {isEditing ? (
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Input
                  value={editData.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                  placeholder="Título"
                  className="bg-background font-serif text-lg"
                />
              </div>
              <div className="space-y-2">
                <Textarea
                  value={editData.description}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                  placeholder="Descrição"
                  rows={3}
                  className="bg-background resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveEdit} size="sm" className="gap-1">
                  <Check className="h-3 w-3" />
                  Salvar
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  size="sm"
                  variant="outline"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Actions */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="gap-1"
                >
                  <Pencil className="h-3 w-3" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRegenerate}
                  disabled={isLoading}
                  className="gap-1"
                >
                  <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
                  Gerar mais
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-3 w-3" />
                      Excluir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir cenário?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. O cenário e todas as
                        alternativas serão permanentemente removidos.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* Alternatives */}
              <div className="mt-6">
                <h4 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Alternativas
                </h4>
                <div className="divide-y divide-border">
                  {scenario.alternatives.map((alt, index) => (
                    <AlternativeItem
                      key={alt.id}
                      alternative={alt}
                      index={index}
                      canDelete={scenario.alternatives.length > 1}
                      onUpdate={(text) =>
                        updateAlternative(scenario.id, alt.id, text)
                      }
                      onDelete={() => deleteAlternative(scenario.id, alt.id)}
                    />
                  ))}
                </div>

                {/* Add Alternative */}
                {isAddingAlternative ? (
                  <div className="mt-4 space-y-2">
                    <Textarea
                      value={newAlternative}
                      onChange={(e) => setNewAlternative(e.target.value)}
                      placeholder="Digite uma nova alternativa..."
                      rows={2}
                      className="bg-background resize-none"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleAddAlternative}
                        className="gap-1"
                      >
                        <Check className="h-3 w-3" />
                        Adicionar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setNewAlternative("");
                          setIsAddingAlternative(false);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsAddingAlternative(true)}
                    className="mt-3 gap-1 text-muted-foreground"
                  >
                    <Plus className="h-3 w-3" />
                    Adicionar alternativa
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </article>
  );
};
