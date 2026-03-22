"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Activity, Users } from "lucide-react";

export default function DisciplinesPage() {
  const disciplines = useQuery(api.disciplines.getDisciplines, {});

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background-elevated shadow-[4px_4px_0px_var(--color-foreground)] border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Activity className="h-6 w-6 text-primary-text mr-3" />
            <h1 className="text-2xl font-bold text-foreground">Disciplines</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {disciplines?.map((discipline) => (
            <div key={discipline._id} className="card card-hover p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">{discipline.name}</h3>
                <span className={`badge ${discipline.isActive ? "badge-success" : "badge-error"}`}>
                  {discipline.isActive ? "Actif" : "Inactif"}
                </span>
              </div>
              <p className="text-foreground-secondary text-sm mb-4">
                {discipline.description || "Aucune description"}
              </p>
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-primary-text">
                  {discipline.monthlyFee} TND
                  <span className="text-sm font-normal text-foreground-secondary">/mois</span>
                </div>
                <button className="text-primary-text hover:text-primary-active text-sm font-medium transition-colors">
                  Voir les groupes →
                </button>
              </div>
            </div>
          ))}
        </div>
        {!disciplines && (
          <div className="text-center py-8 text-foreground-secondary">Chargement...</div>
        )}
        {disciplines?.length === 0 && (
          <div className="text-center py-8 text-foreground-secondary">Aucune discipline trouvée</div>
        )}
      </main>
    </div>
  );
}
