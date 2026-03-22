# App Builder Checklist - Salle de Sport V2 (SaaS Production)

Conformément à l'orchestrateur `app-builder` et à ses principes de scaffolding, voici le plan structuré complet pour l'implémentation des fonctionnalités de la V2.

## 1. Project Type & Tech Stack
- **Project Type** : SaaS de Gestion de Salle de Sport (Évolution V2)
- **Tech Stack Existante** : Next.js, Convex, Tailwind CSS, Clerk, Zod, React Hook Form
- **Dépendances à ajouter** : 
  - `recharts` ou `chart.js` (Analytiques visuelles)
  - `@react-pdf/renderer` ou équivalent (Génération de factures & reçus PDF)
  - Pas de dépendances JS nécessaires pour l'upload (Convex intègre nativement son système de Storage)

---

## 2. Décomposition de l'architecture (Features Building)

### 🔐 Feature 1: Rôles et Autorisations (Sécurité RBAC)
- [ ] **Database Schema** : 
  - S'assurer que les rôles dans la table `users` définissent clairement `admin`, `coach`, `member`.
- [ ] **Backend (API Convex)** :
  - Ajouter des Auth Guards (ex: `ctx.auth.getUserIdentity()`) dans toutes les mutations critiques (`create`, `update`, `delete`) pour rejeter les opérations non-admin ou hors-périmètre.
- [ ] **Pages** :
  - Créer des layouts pour un "Portail Adhérent" (ex: `/dashboard/my-profile`, `/dashboard/my-payments`).
- [ ] **Components** :
  - Masquer conditionnellement l'UI d'édition ou de suppression (Edit/Delete) selon le rôle de l'utilisateur.

### 📊 Feature 2: Analytiques et Dashboard Avancé
- [ ] **Database & Backend** :
  - Créer des requêtes d'agrégation groupées par mois dans `dashboard.ts` (revenus des 6/12 derniers mois, répartition des genres/âges, abonnements par discipline).
- [ ] **Pages** :
  - Ajouter des sections graphiques dans `dashboard/page.tsx`.
- [ ] **Components** :
  - Créer `RevenueChart.tsx` (Graphique linéaire).
  - Créer `MembersDistributionChart.tsx` (Graphique circulaire).

### 📄 Feature 3: Génération de Reçus PDF
- [ ] **Pages** :
  - Ajouter un bouton `Télécharger Reçu` dans les colonnes Actions de `payments/page.tsx`.
  - Intégrer la logique d'export à la soumission d'un nouveau paiement réussi.
- [ ] **Components** :
  - Composant `PaymentReceiptPDF.tsx` ou fonction utilitaire qui dessine le layout d'une facture imprimable.

### 🖼️ Feature 4: Upload de Fichiers (Médias & Certificats)
- [ ] **Database Schema** :
  - Champs `photoUrl: v.optional(v.string())` et `medicalCertificateUrl: v.optional(v.string())` dans les entités utilisateurs (Adhérents, Coachs).
- [ ] **Backend (API Convex)** :
  - Exposer `generateUploadUrl` depuis le serveur Convex Storage.
  - Sauvegarder l'Id du fichier et gérer la conversion via `ctx.storage.getUrl(storageId)`.
- [ ] **Pages & Components** :
  - Créer un composant réutilisable `MediaUploader.tsx`.
  - L'intégrer dans les modales `members/page.tsx` et `coaches/page.tsx`.

### ⚙️ Feature 5: Configuration SaaS Globale (Settings)
- [ ] **Database Schema** :
  - Créer une nouvelle table `settings` pour la configuration globale du club (un seul document statique).
  - Valeurs : `clubName`, `currency`, `contactEmail`, `taxRate`, `logoUrl`.
- [ ] **Backend (API Convex)** :
  - Créer le getter `api.settings.getSettings` et le setter `api.settings.updateSettings`.
- [ ] **Pages** :
  - Créer la nouvelle page `src/app/settings/page.tsx`.
- [ ] **Components** :
  - Créer le profil formulaire `SettingsForm.tsx` (identique à l'approche `FormModal` + Zod).

---

## 3. Agents Coordination Pipeline (Ordre d'exécution de l'App Builder)

1. **`database-architect`** : Update du schéma Convex global (rôles, champs médias, table settings).
2. **`backend-specialist`** : Implémentation complète de la couche API (requêtes analytiques, Auth Guards, urls Convex Storage).
3. **`frontend-specialist (UI & Charts)`** : Intégration Recharts, construction et stylisation des graphiques et du Dashboard.
4. **`frontend-specialist (Uploads & Settings)`** : Mise en place du composant `MediaUploader.tsx`, ajustement des formulaires Zod, création de la page de Paramètres.
5. **`frontend-specialist (PDFs & Rôles)`** : Logique de génération des factures PDF, layouts séparés pour le Portail Adhérent.
