# 📋 CHECKLIST FRONTEND — Salle de Sport (Mobile-First)

> **Contexte :** Projet non-commercial pour un ami. L'utilisateur principal utilise un téléphone pour gérer sa salle.
> **Stack :** Next.js 16 + Convex + Clerk + Tailwind CSS 4 + Lucide Icons
> **Priorité :** Mobile-First → Utilisabilité → Design → Architecture Code

---

## ⚫ PRIORITÉ 0 — Bugs CSS Cassés (URGENT)

> Ces bugs rendent le design incohérent et potentiellement cassé dans le navigateur. Ils sont le résultat d'un refactoring automatique mal exécuté.

### 0.1 Classes CSS Cassées (TOUTES les pages)
- [ ] **`rounded-none-none`** → Remplacer par `rounded-none` (ou supprimer entièrement)
  - Fichiers : `members`, `payments`, `families`, `groups`, `coaches`, `disciplines`, `expenses`, `schedule` (partout)
  - Impacte : boutons, inputs, selects, modales, badges, cartes, avatars
- [ ] **`text-black text-white`** — conflit : les deux couleurs annulent l'une l'autre (seul `text-white` prend effet)
  - Fichiers : `members` (L139, L312), `families` (L169, L353, L457), `groups` (L140, L360, L508), `coaches` (L132, L313, L403), `schedule` (L240, L500, L605)
  - Fix : supprimer `text-black`, garder `text-on-primary` (du design system)
- [ ] **`border-2 border-foreground border-2 border-foreground`** — duplication de classes
  - Fichiers : `members` (inputs L259, L270, L282, L291 + bouton annuler L305, L401), `payments` (L314, L341, L360, L379, L392, L411, L422), `families` (L189, L294, L306, L318, L332, L346, L393, L404, L415, L426, L450), `groups`, `coaches`, `expenses`, `schedule`
  - Fix : réduire à un seul `border-2 border-foreground`
- [ ] **`divide-y-2-2`** — classe Tailwind invalide
  - Fichiers : `members` (L163), `payments` (L199), `families` (L196), `groups` (L151), `coaches` (L143), `expenses` (L143)
  - Fix : remplacer par `divide-y-2`
- [ ] **`transition-all transition-colors`** — duplication de `transition-*`
  - Fichiers : `members` (L139), `groups` (L140), `coaches` (L132)
  - Fix : garder seulement `transition-all`

---

## 🔴 PRIORITÉ 1 — Couleurs Hardcodées (CRITIQUE)

> Le design system définit des variables CSS dans `globals.css` mais **AUCUNE page ne les utilise correctement**. Chaque page utilise ses propres couleurs Tailwind arbitraires, ce qui crée un design incohérent.

### 1.1 Couleurs de Focus Incohérentes
Chaque page utilise une couleur de focus différente pour les inputs/selects :
| Page | Focus actuel | Fix |
|------|-------------|-----|
| `members` | `focus:ring-blue-500 focus:border-blue-500` | `focus:ring-primary focus:border-primary` |
| `payments` | `focus:ring-green-500 focus:border-green-500` | `focus:ring-primary focus:border-primary` |
| `families` | `focus:ring-indigo-500 focus:border-indigo-500` | `focus:ring-primary focus:border-primary` |
| `groups` | `focus:ring-indigo-500 focus:border-indigo-500` | `focus:ring-primary focus:border-primary` |
| `coaches` | `focus:ring-blue-500 focus:border-blue-500` | `focus:ring-primary focus:border-primary` |
| `expenses` | `focus:ring-red-500 focus:border-red-500` | `focus:ring-primary focus:border-primary` |
| `schedule` | `focus:ring-indigo-500 focus:border-indigo-500` | `focus:ring-primary focus:border-primary` |

- [ ] Unifier TOUTES les couleurs de focus avec `focus:ring-primary focus:border-primary`

### 1.2 Couleurs de Header/Icônes Incohérentes
Chaque page a sa propre couleur d'icône de header :
| Page | Couleur icône header | Fix |
|------|---------------------|-----|
| `members` | `text-primary` ✅ | OK |
| `payments` | `text-green-600` ❌ | `text-primary` |
| `coaches` | `text-primary` ✅ | OK |
| `disciplines` | `text-purple-600` ❌ | `text-primary` |
| `expenses` | `text-red-600` ❌ | `text-primary` |
| `schedule` | `text-primary` ✅ | OK |
| `dashboard` | pas d'icône | - |

- [ ] Standardiser toutes les icônes de header à `text-primary`

### 1.3 Couleurs de Boutons CTA Incohérentes
Chaque page a son propre bouton CTA de couleur différente :
| Page | Bouton actuel | Fix |
|------|--------------|-----|
| `members` | `bg-primary` ✅ | OK |
| `payments` | `bg-green-600 hover:bg-green-700` ❌ | `btn-primary` |
| `families` | `bg-primary` ✅ + export `bg-gray-600` ❌ | `btn-primary` + `btn-subtle` |
| `disciplines` | `bg-purple-600 hover:bg-purple-700` ❌ | `btn-primary` |
| `expenses` | `bg-red-600 hover:bg-red-700` ❌ | `btn-primary` |
| `schedule` | `bg-primary` ✅ | OK |
| `coaches` | `bg-primary` ✅ | OK |

- [ ] Remplacer tous les boutons CTA par les classes du design system (`btn btn-primary`, `btn btn-secondary`, `btn btn-subtle`)

### 1.4 Couleurs de Badges Statut Hardcodées
Mêmes badges dupliqués dans 5+ pages avec des couleurs Tailwind brutes :
- [ ] `bg-green-100 text-green-800` → `badge-success` (dans members, families, groups, coaches, disciplines)
- [ ] `bg-red-100 text-red-800` → `badge-error` (dans members, families, groups, coaches)
- [ ] `bg-purple-100 text-purple-800` → nouveau `badge-info` ou token dédié (dans groups)
- [ ] `bg-orange-100 text-orange-800` → `badge-warning` (dans expenses)
- [ ] `bg-blue-100` avatar backgrounds → `bg-primary-subtle` (dans members, coaches, dashboard)
- [ ] Hover sur boutons edit : `text-blue-900`, `text-indigo-900` → `hover:text-primary-active`

### 1.5 Couleurs dans le Dashboard
- [ ] `bg-blue-100 text-primary` → `bg-primary-subtle text-primary`
- [ ] `bg-green-100 text-green-600` → `bg-success-subtle text-success`
- [ ] `bg-red-100 text-red-600` → `bg-error-subtle text-error`
- [ ] `bg-orange-100 text-orange-600` → `bg-warning-subtle text-warning`
- [ ] Quick actions icônes : `text-green-600`, `text-purple-600`, `text-red-600` → `text-primary`
- [ ] `text-green-600` revenus → `text-success`

### 1.6 Couleurs dans Payments
- [ ] `text-blue-400` icône User → `text-primary`
- [ ] `text-purple-400` icône Users → `text-secondary`
- [ ] `text-green-600` icône reçu → `text-primary`
- [ ] `text-red-600` montant dépenses → `text-error`

### 1.7 Style Inline dans Schedule
- [ ] `style={{ backgroundColor: session.color || "#4F46E5", color: "white" }}` → Utiliser une classe CSS dynamique basée sur `session.color` ou un token de discipline
- [ ] `bg-indigo-50 text-indigo-700` jour sélectionné → `bg-primary-subtle text-primary`
- [ ] `bg-red-600 hover:bg-red-700` bouton supprimer → `btn-secondary` style destructif ou créer `btn-danger`

### 1.8 Couleurs de Fond et Texte Hardcodées (Partout)
- [ ] `bg-gray-50` page backgrounds → `bg-background` (8 pages)
- [ ] `bg-white` cartes/tables → `bg-background-elevated` (toutes les pages)
- [ ] `text-gray-900` texte principal → `text-foreground` (toutes les pages)
- [ ] `text-gray-700` texte secondaire → `text-foreground-secondary` (toutes les pages)
- [ ] `text-gray-600` texte tertiaire → `text-foreground-tertiary`
- [ ] `text-gray-500` texte muted/icônes → `text-foreground-muted`
- [ ] `hover:bg-gray-50` survol tableau → `hover:bg-background-tertiary`
- [ ] `hover:bg-gray-100` → `hover:bg-background-tertiary`
- [ ] `text-red-600` messages d'erreur → `text-error`
- [ ] `border-gray-*` → `border-border` ou `border-border-subtle`

---

## 🟠 PRIORITÉ 2 — Logique Métier dans l'UI (IMPORTANT)

> Chaque page contient 300-630 lignes mélangeant requêtes Convex, mutations, logique de formulaire, rendu de tableaux, et modales. C'est impossible à maintenir.

### 2.1 Extraction de la Logique Métier
Pour chaque page, extraire la logique dans des hooks personnalisés :

- [ ] **Members** (436 lignes) → `useMembers()` hook
  - `useQuery`, `useMutation`, `filteredMembers`, `onCreateSubmit`, `onUpdateSubmit`, `handleToggleStatus`
  - La page ne devrait avoir que le JSX (~100 lignes max)
- [ ] **Payments** (462 lignes) → `usePayments()` hook
  - `useQuery` × 4, `useMutation`, `filteredPayments`, `onSubmit`, `getMemberName`, `getReceivedByName`, `handleViewReceipt`
- [ ] **Families** (482 lignes) → `useFamilies()` hook
- [ ] **Groups** (533 lignes) → `useGroups()` hook
  - `getDisciplineName`, `getCoachName` → dupliquer dans chaque page, devrait être un utilitaire partagé
- [ ] **Coaches** (431 lignes) → `useCoaches()` hook
- [ ] **Expenses** (324 lignes) → `useExpenses()` hook
  - `getCategoryName`, `getRecordedByName` → dupliqué avec payments
- [ ] **Schedule** (630 lignes) → `useSchedule()` hook
  - Contient aussi `scheduleByDay`, `weekStart`, `navigateWeek`, `formatTime`

### 2.2 Helpers/Utils Dupliqués
- [ ] `getMemberName(id)` → dupliqué dans payments, schedule → `src/lib/lookups.ts`
- [ ] `getCoachName(id)` → dupliqué dans groups, schedule → `src/lib/lookups.ts`
- [ ] `getReceivedByName(id)` / `getRecordedByName(id)` → même logique → `src/lib/lookups.ts`
- [ ] `getCategoryName(id)` → expenses → `src/lib/lookups.ts`
- [ ] `getDisciplineName(id)` → groups → `src/lib/lookups.ts`

### 2.3 Schémas Zod Dupliqués
- [ ] Extraire les schémas dans `src/schemas/` :
  - `src/schemas/member.ts` (memberSchema)
  - `src/schemas/payment.ts` (paymentSchema)
  - `src/schemas/family.ts` (familySchema, updateFamilySchema)
  - `src/schemas/group.ts` (groupSchema, updateGroupSchema)
  - `src/schemas/coach.ts` (coachSchema, updateCoachSchema)
  - `src/schemas/expense.ts` (expenseSchema)
  - `src/schemas/session.ts` (sessionSchema)

### 2.4 Types `any` Omniprésents
- [ ] `editingMember: any` → `Doc<"members"> | null` (dans 6 pages)
- [ ] `selectedReceipt: any` → type explicite
- [ ] `coaches?: any[]`, `member: any` dans les handlers → types Convex
- [ ] `data.disciplineId as any`, `data.coachId as any` → types Id correctes
- [ ] Paramètres de fonctions : `(member: any)`, `(coach: any)`, `(family: any)` → types Convex Doc<"...">

---

## 🟡 PRIORITÉ 3 — Composants Réutilisables & DRY

> Actuellement chaque page reconstruit les mêmes patterns UI (header, table, modals, search). On a 4 composants seulement (`ConfirmModal`, `FormComponents`, `ReceiptPDF`, `Toast`), il en faudrait 10+.

### 3.1 Composants à Extraire

- [ ] **`PageHeader.tsx`** — Même structure dupliquée dans 8 pages :
  ```
  <header className="bg-white shadow-[...] border-b">
    <div className="max-w-7xl mx-auto px-4...">
      <icon /> <h1>Titre</h1> <button>Nouveau ...</button>
    </div>
  </header>
  ```
  Props : `icon`, `title`, `subtitle?`, `actions: ReactNode`

- [ ] **`DataTable.tsx`** — Même pattern table dupliqué 6x :
  ```
  <div className="bg-white rounded-none shadow-[...] overflow-hidden">
    <table> <thead bg-gray-50> <tbody divide-y>
  ```
  Props : `columns`, `data`, `renderRow`, `emptyMessage`, `loading`

- [ ] **`FormModal.tsx`** — Même modal dupliquée 14x (create + edit × 7 pages) :
  ```
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-none p-6 w-full max-w-md">
      <header> <h2>Titre</h2> <X button/> </header>
      <form> ... </form>
      <footer> Annuler | Soumettre </footer>
    </div>
  </div>
  ```
  Props : `title`, `isOpen`, `onClose`, `onSubmit`, `isSubmitting`, `submitText`, `children`

- [ ] **`FormInput.tsx`** — Input identique copié 40+ fois :
  ```
  <label className="block text-sm font-medium text-gray-700">Label</label>
  <input className="mt-1 block w-full rounded-none border-2 border-foreground shadow-[...] px-3 py-2" />
  <p className="mt-1 text-sm text-red-600">{error}</p>
  ```
  Props : `label`, `error?`, `register`, `...inputProps`

- [ ] **`FormSelect.tsx`** — Select identique copié 15+ fois
  Props : `label`, `error?`, `options`, `register`, `placeholder`

- [ ] **`StatusBadge.tsx`** — Badge statut dupliqué 5+ fois
  Props : `status: "active" | "inactive" | "paid" | "unpaid"`, `onClick?`

- [ ] **`LoadingSpinner.tsx`** — Spinner SVG inline dupliqué 6x (dans les boutons submit)
  Remplacer les SVG inline par le composant `Loader2` de Lucide (déjà importé dans certaines pages)

- [ ] **`EmptyState.tsx`** — "Aucun ... trouvé" dupliqué 8x
  Props : `message`, `icon?`, `action?`

- [ ] **`SearchInput.tsx`** — Barre de recherche dupliquée 4x
  Props : `value`, `onChange`, `placeholder`

### 3.2 Layout Partagé (Manquant)
- [ ] Créer `AppLayout.tsx` wrappant toutes les pages authentifiées
- [ ] Headers page → déplacer dans le layout
- [ ] `<div className="min-h-screen bg-gray-50">` → dans le layout, pas chaque page
- [ ] `<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">` → dans le layout

---

## 🔴 PRIORITÉ 1 — Mobile-First & Utilisabilité (CRITIQUE)

> L'ami de Sahbi utilise son **téléphone** au quotidien. Rien ne marchera s'il ne peut pas naviguer facilement sur mobile.

### 4.1 Navigation Mobile (Bottom Tab Bar)
- [ ] Créer un composant `BottomNavBar.tsx` fixe en bas d'écran (visible uniquement sur mobile `md:hidden`)
- [ ] 5 onglets : **Dashboard** | **Adhérents** | **Paiements** | **Planning** | **Plus** (menu)
- [ ] L'onglet "Plus" ouvre un menu déroulant avec les liens secondaires
- [ ] Icônes Lucide avec labels en dessous
- [ ] Onglet actif en surbrillance avec la couleur primaire
- [ ] Safe-area padding pour les iPhones à encoche (`env(safe-area-inset-bottom)`)

### 4.2 Navigation Desktop (Sidebar)
- [ ] Créer un composant `Sidebar.tsx` fixe à gauche (visible uniquement sur desktop `hidden md:flex`)
- [ ] Logo/Nom du club en haut
- [ ] Bouton de déconnexion Clerk en bas
- [ ] Possibilité de réduire la sidebar

### 4.3 Tableaux → Cartes Mobiles
- [ ] **Adhérents** : table → cartes sur mobile (`hidden md:table` pour desktop)
- [ ] **Paiements** : table → cartes sur mobile
- [ ] **Familles** : table → cartes sur mobile
- [ ] **Groupes** : table → cartes sur mobile
- [ ] **Coaches** : table → cartes sur mobile
- [ ] **Dépenses** : table → cartes sur mobile

### 4.4 Formulaires Mobile-Friendly
- [ ] Inputs hauteur min `48px` (zone de toucher)
- [ ] Boutons `w-full` sur mobile
- [ ] Modales plein écran sur mobile (slide up)
- [ ] `type="tel"` pour téléphones, `inputMode="numeric"` pour montants

---

## 🟢 PRIORITÉ 5 — Design System Nettoyage

> Le design system dans `globals.css` est déjà bien défini (Neon Brutalism) mais NON UTILISÉ par les pages.

### 5.1 Classes Utilitaires Non Utilisées
Les classes suivantes dans `globals.css` ne sont PAS utilisées par les pages :
- [ ] `.card` / `.card-hover` → les pages utilisent des classes inline `bg-white rounded-none shadow-[...]`
- [ ] `.btn` / `.btn-primary` / `.btn-secondary` / `.btn-subtle` → les pages construisent les boutons en ligne
- [ ] `.input` → AUCUNE page ne l'utilise, chaque input a ses propres classes inline
- [ ] `.badge` / `.badge-success` / `.badge-error` → pas utilisés
- [ ] `.table-container` / `.table` → pas utilisés
- [ ] **Action :** Refactorer toutes les pages pour utiliser ces classes au lieu de les recréer inline

### 5.2 Ajouts au Design System
- [ ] Ajouter `.btn-danger` (pour supprimer des séances, etc.)
- [ ] Ajouter des tokens de couleur subtils manquants : `--primary-subtle`, `--success-subtle`, `--error-subtle`, etc. (certains existent déjà mais réglés sur `#ffffff` en light mode, pas vraiment subtil)
- [ ] Ajouter des classes pour form-group, form-label, form-error
- [ ] Vérifier les contrastes d'accessibilité WCAG AA (surtout Neon Volt `#d0ff00` sur blanc `#ffffff` → ratio ~1.07:1, CATASTROPHIQUE)

---

## 🔵 PRIORITÉ 6 — Architecture Code & Qualité

### 6.1 Structure des Fichiers Cible
```
src/
├── app/                    # Routes Next.js (pages légères ~100 lignes)
├── components/
│   ├── layout/             # AppLayout, Sidebar, BottomNavBar, PageHeader
│   ├── ui/                 # FormModal, DataTable, StatusBadge, EmptyState, SearchInput
│   └── forms/              # FormInput, FormSelect, FormTextarea
├── features/
│   ├── members/            # MemberTable, MemberForm, useMembers
│   ├── payments/           # PaymentTable, PaymentForm, usePayments
│   ├── schedule/           # ScheduleCalendar, SessionForm, useSchedule
│   ├── families/           # ...
│   ├── groups/             # ...
│   ├── coaches/            # ...
│   ├── disciplines/        # ...
│   └── expenses/           # ...
├── hooks/                  # useDebounce, useMediaQuery, useFormModal
├── schemas/                # Schémas Zod (member.ts, payment.ts, etc.)
├── lib/                    # lookups.ts, constants.ts, export.ts
└── styles/                 # globals.css
```

### 6.2 TypeScript Strict
- [ ] Remplacer tous les `any` (30+ occurrences) par des types Doc<"table"> de Convex
- [ ] Activer `strict: true` dans `tsconfig.json`

### 6.3 Fichiers Obsolètes à Supprimer
- [ ] `frontend/apply-brutalism.js` — script de migration one-shot
- [ ] `frontend/replace-colors.js` — script de migration one-shot

---

## 📊 Résumé de l'Effort Estimé

| Priorité | Section | Effort | Impact |
|----------|---------|--------|--------|
| ⚫ P0 | Bugs CSS Cassés | ~1h | Fix bugs visuels immédiats |
| 🔴 P1 | Couleurs Hardcodées | ~4h | Cohérence visuelle globale |
| 🟠 P2 | Logique dans l'UI | ~6h | Maintenabilité |
| 🟡 P3 | Composants DRY | ~5h | Réduction code de ~60% |
| 🔴 P4 | Mobile-First | ~8h | Utilisabilité quotidienne |
| 🟢 P5 | Design System | ~2h | Polish professionnel |
| 🔵 P6 | Architecture | ~4h | Qualité long terme |

**Total estimé : ~30h de travail**

---

> 💡 **Recommandation de séquence :**
> 1. **P0** — Fix les bugs CSS cassés (1h, zéro risque, résultat immédiat)
> 2. **P1** — Remplacer TOUTES les couleurs hardcodées par les tokens du design system (4h)
> 3. **P3** — Extraire `FormModal`, `FormInput`, `DataTable` (les 3 plus gros gains DRY)
> 4. **P2** — Séparer la logique métier dans des hooks (profite des composants créés en P3)
> 5. **P4** — Mobile + Navigation (le layout est prêt grâce à P3)
> 6. **P5 + P6** — Polish final et architecture
