# Londres en Famille — Noël 2026 (PWA Mobile-First)

## 1. Contexte du séjour
- **Voyageurs** : 2 adultes (anciens résidents de Londres) + **Aya** (bientôt 8 ans, déjà venue) + **Adam** (4 ans, n'y est jamais retourné depuis sa naissance).
- **Vols Royal Air Maroc** (bagages cabine uniquement, pas de bagage en soute) :
  - Aller **AT800** : mardi 22 décembre 2026 — Casablanca (CMN) 13h05 → Londres Heathrow (LHR) 15h25.
  - Retour **AT801** : vendredi 1er janvier 2027 — Londres Heathrow (LHR) 17h15 → Casablanca (CMN) 21h30.
- **Logement** : Appartement à **W1J 7SU** (Hertford Street, Mayfair — proche Piccadilly Line : Hyde Park Corner / Green Park).
- **Avantage résident** : Accès résidents **Tower Hamlets** (tarif réduit £1 à la Tour de Londres et à Tower Bridge, justificatif + pièce d'identité requis).

## 2. Contraintes calendaires critiques (Noël 2026 / Nouvel An 2027)
- **24, 25 et 26 décembre** : Fermeture du British Museum, Natural History Museum, Tour de Londres et Tower Bridge.
- **24 décembre** : Fermeture anticipée des commerces/supermarchés (16h-17h) et arrêt des transports en soirée.
- **25 décembre** : Aucun transport en commun dans Londres ; journée 100 % piétonne depuis Mayfair.
- **28 décembre** : *Bank Holiday* (substitution de Boxing Day), forte affluence dans les musées -> créneaux 10h00 impératifs.
- **31 décembre** : Fermetures de rues autour de la Tamise / Westminster dès la fin d'après-midi (feux d'artifice payants).
- **1er janvier** : *London New Year's Day Parade* dès 13h00 sur Piccadilly -> axes routiers coupés autour de Mayfair, **aucun taxi/Uber**, rejoindre Heathrow en **Piccadilly Line** depuis Hyde Park Corner vers 13h45–14h00.

## 3. Itinéraire des 11 jours (22 déc. 2026 → 1er jan. 2027)
- **Mar 22 déc.** : Arrivée LHR 15h25, Piccadilly Line vers W1J 7SU, installation, courses, courte balade illuminations Mayfair.
- **Mer 23 déc.** : Ouverture matinale de **Hamleys** (arriver 9h45 pour la cérémonie d'ouverture à 10h00) → **British Museum** (1h30-2h max, sacs famille, Pierre de Rosette, momies).
- **Jeu 24 déc.** : **Hyde Park Winter Wonderland** dès 10h00 (à 10 min à pied) → courses avant 16h et réveillon à l'appartement.
- **Ven 25 déc.** : Balade à pied au calme absolu vers **Buckingham Palace** et les parcs royaux + illuminations du West End sans voitures.
- **Sam 26 déc.** : **Battersea Power Station** (chauffé, patinoire, boutiques Boxing Day, Lift 109 optionnel, accès Northern Line).
- **Dim 27 déc.** : Journée Tower Hamlets — **Tour de Londres** dès 10h00 (Joyaux de la Couronne, Tour Blanche, corbeaux) + **Tower Bridge** (passerelles vitrées + salles des machines).
- **Lun 28 déc.** : **Natural History Museum** (créneau 10h00 : dinosaures, baleine bleue, séisme) + **Science Museum** (*The Garden* 3-6 ans pour Adam, *Wonderlab* pour Aya).
- **Mar 29 déc.** : **Young V&A** (ex-V&A Museum of Childhood, Bethnal Green) + après-midi libre dans l'Est londonien.
- **Mer 30 déc.** : **Relève de la Garde à Buckingham Palace** (10h15–11h45, meilleurs spots : St James's Palace / Wellington Barracks / Victoria Memorial + Plan B pluie) → déjeuner Covent Garden / Seven Dials → **London Transport Museum** à Covent Garden (accès via station Leicester Square pour éviter les ascenseurs de Covent Garden).
- **Jeu 31 déc.** : **Diana Princess of Wales Memorial Playground** (Kensington Gardens dès 10h00, fermeture 15h45) → retour Mayfair avant 17h et réveillon au calme.
- **Ven 1er jan.** : Coup d'œil à la parade sur Piccadilly (13h00-13h30) → Piccadilly Line (Hyde Park Corner) vers Heathrow → vol retour AT801 à 17h15.

## 4. Direction artistique (Validée — à respecter strictement)
- **Inspiration** : Élégance britannique sobre et lumineuse façon *The Ivy Collection* (`ivycollection.com`).
- **Palette** :
  - Fond principal : Ivoire papier doux (`#FAF8F4`) et cartes blanches (`#FFFFFF`) aux bordures fines (`#E7E2D8`).
  - Couleur primaire (texte, titres, accents) : Vert anglais / Ivy Green (`#143B2B`).
  - Touches secondaires : Laiton / champagne discret (`#B39258`).
  - Alertes calendaires critiques uniquement : Bordeaux sobre (`#7C2D36`).
- **Typographie** :
  - UI & chiffres : `Plus Jakarta Sans` (épurée, très lisible sur mobile).
  - Titres éditoriaux : `Cormorant Garamond`.
  - Parties rédigées du Carnet : police manuscrite légère et lisible (`Kalam` pour le corps rédigé, `Caveat` pour les annotations de marge).
- **Ergonomie** : Ultra-aéré, mobile-first, défilement natif 100 % fluide (zéro conteneur bloquant le scroll), barre de navigation fixe en bas avec 5 onglets.

## 5. Architecture fonctionnelle (5 onglets exacts)
1. **Planning** : Sélecteur horizontal des 11 jours (synchronisé avec l'onglet Carnet), bandeau d'alerte les jours critiques, cartes d'étapes avec horaires, compatibilité Aya (8 ans) / Adam (4 ans), statut de réservation cliquable, coche « Fait », déplacement/édition d'étape.
2. **Carnet** *(placé entre Planning et Activités)* : Journal rédigé jour par jour façon guide de voyage agréable à lire (Le Matin, Pause Gourmande kid-friendly autour de l'étape, L'Après-midi, Note de poche logistique) + bloc « Nos petits mots & souvenirs » éditable et sauvegardé par jour.
3. **Activités** : Catalogue filtrable (Planifiées / Bonus + Gratuit / Résident TH / Intérieur / Top 4 ans) permettant d'affecter des idées bonus (comédie musicale West End, Uber Boat, Horse Guards Parade, LEGO Store, Lift 109, Paddington Trail...) à n'importe quel jour.
4. **Budget** :
   - Synthèse globale convertie dynamiquement en **£ GBP / MAD / € EUR** (taux éditables, défaut 1 £ = 12,60 MAD / 1,18 €).
   - Barre **Payé vs À prévoir** + mise en avant des **~£120 économisés** (tarif résident Tower Hamlets).
   - Filtres par catégorie (Activités, Repas & Courses, Transports, Shopping & Extras).
   - **Liste détaillée jour par jour** (les 11 jours + Dépenses globales), repliable/dépliable, avec sous-totaux GBP + MAD par journée, reliée dynamiquement aux activités du Planning, bascule Prévu/Payé en un clic, et bouton « + Ajouter une dépense ce jour ».
5. **Infos** : Récap vols RAM, adresse W1J 7SU, mémo justificatifs Tower Hamlets, check-list interactive pré-départ, partage récap WhatsApp, import/export JSON, configuration de la synchronisation famille, guide d'installation PWA Android.

## 6. Exigences techniques & déploiement
- **Stack** : Vite + React + TypeScript + Tailwind CSS (architecture modulaire propre dans `src/`, zéro code monolithique).
- **PWA Android réelle** : `vite-plugin-pwa` avec `manifest.webmanifest`, service worker offline-first et vraies icônes PNG (192x192 et 512x512, monogramme `LDN 26` vert Ivy & laiton) pour une installation native via Chrome Android sur les deux téléphones.
- **Synchronisation 2 téléphones** : Architecture de store prête pour une synchro temps réel entre les deux appareils (via un Code Famille partagé sur **Supabase** ou **Firebase Firestore** — fallback automatique sur `localStorage` tant que les clés d'environnement ne sont pas renseignées).
- **Déploiement** : GitHub Actions (`.github/workflows/deploy.yml`) configuré avec `base: '/londres-noel-2026/'` pour déployer automatiquement sur `https://mmbar-commits.github.io/londres-noel-2026/` à chaque push sur `main`.
