# Audit UI/UX Premium (Tier 1) - Sahbi Gym

## Résumé de l'Audit (Basé sur les skills `ui-ux-pro-max` et `tailwind-patterns`)
Suite à l'analyse de l'application Sahbi Gym, le thème "Neon Brutalism" est bien en place au niveau architectural, mais manque encore de raffinement (le *Polish*). L'objectif du Tier 1 est de transformer l'interface pour qu'elle passe d'un "bon prototype" à une "application de classe professionnelle".

---

## 1. Animations & Interactions (Micro-interactions)
Le brutalisme moderne exige un feedback visuel fort, réactif et tactile.

**Problèmes constatés :**
- Les boutons et cartes manquent d'effets de clic organiques (l'impression d'appuyer sur un vrai bouton physique).
- Les hover states manquent de transitions fluides de durée standard.

**Solutions (Polish) :**
- **Effet de clic "Brutal" :** Ajouter `.active:translate-y-[2px] .active:translate-x-[2px] .active:shadow-none` sur `.btn` et les composants de navigation cliquables.
- **Hover "Lift" :** Mettre à jour les classes `.card` et `.btn` pour inclure `transition-all duration-200 ease-out`. Sur le hover, l'élément s'élève légèrement `hover:-translate-y-1` et l'ombre s'allonge `hover:shadow-[6px_6px_0px_0px_var(--color-foreground)]`.

---

## 2. Typographie & Hiérarchie Visuelle
La typographie dicte le professionnalisme.

**Problèmes constatés :**
- Les titres de page (`PageHeader`) et les labels d'entêtes de tableaux (`DataTable`) manquent de caractère.
- Le logo/nom de marque dans la barre latérale n'a pas assez d'impact visuel pour une application de salle de sport.

**Solutions (Polish) :**
- **Image de marque :** Le texte "SAHBI GYM" dans le Sidebar doit passer à `font-black uppercase tracking-widest` pour un rendu très agressif et industriel.
- **Titres (h1/h2) :** Appliquer `tracking-tight` pour tasser les lettres des gros titres afin d'obtenir un impact plus massif (caractéristique du Neon Brutalism).
- **En-têtes de Tableaux :** Aligner sur les standards SaaS en utilisant `text-xs uppercase tracking-wider text-foreground-muted font-bold`.

---

## 3. Espacements & Layouts (Breathing Room)
Le brutalisme n'est pas synonyme d'étouffement. L'espacement asymétrique mais généreux est crucial.

**Problèmes constatés :**
- Les *PageHeaders* (`py-4`) sont légèrement tassés sur les écrans desktop.
- L'espacement intérieur de certaines modales et cartes peut être optimisé.

**Solutions (Polish) :**
- Augmenter les marges verticales supérieures à `py-6` ou `py-8` pour les `PageHeader` (desktop).
- Confirmer que l'espacement des grilles de tableaux (`DataTable` en mode carte mobile) utilise un écart (`gap-4` à `gap-6`) suffisant pour distinguer visuellement chaque bloc de données sans fatigue.

---

## 4. Accessibilité (Focus & Outline)
L'accessibilité est une règle critique (Priorité 1 de `ui-ux-pro-max`).

**Problèmes constatés :**
- Les requêtes de navigation clavier (Tab) n'affichent pas toujours un contour distinct et "brutal" en phase avec le thème.

**Solutions (Polish) :**
- Redéfinir l'état focus dans les composants de formulaire et les boutons : `focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-2`. Cela garantit un contraste WCAG AA lors de l'utilisation au clavier.
