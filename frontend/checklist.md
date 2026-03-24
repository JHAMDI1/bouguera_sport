# Checklist des Corrections et Améliorations

- [x] **1. Corriger les avertissements de tests**
  - [x] Désactiver les avertissements `any` (`eslint-disable`) dans `src/test/pages/schedule.test.tsx`
  - [x] Désactiver les avertissements `any` (`eslint-disable`) dans `src/test/utils/export.test.ts`

- [x] **2. Ajouter les boutons de retour**
  - [x] Modifier `src/components/PageHeader.tsx` pour ajouter un bouton `router.back()` (via une propriété `showBack`).
  - [x] Ajouter `showBack={true}` sur `src/app/coaches/page.tsx`
  - [x] Ajouter `showBack={true}` sur `src/app/schedule/page.tsx`
  - [x] Ajouter `showBack={true}` sur `src/app/expenses/page.tsx`
  - [x] Ajouter `showBack={true}` sur `src/app/disciplines/page.tsx`
  - [x] Ajouter `showBack={true}` sur `src/app/settings/page.tsx`

- [x] **3. Corriger l'affichage du menu déroulant (3 points) sur Mobile**
  - [x] Modifier `src/components/DataTable.tsx` : remplacer `items-start` par `items-end` pour les colonnes alignées à droite, afin que le `DropdownMenu` s'affiche correctement à l'intérieur de l'écran.

- [x] **4. Gérer les catégories de dépenses (CRUD)**
  - [x] Backend : Ajouter les mutations (Créer, Modifier, Supprimer) pour la table `expenseCategories` dans Convex.
  - [x] Hook : Ajouter ces fonctions dans `src/features/expenses/useExpenses.ts`.
  - [x] UI : Ajouter un bouton et une Modal pour la gestion des catégories dans `src/app/expenses/page.tsx`.
