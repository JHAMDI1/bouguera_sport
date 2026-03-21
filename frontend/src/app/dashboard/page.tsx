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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord</h1>
              <p className="text-sm text-gray-600">
                Bienvenue, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
              </p>
            </div>
            <div className="text-sm text-gray-500">
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
            <div className="text-gray-500">Chargement...</div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Active Members */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Adhérents Actifs</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalActiveMembers || 0}</p>
                  </div>
                </div>
              </div>

              {/* Monthly Revenue */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Revenus du Mois</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(stats?.monthlyRevenue || 0).toLocaleString('fr-FR')} TND
                    </p>
                  </div>
                </div>
              </div>

              {/* Net Profit */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${(stats?.netProfit || 0) >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Bénéfice Net</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(stats?.netProfit || 0).toLocaleString('fr-FR')} TND
                    </p>
                  </div>
                </div>
              </div>

              {/* Unpaid Count */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Impayés</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.unpaidCount || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <a 
                  href="/members"
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Users className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="font-medium">Gestion Adhérents</span>
                </a>
                <a 
                  href="/payments"
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Wallet className="h-5 w-5 text-green-600 mr-3" />
                  <span className="font-medium">Nouveau Paiement</span>
                </a>
                <a 
                  href="/disciplines"
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Activity className="h-5 w-5 text-purple-600 mr-3" />
                  <span className="font-medium">Disciplines</span>
                </a>
                <a 
                  href="/expenses"
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <DollarSign className="h-5 w-5 text-red-600 mr-3" />
                  <span className="font-medium">Dépenses</span>
                </a>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
