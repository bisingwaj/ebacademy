# Étoile Bleue — Examen de certification des formateurs

Plateforme d'examen **en ligne** pour évaluer les formateurs ayant suivi la formation sur
les outils numériques de l'écosystème **Étoile Bleue (199)** — centrée sur l'**application
Citoyenne** et l'**application Urgentiste (Secouriste)**.

Conçue pour être déployée telle quelle (statique, **sans backend**) : chaque candidat obtient,
à la fin, un **rapport détaillé imprimable (PDF) et téléchargeable (JSON)**.

---

## Fonctionnalités

- **Portail d'identité** : le formateur saisit nom, e-mail et profil avant de commencer.
- **Examen mixte de 36 questions** (99 points) en 4 sections, avec types variés :
  QCM, choix multiples, vrai/faux, **réponse écrite** (courte & rédigée), **mise en ordre**,
  **association**, et **questions visuelles** (maquettes interactives des écrans des apps :
  on clique la bonne zone).
- **Mode Focus** : détecte quand le candidat **change d'onglet, minimise ou quitte la page**.
  Une **alarme sonore** se déclenche, un overlay invite à revenir, et **chaque sortie est
  consignée** (heure, durée, motif) dans le rapport.
- **Minuteur** (40 min) avec auto-soumission à expiration, **barre de progression**,
  navigateur de questions, et **autosauvegarde locale** (résiste au rafraîchissement).
- **Notation automatique** des questions objectives (avec crédit partiel pour les choix
  multiples, l'ordre et les associations). Les réponses rédigées sont marquées
  « à corriger » avec un score indicatif et la référence de barème.
- **Rapport détaillé** : verdict (Admis / À revoir / Ajourné), score global et par section,
  bloc d'intégrité Mode Focus, revue question par question (réponse du candidat vs attendue),
  et zone de **validation du correcteur** (signature). Imprimable en PDF (`Ctrl/Cmd + P`) et
  exportable en JSON.
- **Charte visuelle officielle** Étoile Bleue (marine, rouge, crème) — design épuré, aéré,
  animé, responsive (mobile/desktop).

---

## Démarrer en local

```bash
npm install
npm run dev       # http://localhost:5173
```

Production :

```bash
npm run build     # typecheck + génère ./dist
npm run preview   # prévisualise le build
npm test          # tests de la notation (parfait=100%, faux, vide, crédit partiel, accents)
```

> Qualité : `tsc` strict (avec détection de code mort), `ErrorBoundary` global,
> impression PDF fidèle (couleurs conservées), accessibilité (zoom non verrouillé,
> rôles ARIA sur les modales, `prefers-reduced-motion`), et alarme Mode Focus
> proprement coupée à la soumission/au démontage.

---

## Déployer sur Vercel

C'est un site **statique** (Vite). Deux options :

**A. Interface Vercel**
1. Poussez ce dossier sur un dépôt GitHub.
2. Sur vercel.com → **New Project** → importez le dépôt.
3. Vercel détecte Vite automatiquement : *Build Command* `npm run build`, *Output* `dist`.
4. **Deploy**. (Aucune variable d'environnement requise.)

**B. CLI**
```bash
npm i -g vercel
vercel        # préversion
vercel --prod # production
```

---

## Modifier l'examen (questions, barème, seuil)

Tout le contenu vit dans **un seul fichier** : [`src/data/exam.ts`](src/data/exam.ts).

- `meta` : titre, durée (`durationMin`), **seuil de réussite** (`passMark`, en %).
- `sections` : les 4 grandes parties.
- `questions` : un objet par question. Champs selon le `type` :
  - `mcq` → `options` + `correctOption`
  - `multi` → `options` + `correctOptions` (crédit partiel)
  - `truefalse` → `correctBool`
  - `short` → `accept` (mots-clés acceptés, en minuscules sans accents) + `sample`
  - `long` → `rubric` (mots-clés de barème), `minWords`, `sample` (correction manuelle)
  - `order` → `items` + `correctOrder`
  - `match` → `lefts` + `rights` + `correctMatch`
  - `hotspot` → `mockup` + `spots` (zones en %) + `correctSpot`
- `points` : barème de la question. `explanation` : note affichée dans le rapport.

Les maquettes visuelles (écrans des apps) sont dans
[`src/components/Mockups.tsx`](src/components/Mockups.tsx). Les coordonnées des `spots`
(questions `hotspot`) sont en **pourcentages** de l'écran de la maquette.

---

## Collecter les rapports (sans backend)

À la fin de l'examen, demandez au formateur de :
1. cliquer **« Imprimer / PDF »** et d'enregistrer le PDF (ou de l'imprimer) ; **et/ou**
2. cliquer **« Télécharger »** pour obtenir le rapport `.json`.

Vous récupérez ces fichiers (e-mail, dossier partagé…). Le PDF contient déjà la zone de
**validation du correcteur** pour finaliser les réponses rédigées.

> Évolution possible : pour un tableau de bord centralisé (tous les formateurs au même
> endroit), on peut brancher Supabase/Vercel et envoyer le `ExamResult` à la soumission.
> L'architecture actuelle le permet sans refonte (un seul point d'envoi dans `App.tsx`).

---

## Design & stack

Langage visuel **IBM Carbon** : typographie **IBM Plex Sans / Mono**, palette neutre
(gris Carbon) avec le **marine** et le **rouge** Étoile Bleue comme couleurs de marque,
**angles nets**, champs « filled » à filet bas, boutons rectangulaires, et un jeu
d'**icônes SVG au trait** (aucun emoji). Chaque question affiche un **surtitre de type**
(Choix unique, Association, Question visuelle…) et une **consigne** pour la clarté.

Vite · React 18 · TypeScript · Tailwind CSS · Framer Motion. Alarme via **Web Audio API**
(aucun fichier son). Aucune dépendance serveur.

## Arborescence

```
src/
├── data/exam.ts          # ← CONTENU de l'examen (à éditer)
├── types.ts              # modèle de données
├── lib/
│   ├── scoring.ts        # notation + crédit partiel
│   └── audio.ts          # alarme sirène (Web Audio)
├── hooks/
│   ├── useFocusGuard.ts  # Mode Focus (détection + journal)
│   └── useCountdown.ts   # minuteur
├── components/
│   ├── Brand.tsx         # identité visuelle
│   ├── Mockups.tsx       # écrans d'app (questions visuelles)
│   └── QuestionView.tsx  # rendu de chaque type de question
└── screens/
    ├── IdentityGate.tsx  # accueil + identification
    ├── ExamShell.tsx     # déroulé de l'examen + Mode Focus
    └── Report.tsx        # rapport détaillé (PDF / JSON)
```
