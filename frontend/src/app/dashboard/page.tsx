"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Activity,
  Wallet
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useUser();
  const stats = useQuery(api.dashboard.getDashboardStats);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background-elevated shadow-[4px_4px_0px_var(--color-foreground)] border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Tableau de Bord</h1>
              <p className="text-sm text-foreground-secondary">
                Bienvenue, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
              </p>
            </div>
            <div className="text-sm text-foreground-tertiary">
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {stats === undefined ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-foreground-secondary">Chargement...</div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Active Members */}
              <div className="card p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-none bg-primary-subtle text-primary-text">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-foreground-secondary">Adhérents Actifs</p>
                    <p className="text-2xl font-bold text-foreground">{stats?.totalActiveMembers || 0}</p>
                  </div>
                </div>
              </div>

              {/* Monthly Revenue */}
              <div className="card p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-none bg-success-subtle text-success">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-foreground-secondary">Revenus du Mois</p>
                    <p className="text-2xl font-bold text-foreground">
                      {(stats?.monthlyRevenue || 0).toLocaleString('fr-FR')} TND
                    </p>
                  </div>
                </div>
              </div>

              {/* Net Profit */}
              <div className="card p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-none ${(stats?.netProfit || 0) >= 0 ? 'bg-success-subtle text-success' : 'bg-error-subtle text-error'}`}>
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-foreground-secondary">Bénéfice Net</p>
                    <p className="text-2xl font-bold text-foreground">
                      {(stats?.netProfit || 0).toLocaleString('fr-FR')} TND
                    </p>
                  </div>
                </div>
              </div>

              {/* Unpaid Count */}
              <div className="card p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-none bg-warning-subtle text-warning">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-foreground-secondary">Impayés</p>
                    <p className="text-2xl font-bold text-foreground">{stats?.unpaidCount || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Actions Rapides</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <a
                  href="/members"
                  className="flex items-center p-4 border-2 border-border rounded-none hover:bg-background-tertiary transition-colors cursor-pointer"
                >
                  <Users className="h-5 w-5 text-primary-text mr-3" />
                  <span className="font-medium text-foreground">Gestion Adhérents</span>
                </a>
                <a
                  href="/payments"
                  className="flex items-center p-4 border-2 border-border rounded-none hover:bg-background-tertiary transition-colors cursor-pointer"
                >
                  <Wallet className="h-5 w-5 text-primary-text mr-3" />
                  <span className="font-medium text-foreground">Nouveau Paiement</span>
                </a>
                <a
                  href="/disciplines"
                  className="flex items-center p-4 border-2 border-border rounded-none hover:bg-background-tertiary transition-colors cursor-pointer"
                >
                  <Activity className="h-5 w-5 text-primary-text mr-3" />
                  <span className="font-medium text-foreground">Disciplines</span>
                </a>
                <a
                  href="/expenses"
                  className="flex items-center p-4 border-2 border-border rounded-none hover:bg-background-tertiary transition-colors cursor-pointer"
                >
                  <DollarSign className="h-5 w-5 text-primary-text mr-3" />
                  <span className="font-medium text-foreground">Dépenses</span>
                </a>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
