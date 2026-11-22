# Londres en Famille — Noël 2026 (PWA Mobile-First)

Application Web Progressive (PWA) conçue pour le séjour familial à Londres du **22 décembre 2026 au 1er janvier 2027** (2 adultes + Aya 8 ans + Adam 4 ans, appartement Mayfair `W1J 7SU`).

## Fonctionnalités

- **Planning** : sélecteur horizontal des 11 jours (synchronisé avec le Carnet), bandeaux d'alerte bordeaux sur les jours critiques (24, 25, 26, 28, 31 déc. et 1er jan.), compatibilité Aya & Adam, statut de réservation cliquable, coche « Fait », réorganisation et édition d'étapes.
- **Carnet** : journal de voyage éditorial jour par jour (*Le Matin*, *Pause Gourmande*, *L'Après-midi*, *Note de poche logistique*) + bloc *« Nos petits mots & souvenirs »* sauvegardé par journée.
- **Activités** : catalogue filtrable (*Planifiées* / *Bonus*, *Gratuit*, *Résident TH*, *Intérieur*, *Top 4 ans*) avec affectation en un clic à n'importe quel jour du séjour.
- **Budget** : synthèse dynamique en **£ GBP / MAD / € EUR** (taux éditables), barre *Payé vs À prévoir*, mise en avant des **~£123 économisés** (tarif résident Tower Hamlets £1), filtres par catégorie et détail chronologique jour par jour relié au Planning.
- **Infos** : récap vols Royal Air Maroc (AT800 / AT801, bagages cabine uniquement), adresse Mayfair `W1J 7SU`, mémo justificatifs Tower Hamlets, check-list interactive, partage WhatsApp, import/export JSON, synchronisation 2 téléphones et guide d'installation PWA Android.

## Développement local

```bash
npm install
npm run dev
```

Build de production :

```bash
npm run build
npm run preview
```

## Synchronisation temps réel (optionnelle)

Par défaut, l'application persiste toutes les données dans `localStorage` et fonctionne 100 % hors-ligne. Pour activer la synchronisation temps réel entre deux téléphones via Code Famille :

1. Créez un projet Supabase et exécutez le schéma SQL affiché dans l'onglet **Infos**.
2. Ajoutez les variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans `.env.local` (local) ou dans les variables de dépôt GitHub Actions.