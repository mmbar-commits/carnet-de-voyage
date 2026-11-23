import type { WeatherKind } from '../store/weather';
import type {
  ActivityTag,
  BookingStatus,
  ExpenseCategory,
  KidCompatibility,
  Language,
  TripDay,
} from '../types/trip';

export const UI_TEXT = {
  fr: {
    appTitle: 'Londres en Famille',
    appSubtitle: '22 déc. – 1er jan. · Mayfair',
    nav: {
      planning: 'Planning',
      carnet: 'Journal',
      activites: 'Activités',
      budget: 'Budget',
      infos: 'Infos',
    },
    dayPrefix: 'Jour',
    ofDays: 'sur 11',
    details: 'Détails',
    less: 'Réduire',
    edit: 'Modifier',
    delete: 'Supprimer',
    cancel: 'Annuler',
    save: 'Enregistrer',
    add: 'Ajouter',
    meal: 'Repas',
    activity: 'Activité',
    free: 'Gratuit',
    maps: 'Maps',
    openMaps: 'Ouvrir Maps',
    addStep: 'Ajouter une étape',
    freeDayTitle: 'Journée libre',
    freeDayDesc: 'Ajoutez une étape ou piochez une idée dans Activités.',
    newStep: 'Nouvelle étape',
    editStep: 'Modifier l’étape',
    journal: {
      badge: 'Journal',
      morning: 'Le Matin',
      lunch: 'Pause Gourmande',
      afternoon: 'L’Après-midi',
      logistics: 'Note de poche',
      memories: 'Nos petits mots & souvenirs',
      saved: 'Enregistré',
      auto: 'Auto',
      placeholder: 'Un mot d’Aya, un rire d’Adam, une belle adresse...',
      routeTitle: 'Itinéraire du jour',
      walkHint: 'Trajet à pied',
      transitHint: 'Trajet en métro',
      prompts: ['Mot d’Aya : «  »', 'Mot d’Adam : «  »', 'Coup de cœur : '],
      genericPrompts: ['Coup de cœur : ', 'Bonne adresse : ', 'Souvenir du jour : '],
      plannedStepsTitle: 'Au programme du jour',
      noPlannedSteps: 'Aucune étape planifiée pour cette journée. Ajoutez vos envies dans le Planning.',
      destinationMapTitle: 'Carte de la destination',
      destinationMapHint: 'Point de repère principal',
    },
    activities: {
      eyebrow: 'Catalogue · Aya & Adam',
      title: 'Activités & Bonus',
      bonus: 'Bonus',
      planned: 'Planifiées',
      all: 'Toutes',
      bonusHeading: 'Idées Bonus',
      plannedHeading: 'Au Planning',
      assign: 'Affecter',
      access: 'Accès',
      empty: 'Aucun résultat pour ces filtres',
      showAll: 'Tout afficher',
    },
    budget: {
      eyebrow: '4 Voyageurs · 11 Jours',
      title: 'Budget',
      estimatedTotal: 'Total estimé',
      paid: 'Payé',
      remaining: 'Reste',
      plannedStatus: 'Prévu',
      thSaved: 'économisés · Résident Tower Hamlets',
      rateLabel: 'Taux de change (1 £ GBP en MAD)',
      allCategories: 'Toutes',
      byDay: 'Par journée',
      byCategory: 'Par catégorie',
      byPayment: 'Par moyen de paiement',
      byPerson: 'Par voyageur',
      expandAll: 'Tout déplier',
      collapseAll: 'Tout replier',
      globalTitle: 'Dépenses globales',
      globalBadge: 'Global',
      noExpense: 'Aucune dépense',
      addExpense: 'Ajouter une dépense',
      unspecified: 'Non précisé',
      newExpense: 'Nouvelle dépense',
      editExpense: 'Modifier la dépense',
      dayField: 'Journée',
      labelField: 'Libellé *',
      amountField: 'Montant (£ GBP) *',
      categoryField: 'Catégorie',
      paymentField: 'Moyen de paiement',
      personField: 'Voyageur',
      noteField: 'Note (optionnel)',
      alreadyPaid: 'Dépense déjà payée',
    },
    auth: {
      sectionTitle: 'Compte & Accès',
      accountTitle: 'Mon compte',
      membersSectionTitle: 'Accès & Membres',
      connectedStatus: 'Connecté',
      disconnectedStatus: 'Déconnecté',
      signedOut: 'Invité',
      adminRole: 'Admin',
      editorRole: 'Éditeur',
      viewerRole: 'Lecture seule',
      unclaimedBadge: 'Libre',
      noAccessBadge: 'Protégé',
      readOnlyBanner: 'Mode lecture seule',
      exitPreview: 'Quitter l’aperçu',
      previewReadOnly: 'Aperçu lecture seule',
      previewReadOnlyDesc: 'Testez ce que voit un invité en lecture seule.',
      hideBudgetToggle: 'Masquer le Budget aux lecteurs',
      hideBudgetDesc: 'Cache l’onglet Budget pour les comptes en lecture seule.',
      signInBtn: 'Se connecter / Créer un compte',
      signOutBtn: 'Se déconnecter',
      continueWithGoogle: 'Continuer avec Google',
      orDivider: 'ou par email',
      claimTripTitle: 'Protéger ce voyage avec votre compte',
      claimTripDesc:
        'En revendiquant ce voyage, vous devenez Admin et pourrez gérer les accès (Admin, Éditeur ou Lecture seule).',
      claimTripBtn: 'Activer la protection (Admin)',
      editorAccessNote:
        'Vous avez un accès Éditeur : vous pouvez modifier tout le voyage. Seul un Admin peut gérer les membres et les rôles.',
      viewerAccessNote:
        'Vous consultez ce voyage en mode lecture seule.',
      noAccessDesc:
        'Ce voyage est protégé. Connectez-vous avec un email invité ou demandez à un Admin de vous ajouter.',
      sqlPendingTitle: 'Dernière étape sur Supabase',
      sqlPendingDesc:
        'Exécutez le script SQL Option A dans votre Supabase SQL Editor pour activer les comptes et rôles sécurisés.',
      copyAuthSql: 'Copier le SQL Option A',
      openSqlEditor: 'Ouvrir SQL Editor',
      membersHeading: 'Membres autorisés',
      invitePlaceholder: 'Email du membre (ex. aida@...)...',
      inviteBtn: 'Inviter',
      pendingStatus: 'En attente de connexion',
      activeStatus: 'Actif',
      modalLoginTitle: 'Connexion',
      modalSignUpTitle: 'Créer un compte',
      modalMagicTitle: 'Lien magique par email',
      emailLabel: 'Adresse email',
      passwordLabel: 'Mot de passe (6 car. min.)',
      submitLogin: 'Se connecter',
      submitSignUp: 'Créer mon compte',
      submitMagic: 'Envoyer le lien de connexion',
      switchToSignUp: 'Pas encore de compte ? Créer un compte',
      switchToLogin: 'Déjà un compte ? Se connecter',
      switchToMagic: 'Se connecter par lien email (sans mot de passe)',
      switchToPassword: 'Se connecter avec un mot de passe',
      magicSent: 'Lien envoyé ! Vérifiez votre boîte mail et ouvrez le lien sur cet appareil.',
      confirmEmailSent:
        'Compte créé ! Vérifiez votre email pour confirmer votre adresse, puis connectez-vous.',
      accountDescSignedOut:
        'Connectez-vous pour gérer qui administre ce voyage (Admin), peut le modifier (Éditeur) ou seulement le consulter (Lecture seule).',
      myAccountDescSignedOut:
        'Connectez-vous pour retrouver vos voyages et synchroniser votre compte sur tous vos appareils.',
      forgotPasswordLink: 'Mot de passe oublié ?',
      resetPasswordTitle: 'Réinitialiser le mot de passe',
      resetPasswordDesc:
        'Saisissez votre adresse email pour recevoir un lien de réinitialisation.',
      submitResetPassword: 'Envoyer le lien de réinitialisation',
      resetPasswordSent:
        'Lien de réinitialisation envoyé ! Vérifiez votre boîte mail pour choisir un nouveau mot de passe.',
      backToLogin: 'Retour à la connexion',
      newPasswordEyebrow: 'Sécurité du compte',
      newPasswordTitle: 'Nouveau mot de passe',
      newPasswordDesc:
        'Choisissez un nouveau mot de passe pour votre compte Carnet de Voyage.',
      newPasswordLabel: 'Nouveau mot de passe (6 car. min.)',
      confirmPasswordLabel: 'Confirmer le mot de passe',
      passwordMismatch: 'Les deux mots de passe ne correspondent pas.',
      passwordTooShort: 'Le mot de passe doit contenir au moins 6 caractères.',
      saveNewPassword: 'Enregistrer le mot de passe',
      passwordUpdated: 'Mot de passe mis à jour !',
    },
    infos: {
      prepEyebrow: 'Pratique · Mayfair W1J 7SU',
      prepTitle: 'Infos & Préparatifs',
      tripSettingsEyebrow: 'Ce voyage',
      tripSettingsTitle: 'Réglages du voyage',
      appSettingsEyebrow: 'Application & Compte',
      appSettingsTitle: 'Réglages de l’application',
      currenciesTitle: 'Devises du voyage',
      currenciesDesc:
        'Choisissez la devise utilisée sur place et votre devise de référence à la maison.',
      tripCurrencyLabel: 'Devise voyage (sur place)',
      homeCurrencyLabel: 'Devise maison (référence)',
      exchangeRateLabel: 'Taux de change',
      flightsTitle: 'Vols Royal Air Maroc',
      cabinTag: 'Cabine',
      outbound: 'Aller',
      inbound: 'Retour',
      terminals: 'Terminaux',
      track: 'Suivi',
      homeTitle: 'Appartement · W1J 7SU',
      homeTube:
        'Piccadilly Line directe Heathrow : Hyde Park Corner (5 min) et Green Park (7 min).',
      copy: 'Copier',
      copied: 'Copié',
      thTitle: 'Mémo Tower Hamlets (£1)',
      thDocsTitle: 'Justificatifs requis le 27 déc.',
      checklistTitle: 'Check-list pré-départ',
      checklistPlaceholder: 'Ajouter un pense-bête...',
      peopleTitle: 'Voyageurs (Budget)',
      peopleDesc:
        'Gérez la liste des voyageurs disponibles pour ventiler les dépenses du Budget.',
      peoplePlaceholder: 'Prénom du voyageur (ex. Grand-mère)...',
      paymentsTitle: 'Moyens de paiement',
      paymentsDesc:
        'Personnalisez les cartes et moyens de paiement disponibles dans le Budget.',
      paymentsPlaceholder: 'Ex. Visa Gold, Revolut, Espèces...',
      tripDetailsTitle: 'Identité du voyage',
      tripDetailsDesc:
        'Modifiez le titre ou le sous-titre affiché dans l’en-tête de ce voyage.',
      tripTitleLabel: 'Titre du voyage',
      tripDestLabel: 'Destination',
      tripSubtitleLabel: 'Sous-titre',
      practicalPrefix: 'Pratique',
      practicalNotesTitle: 'Notes pratiques',
      practicalNotesEmpty:
        'Ajoutez vos vols, hébergements, adresses ou codes d’accès importants.',
      addPracticalNoteBtn: 'Ajouter une note',
      noteTitlePlaceholder: 'Ex. Hôtel, Vols, Transfert...',
      noteContentPlaceholder: 'Horaires, adresse, référence de réservation...',
      noteMapsPlaceholder: 'Adresse Google Maps (optionnel)',
      syncLocal: 'Local',
      syncedAt: 'Synchronisé à',
      shareTitle: 'Sauvegarde',
      backupDesc: 'Exportez ou restaurez une copie JSON complète de ce voyage.',
      tripCodeLabel: 'Code du voyage',
      exportJson: 'Exporter JSON',
      importJson: 'Importer JSON',
      resetLabel: 'Données par défaut',
      resetBtn: 'Réinitialiser',
      confirm: 'Confirmer',
      pwaTitle: 'Installer l’application',
      pwaTitleAndroid: 'Installer sur Android',
      pwaTitleIos: 'Installer sur iPhone',
      pwaTitleIpad: 'Installer sur iPad',
      pwaTitleInstalled: 'Application installée',
      pwaInstalledBadge: 'Hors-ligne',
      pwaInstalledGuide:
        'L’application est installée sur votre écran d’accueil et reste 100 % accessible hors-ligne, même sans réseau.',
      pwaInstallBtn: 'Installer l’application',
      pwaGuideAndroid:
        'Dans Chrome Android : touchez ⋮ en haut à droite, puis « Installer l’application ». Elle reste 100 % accessible hors-ligne, même sans réseau.',
      pwaGuideIos:
        'Dans Safari : touchez le bouton Partager (⬆︎ en bas de l’écran), faites défiler puis choisissez « Sur l’écran d’accueil ». Elle reste 100 % accessible hors-ligne.',
      pwaGuideDesktopIntro:
        'Ajoutez l’application sur l’écran d’accueil de vos téléphones pour y accéder hors-ligne :',
      pwaLabelIos: 'iPhone / iPad (Safari)',
      pwaLabelAndroid: 'Android (Chrome)',
      pwaShortIos: 'Touchez Partager (⬆︎) → « Sur l’écran d’accueil ».',
      pwaShortAndroid: 'Touchez ⋮ → « Installer l’application ».',
      languageTitle: 'Langue',
      languageAuto: 'Auto',
      languageDetectedPrefix: 'Langue détectée sur cet appareil :',
      languageContentNote:
        'Les notes, étapes et dépenses saisies restent dans la langue où elles ont été écrites.',
    },
    trips: {
      eyebrow: 'Mes voyages',
      title: 'Changer de séjour',
      activeBadge: 'Actif',
      newTripBtn: 'Nouveau voyage',
      newTripTitle: 'Créer un nouveau voyage',
      titleLabel: 'Titre du voyage',
      titlePlaceholder: 'Ex. Rome en Famille',
      destinationLabel: 'Destination *',
      destinationPlaceholder: 'Ex. Rome, Tokyo, New York...',
      quickCitiesLabel: 'Destinations rapides',
      startDateLabel: 'Début',
      endDateLabel: 'Fin',
      tripCurrencyLabel: 'Devise sur place',
      homeCurrencyLabel: 'Devise maison',
      createBtn: 'Créer le voyage',
      creatingBtn: 'Création...',
      joinHeading: 'Rejoindre un voyage par code',
      joinPlaceholder: 'Ex. ROME-2027-A3F9',
      joinBtn: 'Rejoindre',
      switchHint: 'Touchez un voyage pour l’ouvrir',
    },
    landing: {
      brandName: 'Carnet de Voyage',
      eyebrow: 'Édition privée · Famille & proches',
      heroLead: 'Vos voyages,',
      heroAccent: 'précieusement',
      heroTail: 'réunis.',
      subtitle:
        'Itinéraires jour par jour, souvenirs écrits à la main et budget partagé — uniquement accessibles aux membres invités.',
      emailPlaceholder: 'vous@exemple.com',
      features: {
        planningTitle: 'Planning',
        planningDesc: 'Jour par jour',
        journalTitle: 'Journal',
        journalDesc: 'Souvenirs & cartes',
        budgetTitle: 'Budget',
        budgetDesc: 'Multi-devises',
      },
      privacyNote:
        'Accès sur invitation · Aucune donnée de voyage n’est visible sans connexion.',
    },
    hub: {
      brandName: 'Carnet de Voyage',
      eyebrow: 'Vos carnets',
      title: 'Mes voyages',
      subtitle: 'Choisissez un séjour pour l’ouvrir ou préparez votre prochaine escapade.',
      backToTrips: 'Retour à mes voyages',
      emptyTitle: 'Aucun voyage partagé pour le moment',
      emptyDescBefore: 'Aucun carnet n’est encore associé à',
      emptyDescAfter:
        'Créez votre premier séjour ci-dessous ou demandez à un administrateur de vous inviter avec cette adresse.',
      joinToggle: 'Rejoindre un voyage par code',
      joinHelper:
        'Saisissez le code d’un voyage auquel votre adresse email a été invitée.',
      joiningBtn: 'Vérification...',
      dismissNotice: 'Fermer',
    },
    weather: {
      forecast: 'Prévision',
      seasonal: 'Normales de saison',
      seasonalShort: 'Normales',
      rain: 'Pluie',
      conditions: {
        sun: 'Ensoleillé',
        partly_cloudy: 'Éclaircies',
        cloudy: 'Nuageux',
        fog: 'Brouillard',
        drizzle: 'Bruine',
        rain: 'Pluie',
        snow: 'Neige',
        storm: 'Orage',
      },
    },
  },
  en: {
    appTitle: 'London Family Trip',
    appSubtitle: '22 Dec – 1 Jan · Mayfair',
    nav: {
      planning: 'Plan',
      carnet: 'Journal',
      activites: 'Activities',
      budget: 'Budget',
      infos: 'Info',
    },
    dayPrefix: 'Day',
    ofDays: 'of 11',
    details: 'Details',
    less: 'Less',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    save: 'Save',
    add: 'Add',
    meal: 'Meal',
    activity: 'Activity',
    free: 'Free',
    maps: 'Maps',
    openMaps: 'Open Maps',
    addStep: 'Add a step',
    freeDayTitle: 'Free day',
    freeDayDesc: 'Add a step or pick an idea from the Activities tab.',
    newStep: 'New step',
    editStep: 'Edit step',
    journal: {
      badge: 'Journal',
      morning: 'Morning',
      lunch: 'Lunch & Treats',
      afternoon: 'Afternoon',
      logistics: 'Pocket Logistics Note',
      memories: 'Family Notes & Memories',
      saved: 'Saved',
      auto: 'Auto',
      placeholder: 'A funny quote from Aya or Adam, a favourite spot...',
      routeTitle: 'Day Itinerary Map',
      walkHint: 'Walking route',
      transitHint: 'Tube route',
      prompts: ['Aya said: “ ”', 'Adam said: “ ”', 'Highlight: '],
      genericPrompts: ['Highlight: ', 'Favourite spot: ', 'Memory of the day: '],
      plannedStepsTitle: 'Today’s schedule',
      noPlannedSteps: 'No steps planned for this day yet. Add ideas in the Plan tab.',
      destinationMapTitle: 'Destination Map',
      destinationMapHint: 'Main destination pin',
    },
    activities: {
      eyebrow: 'Catalogue · Aya & Adam',
      title: 'Activities & Ideas',
      bonus: 'Bonus',
      planned: 'Planned',
      all: 'All',
      bonusHeading: 'Bonus Ideas',
      plannedHeading: 'In the Plan',
      assign: 'Assign',
      access: 'Getting there',
      empty: 'No matching activities',
      showAll: 'Show all',
    },
    budget: {
      eyebrow: '4 Travellers · 11 Days',
      title: 'Budget',
      estimatedTotal: 'Estimated total',
      paid: 'Paid',
      remaining: 'Left',
      plannedStatus: 'Planned',
      thSaved: 'saved · Tower Hamlets Resident',
      rateLabel: 'Exchange rate (1 £ GBP in MAD)',
      allCategories: 'All',
      byDay: 'By day',
      byCategory: 'By category',
      byPayment: 'By payment method',
      byPerson: 'By traveller',
      expandAll: 'Expand all',
      collapseAll: 'Collapse all',
      globalTitle: 'Global expenses',
      globalBadge: 'Global',
      noExpense: 'No expenses',
      addExpense: 'Add an expense',
      unspecified: 'Unspecified',
      newExpense: 'New expense',
      editExpense: 'Edit expense',
      dayField: 'Day',
      labelField: 'Title *',
      amountField: 'Amount (£ GBP) *',
      categoryField: 'Category',
      paymentField: 'Payment method',
      personField: 'Traveller',
      noteField: 'Note (optional)',
      alreadyPaid: 'Already paid',
    },
    auth: {
      sectionTitle: 'Account & Access',
      accountTitle: 'My account',
      membersSectionTitle: 'Access & Members',
      connectedStatus: 'Signed in',
      disconnectedStatus: 'Signed out',
      signedOut: 'Guest',
      adminRole: 'Admin',
      editorRole: 'Editor',
      viewerRole: 'Read-only',
      unclaimedBadge: 'Open',
      noAccessBadge: 'Protected',
      readOnlyBanner: 'Read-only mode',
      exitPreview: 'Exit preview',
      previewReadOnly: 'Preview read-only',
      previewReadOnlyDesc: 'See what a read-only guest experiences.',
      hideBudgetToggle: 'Hide Budget for viewers',
      hideBudgetDesc: 'Hides the Budget tab from read-only accounts.',
      signInBtn: 'Sign in / Create account',
      signOutBtn: 'Sign out',
      continueWithGoogle: 'Continue with Google',
      orDivider: 'or with email',
      claimTripTitle: 'Protect this trip with your account',
      claimTripDesc:
        'Claiming this trip makes you an Admin so you can manage access (Admin, Editor or Read-only).',
      claimTripBtn: 'Enable protection (Admin)',
      editorAccessNote:
        'You have Editor access: you can edit all trip content. Only an Admin can manage members and roles.',
      viewerAccessNote:
        'You are viewing this trip in read-only mode.',
      noAccessDesc:
        'This trip is protected. Sign in with an invited email or ask an Admin to add you.',
      sqlPendingTitle: 'Final step in Supabase',
      sqlPendingDesc:
        'Run the Option A SQL migration in your Supabase SQL Editor to activate accounts & role security.',
      copyAuthSql: 'Copy Option A SQL',
      openSqlEditor: 'Open SQL Editor',
      membersHeading: 'Authorised members',
      invitePlaceholder: 'Member email (e.g. aida@...)...',
      inviteBtn: 'Invite',
      pendingStatus: 'Pending sign-in',
      activeStatus: 'Active',
      modalLoginTitle: 'Sign in',
      modalSignUpTitle: 'Create account',
      modalMagicTitle: 'Magic email link',
      emailLabel: 'Email address',
      passwordLabel: 'Password (6+ chars)',
      submitLogin: 'Sign in',
      submitSignUp: 'Create account',
      submitMagic: 'Send sign-in link',
      switchToSignUp: 'New here? Create an account',
      switchToLogin: 'Already have an account? Sign in',
      switchToMagic: 'Sign in with an email link (passwordless)',
      switchToPassword: 'Sign in with email & password',
      magicSent: 'Link sent! Check your inbox and open it on this device.',
      confirmEmailSent:
        'Account created! Check your email to confirm your address, then sign in.',
      accountDescSignedOut:
        'Sign in to manage who administers this trip (Admin), can edit it (Editor) or view it in read-only mode (Read-only).',
      myAccountDescSignedOut:
        'Sign in to access your trips and sync your account across all your devices.',
      forgotPasswordLink: 'Forgot password?',
      resetPasswordTitle: 'Reset password',
      resetPasswordDesc:
        'Enter your email address to receive a password reset link.',
      submitResetPassword: 'Send reset link',
      resetPasswordSent:
        'Reset link sent! Check your inbox to choose a new password.',
      backToLogin: 'Back to sign in',
      newPasswordEyebrow: 'Account security',
      newPasswordTitle: 'Set a new password',
      newPasswordDesc:
        'Choose a new password for your Carnet de Voyage account.',
      newPasswordLabel: 'New password (6+ chars)',
      confirmPasswordLabel: 'Confirm password',
      passwordMismatch: 'Passwords do not match.',
      passwordTooShort: 'Password must be at least 6 characters.',
      saveNewPassword: 'Save new password',
      passwordUpdated: 'Password updated!',
    },
    infos: {
      prepEyebrow: 'Practical · Mayfair W1J 7SU',
      prepTitle: 'Info & Prep',
      tripSettingsEyebrow: 'This trip',
      tripSettingsTitle: 'Trip Settings',
      appSettingsEyebrow: 'App & Account',
      appSettingsTitle: 'App Settings',
      currenciesTitle: 'Trip currencies',
      currenciesDesc:
        'Choose the local currency for this trip and your home reference currency.',
      tripCurrencyLabel: 'Trip currency (local)',
      homeCurrencyLabel: 'Home currency (reference)',
      exchangeRateLabel: 'Exchange rate',
      flightsTitle: 'Royal Air Maroc Flights',
      cabinTag: 'Cabin only',
      outbound: 'Outbound',
      inbound: 'Return',
      terminals: 'Terminals',
      track: 'Live',
      homeTitle: 'Apartment · W1J 7SU',
      homeTube:
        'Direct Piccadilly Line from Heathrow: Hyde Park Corner (5 min) & Green Park (7 min).',
      copy: 'Copy',
      copied: 'Copied',
      thTitle: 'Tower Hamlets Memo (£1)',
      thDocsTitle: 'Required documents on 27 Dec',
      checklistTitle: 'Pre-trip checklist',
      checklistPlaceholder: 'Add a checklist item...',
      peopleTitle: 'Travellers (Budget)',
      peopleDesc:
        'Manage the travellers available to tag and split Budget expenses.',
      peoplePlaceholder: 'Traveller name (e.g. Grandma)...',
      paymentsTitle: 'Payment methods',
      paymentsDesc:
        'Customise the cards and payment methods available in Budget.',
      paymentsPlaceholder: 'e.g. Visa Gold, Revolut, Cash...',
      tripDetailsTitle: 'Trip details',
      tripDetailsDesc:
        'Edit the title or subtitle displayed in the header for this trip.',
      tripTitleLabel: 'Trip title',
      tripDestLabel: 'Destination',
      tripSubtitleLabel: 'Subtitle',
      practicalPrefix: 'Practical',
      practicalNotesTitle: 'Practical notes',
      practicalNotesEmpty:
        'Add your flights, hotel address, booking codes or key local info.',
      addPracticalNoteBtn: 'Add a note',
      noteTitlePlaceholder: 'e.g. Hotel, Flights, Transfer...',
      noteContentPlaceholder: 'Times, address, booking reference...',
      noteMapsPlaceholder: 'Google Maps address (optional)',
      syncLocal: 'Local',
      syncedAt: 'Synced at',
      shareTitle: 'Backup',
      backupDesc: 'Export or restore a full JSON copy of this trip.',
      tripCodeLabel: 'Trip code',
      exportJson: 'Export JSON',
      importJson: 'Import JSON',
      resetLabel: 'Default trip data',
      resetBtn: 'Reset',
      confirm: 'Confirm',
      pwaTitle: 'Install app',
      pwaTitleAndroid: 'Install on Android',
      pwaTitleIos: 'Install on iPhone',
      pwaTitleIpad: 'Install on iPad',
      pwaTitleInstalled: 'App installed',
      pwaInstalledBadge: 'Offline ready',
      pwaInstalledGuide:
        'The app is installed on your home screen and works 100% offline, even without signal.',
      pwaInstallBtn: 'Install app',
      pwaGuideAndroid:
        'In Chrome Android: tap ⋮ at the top right, then "Install app". Works 100% offline, even without signal.',
      pwaGuideIos:
        'In Safari: tap the Share button (⬆︎ at the bottom of the screen), scroll down and choose "Add to Home Screen". Works 100% offline.',
      pwaGuideDesktopIntro:
        'Add the app to your phone home screen for instant offline access:',
      pwaLabelIos: 'iPhone / iPad (Safari)',
      pwaLabelAndroid: 'Android (Chrome)',
      pwaShortIos: 'Tap Share (⬆︎) → "Add to Home Screen".',
      pwaShortAndroid: 'Tap ⋮ → "Install app".',
      languageTitle: 'Language',
      languageAuto: 'Auto',
      languageDetectedPrefix: 'Detected device language:',
      languageContentNote:
        'User-entered notes, steps and expenses stay in the language they were written.',
    },
    trips: {
      eyebrow: 'My trips',
      title: 'Switch trip',
      activeBadge: 'Active',
      newTripBtn: 'New trip',
      newTripTitle: 'Create a new trip',
      titleLabel: 'Trip title',
      titlePlaceholder: 'e.g. Rome Family Trip',
      destinationLabel: 'Destination *',
      destinationPlaceholder: 'e.g. Rome, Tokyo, New York...',
      quickCitiesLabel: 'Quick destinations',
      startDateLabel: 'Start',
      endDateLabel: 'End',
      tripCurrencyLabel: 'Local currency',
      homeCurrencyLabel: 'Home currency',
      createBtn: 'Create trip',
      creatingBtn: 'Creating...',
      joinHeading: 'Join a trip by code',
      joinPlaceholder: 'e.g. ROME-2027-A3F9',
      joinBtn: 'Join',
      switchHint: 'Tap a trip to open it',
    },
    landing: {
      brandName: 'Carnet de Voyage',
      eyebrow: 'Private edition · Family & friends',
      heroLead: 'Your journeys,',
      heroAccent: 'thoughtfully',
      heroTail: 'kept together.',
      subtitle:
        'Day-by-day itineraries, handwritten travel journals and shared budgets — visible only to invited members.',
      emailPlaceholder: 'you@example.com',
      features: {
        planningTitle: 'Itinerary',
        planningDesc: 'Day by day',
        journalTitle: 'Journal',
        journalDesc: 'Memories & maps',
        budgetTitle: 'Budget',
        budgetDesc: 'Multi-currency',
      },
      privacyNote:
        'Invite-only access · No trip data is ever visible without signing in.',
    },
    hub: {
      brandName: 'Carnet de Voyage',
      eyebrow: 'Your journals',
      title: 'My trips',
      subtitle: 'Choose a trip to open or start planning your next getaway.',
      backToTrips: 'Back to my trips',
      emptyTitle: 'No trips shared with you yet',
      emptyDescBefore: 'No trip journal is linked to',
      emptyDescAfter:
        'Create your first trip below or ask a trip admin to invite this email address.',
      joinToggle: 'Join a trip by code',
      joinHelper:
        'Enter the code of a trip your email address has been invited to.',
      joiningBtn: 'Checking...',
      dismissNotice: 'Dismiss',
    },
    weather: {
      forecast: 'Forecast',
      seasonal: 'Seasonal avg',
      seasonalShort: 'Seasonal avg',
      rain: 'Rain',
      conditions: {
        sun: 'Sunny',
        partly_cloudy: 'Partly cloudy',
        cloudy: 'Cloudy',
        fog: 'Fog',
        drizzle: 'Drizzle',
        rain: 'Rain',
        snow: 'Snow',
        storm: 'Storm',
      },
    },
  },
} as const;

const EN_DAY_DATES: Record<
  string,
  { wd: string; ds: string; dl: string; wdf: string }
> = {
  '2026-12-22': { wd: 'Tue', ds: '22 Dec', dl: 'Tuesday, 22 December 2026', wdf: 'Tuesday' },
  '2026-12-23': { wd: 'Wed', ds: '23 Dec', dl: 'Wednesday, 23 December 2026', wdf: 'Wednesday' },
  '2026-12-24': { wd: 'Thu', ds: '24 Dec', dl: 'Thursday, 24 December 2026', wdf: 'Thursday' },
  '2026-12-25': { wd: 'Fri', ds: '25 Dec', dl: 'Friday, 25 December 2026', wdf: 'Friday' },
  '2026-12-26': { wd: 'Sat', ds: '26 Dec', dl: 'Saturday, 26 December 2026', wdf: 'Saturday' },
  '2026-12-27': { wd: 'Sun', ds: '27 Dec', dl: 'Sunday, 27 December 2026', wdf: 'Sunday' },
  '2026-12-28': { wd: 'Mon', ds: '28 Dec', dl: 'Monday, 28 December 2026', wdf: 'Monday' },
  '2026-12-29': { wd: 'Tue', ds: '29 Dec', dl: 'Tuesday, 29 December 2026', wdf: 'Tuesday' },
  '2026-12-30': { wd: 'Wed', ds: '30 Dec', dl: 'Wednesday, 30 December 2026', wdf: 'Wednesday' },
  '2026-12-31': { wd: 'Thu', ds: '31 Dec', dl: 'Thursday, 31 December 2026', wdf: 'Thursday' },
  '2027-01-01': { wd: 'Fri', ds: '1 Jan', dl: 'Friday, 1 January 2027', wdf: 'Friday' },
};

function parseIsoUtc(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const dt = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function capitalize(str: string): string {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

export function getDayLabel(day: TripDay, lang: Language) {
  if (lang === 'en') {
    if (EN_DAY_DATES[day.id]) {
      const en = EN_DAY_DATES[day.id];
      return {
        weekdayShort: en.wd,
        weekdayFull: en.wdf,
        dateShort: en.ds,
        dateLong: en.dl,
      };
    }
    const dt = parseIsoUtc(day.id);
    if (dt) {
      const weekdayShort = new Intl.DateTimeFormat('en-GB', {
        weekday: 'short',
        timeZone: 'UTC',
      }).format(dt);
      const weekdayFull = new Intl.DateTimeFormat('en-GB', {
        weekday: 'long',
        timeZone: 'UTC',
      }).format(dt);
      const dayNum = dt.getUTCDate();
      const monthShort = new Intl.DateTimeFormat('en-GB', {
        month: 'short',
        timeZone: 'UTC',
      }).format(dt);
      const monthLong = new Intl.DateTimeFormat('en-GB', {
        month: 'long',
        timeZone: 'UTC',
      }).format(dt);
      return {
        weekdayShort,
        weekdayFull,
        dateShort: `${dayNum} ${monthShort}`,
        dateLong: `${weekdayFull}, ${dayNum} ${monthLong} ${dt.getUTCFullYear()}`,
      };
    }
  }

  if (day.weekdayShort && day.dateShort && day.dateLong) {
    return {
      weekdayShort: day.weekdayShort,
      weekdayFull: day.weekdayFull,
      dateShort: day.dateShort,
      dateLong: day.dateLong,
    };
  }

  const dt = parseIsoUtc(day.id);
  if (dt) {
    const rawWd = capitalize(
      new Intl.DateTimeFormat('fr-FR', {
        weekday: 'short',
        timeZone: 'UTC',
      }).format(dt)
    );
    const weekdayShort = rawWd.endsWith('.') ? rawWd : `${rawWd}.`;
    const weekdayFull = capitalize(
      new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        timeZone: 'UTC',
      }).format(dt)
    );
    const dayNum = dt.getUTCDate();
    const dayStr = dayNum === 1 ? '1er' : String(dayNum);
    const monthShort = new Intl.DateTimeFormat('fr-FR', {
      month: 'short',
      timeZone: 'UTC',
    }).format(dt);
    const monthLong = new Intl.DateTimeFormat('fr-FR', {
      month: 'long',
      timeZone: 'UTC',
    }).format(dt);
    return {
      weekdayShort,
      weekdayFull,
      dateShort: `${dayStr} ${monthShort}`,
      dateLong: `${weekdayFull} ${dayStr} ${monthLong} ${dt.getUTCFullYear()}`,
    };
  }

  return {
    weekdayShort: day.weekdayShort,
    weekdayFull: day.weekdayFull,
    dateShort: day.dateShort,
    dateLong: day.dateLong,
  };
}

export function getBookingLabel(status: BookingStatus, lang: Language): string {
  const map: Record<Language, Record<BookingStatus, string>> = {
    fr: {
      a_reserver: 'À réserver',
      reserve: 'Réservé',
      sur_place: 'Sur place',
      entree_libre: 'Libre',
    },
    en: {
      a_reserver: 'To book',
      reserve: 'Booked',
      sur_place: 'On site',
      entree_libre: 'Free',
    },
  };
  return map[lang][status];
}

export function getCategoryLabel(
  cat: ExpenseCategory,
  lang: Language,
  short = false
): string {
  const map: Record<Language, Record<ExpenseCategory, { full: string; short: string }>> = {
    fr: {
      activites: { full: 'Activités', short: 'Activités' },
      repas: { full: 'Repas & Courses', short: 'Repas' },
      transports: { full: 'Transports', short: 'Transports' },
      shopping: { full: 'Shopping & Extras', short: 'Shopping' },
    },
    en: {
      activites: { full: 'Activities', short: 'Activities' },
      repas: { full: 'Food & Groceries', short: 'Food' },
      transports: { full: 'Transport', short: 'Transport' },
      shopping: { full: 'Shopping & Extras', short: 'Shopping' },
    },
  };
  return short ? map[lang][cat].short : map[lang][cat].full;
}

export function getTagLabel(tag: ActivityTag, lang: Language): string {
  const map: Record<Language, Record<ActivityTag, string>> = {
    fr: {
      gratuit: 'Gratuit',
      resident_th: 'Résident TH',
      interieur: 'Intérieur',
      top_4_ans: 'Top 4 ans',
    },
    en: {
      gratuit: 'Free',
      resident_th: 'TH Resident',
      interieur: 'Indoor',
      top_4_ans: 'Great for 4yo',
    },
  };
  return map[lang][tag];
}

export function getKidRatingLabel(rating: KidCompatibility, lang: Language): string {
  if (lang === 'fr') return rating;
  if (rating === 'Adapté') return 'Suited';
  if (rating === 'Calme') return 'Calm';
  return 'Top';
}

export function getWeatherConditionLabel(kind: WeatherKind, lang: Language): string {
  return UI_TEXT[lang].weather.conditions[kind];
}
