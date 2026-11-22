import type { JournalDayContent } from '../types/trip';

export const JOURNAL_CONTENT: Record<string, JournalDayContent> = {
  '2026-12-22': {
    dayId: '2026-12-22',
    subtitle: 'Retrouver notre Londres d’hiver, les mains légères',
    morning:
      'Départ de Casablanca sur le vol AT800 à 13h05, en mode ultra-léger avec nos seuls bagages cabine. L’excitation monte dans l’avion : Aya raconte à Adam ce dont elle se souvient des bus rouges, tandis qu’Adam s’apprête à redécouvrir sa ville de naissance pour la première fois depuis qu’il était bébé.',
    lunchTitle: 'Goûter & premier dîner autour de Shepherd Market',
    lunch:
      'Après les premières courses sur Curzon Street, un chocolat chaud rapide chez Caffè Nero ou un dîner réconfortant et rapide chez Franco Manca / Honest Burgers vers Green Park, ou tout simplement des pâtes chaudes à l’appartement si la fatigue du vol se fait sentir.',
    afternoon:
      'À 15h25, Heathrow nous accueille sous le ciel gris-bleu de décembre. La Piccadilly Line file directement jusqu’à Hyde Park Corner : zéro changement, zéro stress. Une fois posés sur Hertford Street, on ressort juste 45 minutes respirer l’air frais de Mayfair, admirer les sapins de Mount Street et les vitrines illuminées de Fortnum & Mason.',
    logisticsNote:
      'Garder les cartes Contactless (1 par adulte, enfants gratuits < 11 ans sur le Tube !) à portée de main dès la sortie de Heathrow. Vérifier les horaires de fermeture du supermarché le plus proche pour le 24.',
    marginQuote: 'Bienvenue à la maison, W1J 7SU !',
    route: {
      mode: 'r',
      stops: [
        { label: 'Heathrow T4', query: 'London Heathrow Airport Terminal 4, UK' },
        { label: 'Mayfair W1J 7SU', query: 'Hertford Street, Mayfair, London W1J 7SU, UK' },
      ],
    },
  },
  '2026-12-23': {
    dayId: '2026-12-23',
    subtitle: 'Les jouets qui volent et les trésors des pharaons',
    morning:
      'Premier vrai matin londonien, et quel réveil pour les enfants : à 9h45 tapantes, nous voilà devant les grandes portes de Hamleys sur Regent Street. À 10h00, la cloche sonne, les vendeurs applaudissent et lancent des avions en mousse — les yeux d’Adam et d’Aya brillent instantanément. On parcourt les 7 étages avant que le magasin ne se remplisse.',
    lunchTitle: 'Pause gourmande entre Regent Street et Bloomsbury',
    lunch:
      'Cap vers Soho / Bloomsbury pour un déjeuner facile avec les enfants : Pizza Pilgrims (Kingly Court ou Dean Street) pour des pizzas napolitaines moelleuses et des crayons à la table, ou Wagamama près de Great Russell Street avec leurs menus enfants adorés.',
    afternoon:
      'Direction le British Museum avec une règle d’or : 1h30 à 2h maximum, pour que cela reste un plaisir pur ! On emprunte un Family Backpack gratuit à l’accueil, on salue la Pierre de Rosette et on file vers les galeries égyptiennes où les sarcophages et momies fascinent Aya pendant qu’Adam cherche les animaux cachés sur les fresques.',
    logisticsNote:
      'Réserver le créneau gratuit du British Museum en ligne pour passer par la file rapide. Les poussettes pliantes passent très bien mais l’entrée Montague Place (arrière) est souvent plus fluide que Great Russell Street.',
    marginQuote: 'Astuce : sortir du musée tant que tout le monde a encore le sourire !',
    route: {
      mode: 'w',
      stops: [
        { label: 'Mayfair W1J 7SU', query: 'Hertford Street, Mayfair, London W1J 7SU, UK' },
        { label: 'Hamleys', query: 'Hamleys, 188-196 Regent Street, London, UK' },
        { label: 'British Museum', query: 'The British Museum, Great Russell Street, London, UK' },
      ],
    },
  },
  '2026-12-24': {
    dayId: '2026-12-24',
    subtitle: 'Manèges à 10 minutes de la maison & veille de Noël',
    morning:
      'Pas besoin de métro ce matin : Hyde Park Winter Wonderland est littéralement au bout de notre rue, à 10 minutes à pied ! Arriver à l’ouverture à 10h00 change tout : allées calmes, musique de Noël douce, manèges de Santaland sans attente pour Adam et grandes glissades ou stands de jeux pour Aya.',
    lunchTitle: 'Pause chaude sur place ou retour à Mayfair',
    lunch:
      'Churros chauds, crêpes et chocolats fumants dans les chalets bavarois de Winter Wonderland, ou retour au chaud dans le salon de Hertford Street pour une soupe et des sandwichs de Noël M&S avant d’attaquer les courses.',
    afternoon:
      'Alerte horaire : aujourd’hui, Londres baisse le rideau tôt ! On boucle toutes nos courses du réveillon et du 25 décembre avant 16h00 (petit-déjeuner festif, dîner du 24, déjeuner et goûter du 25). Le soir, les transports s’arrêtent et la ville s’apaise pendant qu’on prépare notre réveillon familial bien au chaud.',
    logisticsNote:
      'Gants, bonnets et chaussettes chaudes obligatoires pour Winter Wonderland (le parc est humide). Vérifier qu’on a bien tout pour tenir 24h complètes sans aucun magasin ouvert demain.',
    marginQuote: 'Tout boucler avant 16h : demain Londres dort !',
    route: {
      mode: 'w',
      stops: [
        { label: 'Mayfair W1J 7SU', query: 'Hertford Street, Mayfair, London W1J 7SU, UK' },
        { label: 'Winter Wonderland', query: 'Hyde Park Winter Wonderland, London, UK' },
        { label: 'Shepherd Market', query: 'Shepherd Market, Mayfair, London, UK' },
      ],
    },
  },
  '2026-12-25': {
    dayId: '2026-12-25',
    subtitle: 'Le privilège rare d’un Londres silencieux rien que pour nous',
    morning:
      'Joyeux Noël à Londres ! Après un matin doux à l’appartement, on chausse nos meilleures baskets : pas un bus, pas un métro ne circule aujourd’hui, et c’est justement ce qui rend cette journée inoubliable. On traverse Green Park jusqu’à Buckingham Palace, puis St James’s Park où les écureuils et pélicans règnent sur des allées presque désertes.',
    lunchTitle: 'Déjeuner de Noël à l’appartement (puis goûter chaud)',
    lunch:
      'Retour tranquille à Hertford Street pour notre déjeuner de Noël maison, suivi d’un moment de repos bien mérité pour les petites jambes d’Adam avant la sortie lumineuse de fin de journée.',
    afternoon:
      'Dès 16h15, la nuit tombe sur le West End et toutes les guirlandes s’allument. Marcher le long de Piccadilly, remonter Regent Street sous les grands anges dorés et flâner sur New Bond Street sans klaxons ni foule pressée est un vrai conte d’hiver.',
    logisticsNote:
      'Aucun commerce alimentaire ouvert hormis quelques petites supérettes indépendantes. Prendre un thermos de chocolat chaud et des biscuits dans le sac à dos pour la balade de fin d’après-midi.',
    marginQuote: 'Regent Street sans voitures : souvenir gravé à vie.',
    route: {
      mode: 'w',
      stops: [
        { label: 'Mayfair W1J 7SU', query: 'Hertford Street, Mayfair, London W1J 7SU, UK' },
        { label: 'Buckingham Palace', query: 'Buckingham Palace, London, UK' },
        { label: 'St James’s Park', query: 'St Jamess Park, London, UK' },
        { label: 'Regent Street', query: 'Regent Street, London, UK' },
      ],
    },
  },
  '2026-12-26': {
    dayId: '2026-12-26',
    subtitle: 'Boxing Day sous les cheminées Art Déco de Battersea',
    morning:
      'En ce Boxing Day, les grands musées nationaux sont encore fermés, mais la spectaculaire Battersea Power Station ouvre ses immenses halls chauffés. Un saut en Northern Line et nous voilà face aux quatre cheminées blanches iconiques, prêts pour la patinoire Glide au bord de la Tamise.',
    lunchTitle: 'Déjeuner chaleureux dans la Turbine Hall',
    lunch:
      'À l’intérieur même de la centrale, l’embarras du choix en mode kid-friendly : Bread Street Kitchen (menu enfants généreux), Roti King pour les amateurs d’épices douces, ou le food court Arcade Food Hall au 1er étage où chacun choisit ce qui lui fait envie.',
    afternoon:
      'On flâne au chaud dans les galeries Art Déco, on guette les bonnes affaires de Boxing Day et, si le ciel se dégage, on peut même s’offrir en bonus la montée vitrée de Lift 109 tout en haut de la cheminée nord-ouest pour une vue panoramique à 360° sur la Tamise.',
    logisticsNote:
      'Vérifier les horaires de la Northern Line le 26 décembre (service dimanche/réduit). La station Battersea Power Station est entièrement accessible avec ascenseurs larges.',
    marginQuote: 'Chaud dedans, patins dehors : le Boxing Day parfait.',
    route: {
      mode: 'r',
      stops: [
        { label: 'Mayfair W1J 7SU', query: 'Hertford Street, Mayfair, London W1J 7SU, UK' },
        { label: 'Battersea Power Station', query: 'Battersea Power Station, London SW11 8AL, UK' },
      ],
    },
  },
  '2026-12-27': {
    dayId: '2026-12-27',
    subtitle: 'Notre journée royale à £1 grâce à Tower Hamlets',
    morning:
      'Grande journée historique et fierté d’anciens résidents : grâce au tarif résident Tower Hamlets, nous entrons dès 10h00 à la Tour de Londres pour £1 ! On file aussitôt admirer les Joyaux de la Couronne avant les groupes, puis direction la Tour Blanche, les armures royales et les célèbres corbeaux dans la cour.',
    lunchTitle: 'Pause déjeuner à St Katharine Docks ou sur le quai',
    lunch:
      'À deux minutes à pied de la sortie, la marina calme de St Katharine Docks offre un décor superbe : Bravas Tapas, Honest Burgers ou Côte Brasserie (menu enfant soigné et service rapide), avec vue sur les bateaux décorés.',
    afternoon:
      'À 14h15, on traverse les quelques mètres vers Tower Bridge (là encore à £1 grâce au justificatif !). Moment frisson garanti pour Aya et Adam sur les passerelles vitrées à 42 mètres au-dessus des bus rouges, avant de descendre explorer les magnifiques salles des machines victoriennes peintes de vert et d’or.',
    logisticsNote:
      'IMPÉRATIF dans le sac dès le matin : justificatif de résidence Tower Hamlets + pièce d’identité avec photo. Sans ces documents, pas de tarif £1 (économie de ~£124 sur la journée !).',
    marginQuote: '~£124 économisés aujourd’hui : merci Tower Hamlets !',
    route: {
      mode: 'w',
      stops: [
        { label: 'Tower Hill', query: 'Tower Hill Underground Station, London, UK' },
        { label: 'Tour de Londres', query: 'Tower of London, London EC3N 4AB, UK' },
        { label: 'St Katharine Docks', query: 'St Katharine Docks, London, UK' },
        { label: 'Tower Bridge', query: 'Tower Bridge, London SE1 2UP, UK' },
      ],
    },
  },
  '2026-12-28': {
    dayId: '2026-12-28',
    subtitle: 'Dinosaures, baleine bleue et mains dans l’eau',
    morning:
      'C’est Bank Holiday : tout Londres sort aujourd’hui, mais nous avons l’arme secrète — 4 minutes de Piccadilly Line directe depuis Hyde Park Corner et notre créneau de 10h00 pile au Natural History Museum ! On démarre fort avec les dinosaures et le T-Rex animatronique, puis la majestueuse baleine bleue Hope et la salle des volcans.',
    lunchTitle: 'Pause réconfortante sur Exhibition Road',
    lunch:
      'Pour éviter la cohue des cafétérias à midi, on sort 3 minutes vers South Kensington : Comptoir Libanais (joyeux et coloré, très apprécié des enfants), Brindisa, ou pique-nique dans la Picnic Area dédiée du Science Museum.',
    afternoon:
      'À 200 mètres de là, le Science Museum offre le duo parfait pour nos deux âges : pendant qu’Adam s’éclate au sous-sol dans The Garden (jeux d’eau, poulies et sons pour les 3–6 ans), Aya explore les expériences spectaculaires et les toboggans géants du Wonderlab.',
    logisticsNote:
      'Prendre un haut de rechange léger pour Adam (les jeux d’eau de The Garden ont des tabliers, mais les manches finissent souvent mouillées !). Réserver 10h00 au NHM et le créneau Wonderlab bien en amont.',
    marginQuote: '4 minutes de Tube direct : le luxe de Mayfair.',
    route: {
      mode: 'w',
      stops: [
        { label: 'Mayfair W1J 7SU', query: 'Hertford Street, Mayfair, London W1J 7SU, UK' },
        { label: 'Natural History Museum', query: 'Natural History Museum, Cromwell Road, London, UK' },
        { label: 'Science Museum', query: 'Science Museum, Exhibition Road, London, UK' },
      ],
    },
  },
  '2026-12-29': {
    dayId: '2026-12-29',
    subtitle: 'Retour aux sources dans l’Est londonien & paradis du jeu',
    morning:
      'Cap à l’Est vers Bethnal Green pour découvrir le fabuleux Young V&A (l’ancien Museum of Childhood entièrement métamorphosé). Ici, aucune vitrine intimidante : les galeries Play, Imagine et Design invitent Adam et Aya à construire, se déguiser, monter sur scène et inventer pendant toute la matinée.',
    lunchTitle: 'Pause gourmande dans l’Est londonien',
    lunch:
      'Déjeuner au café lumineux du Young V&A, ou petite marche vers le Pavilion Café au bord du lac de Victoria Park (viennoiseries, soupes chaudes et plats réconfortants), ou cap sur Old Spitalfields Market pour des crêpes et stands variés.',
    afternoon:
      'Après-midi délibérément libre dans notre ancien quartier de cœur : balade au grand air à Victoria Park si le soleil perce, chocolat chaud à Spitalfields ou petite virée sur Brick Lane pour montrer aux enfants l’autre visage créatif et chaleureux de Londres.',
    logisticsNote:
      'Journée « respiration » en milieu de séjour : aucune réservation stricte, on s’adapte au niveau de fatigue d’Adam et à la météo.',
    marginQuote: 'Le musée préféré d’Adam, sans l’ombre d’un doute !',
    route: {
      mode: 'w',
      stops: [
        { label: 'Bethnal Green', query: 'Bethnal Green Underground Station, London, UK' },
        { label: 'Young V&A', query: 'Young V&A, Cambridge Heath Road, London, UK' },
        { label: 'Victoria Park', query: 'Victoria Park Pavilion Cafe, London, UK' },
        { label: 'Spitalfields', query: 'Old Spitalfields Market, London, UK' },
      ],
    },
  },
  '2026-12-30': {
    dayId: '2026-12-30',
    subtitle: 'Tambours royaux le matin, bus impériaux l’après-midi',
    morning:
      'Départ à pied à 10h15 vers les abords de Buckingham Palace pour la Relève de la Garde. Plutôt que de rester coincés derrière dix rangs devant les grilles, on se place vers St James’s Palace ou Wellington Barracks pour voir la fanfare défiler tout près ! (Plan B pluie : on se réfugie au chaud à St James’s ou à la National Gallery.)',
    lunchTitle: 'Déjeuner animé à Seven Dials Market / Covent Garden',
    lunch:
      'Saut en Piccadilly Line jusqu’à Leicester Square (on évite absolument la station Covent Garden et ses ascenseurs bondés !) puis 4 minutes à pied jusqu’à Seven Dials Market : ambiance joyeuse, abritée et mille options pour petits et grands.',
    afternoon:
      'À 14h00, cap sur le London Transport Museum sur la Piazza. Un triomphe absolu à 4 ans comme à 8 ans : on grimpe dans les vieux bus rouges, on collectionne les tampons du parcours enfant, Aya teste le simulateur de métro et Adam passe un temps fou dans la zone de jeux All Aboard.',
    logisticsNote:
      'Astuce en or : toujours descendre à Leicester Square (et jamais Covent Garden) avec des enfants. Le billet adulte du London Transport Museum est valable 1 an et gratuit pour les enfants !',
    marginQuote: 'Toujours Leicester Square, jamais les ascenseurs de Covent Garden !',
    route: {
      mode: 'w',
      stops: [
        { label: 'Mayfair W1J 7SU', query: 'Hertford Street, Mayfair, London W1J 7SU, UK' },
        { label: 'Buckingham Palace', query: 'Buckingham Palace, London, UK' },
        { label: 'Seven Dials', query: 'Seven Dials Market, Covent Garden, London, UK' },
        { label: 'Transport Museum', query: 'London Transport Museum, Covent Garden Piazza, London, UK' },
      ],
    },
  },
  '2026-12-31': {
    dayId: '2026-12-31',
    subtitle: 'À l’abordage à Kensington Gardens & Saint-Sylvestre douce',
    morning:
      'Dernière grande matinée de jeu en plein air : direction Kensington Gardens dès 10h00 pour le mythique Diana Princess of Wales Memorial Playground. Autour de l’immense bateau pirate en bois posé sur le sable, Aya invente des histoires de Peter Pan tandis qu’Adam explore les tipis et les parcours en bois.',
    lunchTitle: 'Déjeuner chaud près de Kensington ou retour Mayfair',
    lunch:
      'Un plat chaud au café juste à côté de l’aire de jeux ou sur Queensway / High Street Kensington (Honest Burgers, Dishoom Kensington ou café boulangerie), avant une balade tranquille dans les jardins.',
    afternoon:
      'L’aire de jeux ferme à 15h45 en hiver, et le centre autour de la Tamise et de Westminster se boucle progressivement dès la fin d’après-midi pour les feux d’artifice payants. On rentre sagement à Mayfair avant 17h00 : bouclage des valises cabine et joli réveillon du 31 au calme à l’appartement.',
    logisticsNote:
      'Vérifier que les valises cabine respectent bien les liquides (< 100 ml) et le poids avant de se coucher, pour profiter sereinement de la parade demain midi.',
    marginQuote: 'Retour au chaud avant 17h : bonne année 2027 en douceur !',
    route: {
      mode: 'w',
      stops: [
        { label: 'Mayfair W1J 7SU', query: 'Hertford Street, Mayfair, London W1J 7SU, UK' },
        { label: 'Memorial Playground', query: 'Diana Princess of Wales Memorial Playground, London, UK' },
        { label: 'Kensington', query: 'High Street Kensington, London, UK' },
      ],
    },
  },
  '2027-01-01': {
    dayId: '2027-01-01',
    subtitle: 'Derniers accords de fanfare sur Piccadilly & retour au soleil',
    morning:
      'Matinée paisible de rangement et de dernier petit-déjeuner anglais à Hertford Street. À 13h00, on n’a qu’à descendre au bout de la rue sur Piccadilly pour applaudir pendant une bonne demi-heure la London New Year’s Day Parade : fanfares, chars, danseurs et ballons géants pour un au revoir en fanfare !',
    lunchTitle: 'Déjeuner léger avant le départ & goûter à Heathrow',
    lunch:
      'Brunch matinal à l’appartement pour vider le frigo, quelques snacks dans le sac pour le métro, puis pause goûter tranquille après les contrôles à Heathrow Terminal 4 en attendant l’embarquement du vol AT801.',
    afternoon:
      'Règle absolue à 13h45–14h00 : aucun taxi ni Uber (toutes les rues autour de Mayfair sont bloquées par la parade). On file directement sous terre à la station Hyde Park Corner, direction Heathrow Terminal 4 par la Piccadilly Line directe. Décollage AT801 à 17h15, atterrissage à Casablanca Terminal 2 à 21h30, la tête pleine de lumières.',
    logisticsNote:
      'Garder 15 min de marge pour rejoindre l’entrée du métro Hyde Park Corner en contournant la foule de Piccadilly. Bagages cabine = passage direct sécurité sans dépose-bagages.',
    marginQuote: 'Piccadilly Line à 13h45 pile — zéro taxi aujourd’hui !',
    route: {
      mode: 'r',
      stops: [
        { label: 'Hyde Park Corner', query: 'Hyde Park Corner Underground Station, London, UK' },
        { label: 'Heathrow T4', query: 'London Heathrow Airport Terminal 4, UK' },
      ],
    },
  },
};
