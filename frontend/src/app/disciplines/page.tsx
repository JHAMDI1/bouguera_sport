"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Activity, Plus, Users } from "lucide-react";

export default function DisciplinesPage() {
  const disciplines = useQuery(api.disciplines.getDisciplines, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-[4px_4px_0px_var(--color-foreground)] border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="h-6 w-6 text-purple-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Disciplines</h1>
            </div>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-none-none flex items-center hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Discipline
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {disciplines?.map((discipline) => (
            <div key={discipline._id} className="bg-white rounded-none-none shadow-[4px_4px_0px_var(--color-foreground)] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{discipline.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-none-none ${
                  discipline.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {discipline.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">{discipline.description || "Aucune description"}</p>
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-purple-600">
                  {discipline.monthlyFee} TND<span className="text-sm font-normal text-gray-700">/mois</span>
                </div>
                <button className="text-primary hover:text-blue-800 text-sm font-medium">
                  Voir les groupes →
                </button>
              </div>
            </div>
          ))}
        </div>
        {!disciplines && (
          <div className="text-center py-8 text-gray-700">Chargement...</div>
        )}
        {disciplines?.length === 0 && (
          <div className="text-center py-8 text-gray-700">Aucune discipline trouvée</div>
        )}
      </main>
    </div>
  );
}
