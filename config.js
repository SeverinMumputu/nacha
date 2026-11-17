/*
  Configuration du site NACHA.
  Renseigner les prix exacts en FC et le numéro WhatsApp Business officiel avant d'activer les commandes.
  Le numéro doit être au format international, chiffres uniquement, sans + ni espaces.
*/
window.NACHA_CONFIG = {
  currency: 'FC',
  whatsappBusinessNumber: '32492887742', // Numéro fourni dans la configuration actuelle.
  heroSlides: [
    { label: 'Vidéo 1', video: 'video_officielle.mp4', poster: '', theme: 'hero-scene--one' },
    { label: 'Image 1', image: 'image_off1.jpeg', theme: 'hero-scene--two' },
    { label: 'Image 2', image: 'image_off2.jpeg', theme: 'hero-scene--two' },
    { label: 'Image 3', image: 'piment_sachet_rouge.jpg', theme: 'hero-scene--three' },
    { label: 'Image 4', image: 'double_dose.jpg', theme: 'hero-scene--three' },
    { label: 'Image 5', image: 'piment_bocal_4.jpg', theme: 'hero-scene--three' },
    { label: 'Image 6', image: 'piment_bocal_3.jpg', theme: 'hero-scene--three' },
    { label: 'Image 7', image: 'piment_bocal_2.jpg', theme: 'hero-scene--three' },
    { label: 'Image 8', image: 'piment_bocal.jpg', theme: 'hero-scene--three' },
    { label: 'Image 9', image: 'piment_complet.jpg', theme: 'hero-scene--three' },
    { label: 'Image 10', image: 'piment_bocal_5.jpg', theme: 'hero-scene--two' },
  ],
  footerSlides: [
    'platAvecNacha_1.jpg',
    'platAvecNacha_2.jpg',
    'platAvecNacha_3.jpg'
  ],
  products: [
    {
      id: 'nacha-60g', title: 'NACHA SEBENE', weight: '60 g', kicker: 'Le format découverte',
      description: 'Une poudre de piment moyennement piquant élaborée à partir de piment à bec long de type Cayenne, associé au Mukubi, l\’oignon sauvage. Pensé pour le quotidien des familles, des restaurants, grilleries etc, il apporte du goût, du caractère et une touche authentique à chaque repas.',
      facts: ['Format 60 grammes'], image: 'piment_bocal_6.jpeg', imageAlt: 'Produit NACHA petit format 60 grammes',
        // images supplémentaires du même produit.
      images: [
        { src: 'groupe_piment_bocal_7.jpeg', alt: '' }
      ],
      oldPrice: 5550, // Ancien prix réel, à renseigner en FC
      usage: 'apporte une saveur locale profonde et parfumée. Idéal pour les sauces, maboké, viandes (grillades), poissons et plats traditionnels. Format familial pour l\’utilisation quotidienne à la maison : sauces, légumes, viande, poisson et repas en famille.',
      composition: 'Piment, oignons, sel, mukubi',
      price: 4000, theme: 'product-tone--small'
    },

    {
      id: 'nacha-red-100g', title: 'NACHA ELENGI', weight: '100 g', kicker: 'La version piquante',
      description: 'Une poudre de piment très piquant élaborée à partir de piment à bec long de type Cayenne, associé au poivre sauvage (ketshu). Pensé pour le quotidien des familles, des restaurants, grilleries etc,. Il apporte du goût, du caractère et une touche authentique à chaque repas.',
      facts: ['Version piquante', 'Sachet rouge · 100 grammes'], image: 'piment_sachet_rouge.jpg', imageAlt: 'Sachet rouge NACHA 100 grammes',
      oldPrice: 8500, // Ancien prix réel, à renseigner en FC
      usage: 'Donne un goût intense et plus relevé. Recommandé pour les brochettes, viandes rouges, grillades et préparations épicées. Format premium destiné aux familles consommatrices de piment, restaurants, ngandas, traiteurs et autres professionnels de la restauration. ', 
      composition: 'Poivre,piment, sel',
      price: 6500, theme: 'product-tone--red'
    },

    {
      id: 'nacha-green-100g', title: 'NACHA SEBENE', weight: '100 g', kicker: 'La spécialité Mukubi',
      description: 'Une poudre de piment moyennement piquant élaborée à partir de piment à bec long de type Cayenne, associé au Mukubi, l\’oignon sauvage. Pensé pour le quotidien des familles, des restaurants, grilleries etc, il apporte du goût, du caractère et une touche authentique à chaque repas.',
      facts: ['Spécialité Mukubi', 'Sachet vert · 100 grammes'], image: 'piment_vert.jpg', imageAlt: 'Sachet vert NACHA 100 grammes',
        images: [
    { src: 'Nacha_Vert.png', alt: 'Vue arrière du produit NACHA 60 g' }
  ],
      oldPrice: 7550,
      usage: 'Apporte une saveur locale profonde et parfumée. Idéal pour les sauces, maboké, viandes (grillades), poissons et plats traditionnels. Format premium destiné aux familles consommatrices de piment, restaurants, ngandas, et autres professionnels de la restauration.',
      composition: 'Piment, oignons, mukubi, sel',
      price: 6500, theme: 'product-tone--green'
    },

    {
      id: 'nacha-portable-5g', title: 'NACHA portatif', weight: '5 g', kicker: 'Le format à emporter',
      description: 'Format individuel, pratique et accessible. Pour les snacks, kiosques, repas rapides, œufs, brochettes et vente à emporter.',
      facts: ['Format portatif', '5 grammes'], image: 'piment_petit_format.jpg', imageAlt: 'Format portatif NACHA 5 grammes',
      oldPrice: 6550, // Ancien prix réel, à renseigner en FC
      usage: 'Le petit format portatif de Nacha, qui vous accompagne partout.',      // Conseils d'utilisation validés par NACHA
      composition: 'sel,piment',
      price: 5000, theme: 'product-tone--portable'
    },

    {
      id: 'nacha-mix-50g', title: 'NACHA MIX AIL ET OIGNON', weight: '50 g', kicker: 'Le format MIX',
      description: 'Format individuel, pratique et accessible. Pour les snacks, kiosques, repas rapides, œufs, brochettes.',
      facts: ['50 grammes'], image: 'piment_bocal.jpg', imageAlt: 'Format Mix NACHA 50 grammes',
      oldPrice: 6550, // Ancien prix réel, à renseigner en FC
      usage: 'Le format Mix délicieux de Nacha pour les snacks, repas rapides.',
      composition: 'sel,piment',
      price: 5000, theme: 'product-tone--portable'
    },

      {
      id: 'nacha-ail-50g', title: 'NACHA AIL EN POUDRE', weight: '50 g', kicker: 'Le format Ail en Poudre',
      description: 'Format individuel, pratique et accessible. Pour les snacks, kiosques, repas rapides, œufs, brochettes.',
      facts: ['50 grammes'], image: 'AIL_POUDRE.jpeg', imageAlt: 'Format AIL NACHA 50 grammes',
      oldPrice: 6550, // Ancien prix réel, à renseigner en FC
      usage: 'Le format Mix délicieux de Nacha pour les snacks, repas rapides.',
      composition: 'sel,piment',
      price: 5000, theme: 'product-tone--portable'
    },

    {
      id: 'nacha-ginger-100g', title: 'NACHA GINGEMBRE', weight: '100 g', kicker: 'La spécialité Gingembre',
      description: 'Une poudre de piment moyennement piquant élaborée à partir de piment à bec long de type Cayenne, associé au Gingembre, l\’oignon sauvage. Pensé pour le quotidien des familles, des restaurants, grilleries etc, il apporte du goût, du caractère et une touche authentique à chaque repas.',
      facts: ['Spécialité Gingembre', 'Sachet vert · 100 grammes'], image: 'GINGEMBRE_NACHA.jpeg', imageAlt: 'NACHA GINGEMBRE',
      oldPrice: 7550,
      usage: 'Apporte une saveur locale profonde et parfumée. Idéal pour les sauces, maboké, viandes (grillades), poissons et plats traditionnels. Format premium destiné aux familles consommatrices de piment, restaurants, ngandas, et autres professionnels de la restauration.',
      composition: 'Piment, oignons, Gingembre, sel',
      price: 6500, theme: 'product-tone--green'
    },
  ],


// =====================================================
// GOOGLE MAPS — NACHA
// =====================================================

// Identifiant de démonstration pour les tests.
googleMapsApiKey: 'AIzaSyCxSqUu7cPEJ0HbzIfTBvPm3oL5u413Rnc',
googleMapsMapId: 'c7535d4652077645cfe9e067',

storeLocations: [

  {
    id: 'la-prima',
    number: '01',

    commune: 'Gombe',
    type: 'Supermarché partenaire',

    name: 'La Prima',

    address:
      'Kinshasa Mall, Avenue du 24 Novembre, Gombe, Kinshasa',

    landmark:
      'À l’intérieur du Kinshasa Mall',

    phone: '',

    coverage: 'Gombe',

    hours:
      'Tous les jours : 08h00 – 22h00 (horaires indicatifs)',

    availability:
      'Disponibilité des produits à confirmer directement en magasin.',

    position: {
      lat: -4.31538,
      lng: 15.29187
    }
  },

  {
    id: 'gg-mart',
    number: '02',

    commune: 'Gombe',
    type: 'Supermarché partenaire',

    name: 'GG Mart',

    address:
      '1, Avenue Tombalbaye, Kin Mazière, Gombe, Kinshasa',

    landmark:
      'Kin Mazière — Avenue Tombalbaye',

    phone: '',

    coverage: 'Gombe',

    hours:
      'Lundi à samedi : 07h00 – 23h00. Dimanche : 08h00 – 21h30.',

    availability:
      'Disponibilité des produits à confirmer directement en magasin.',

    position: {
      lat: -4.30603,
      lng: 15.31290
    }
  },

  {
    id: 'sk-cnss',
    number: '03',

    commune: 'Gombe',
    type: 'Supermarché partenaire',

    name: 'Super Marché S&K',

    address:
      'Avenue Mbuji-Mayi n°1/A, Gombe, Kinshasa',

    landmark:
      'En face de la CNSS — Avenue Mbuji-Mayi',

    phone: '+243 833 180 825',

    coverage: 'Gombe',

    hours:
      'Tous les jours : 06h00 – 00h00 (à confirmer).',

    availability:
      'Disponibilité des produits à confirmer directement en magasin.',

    position: {
      lat: -4.303424,
      lng: 15.296028
    }
  }

],


  socials: {
    tiktok: '',
    x: '',
    instagram: 'https://www.instagram.com/nacha_spices?obrf=Z3VzeDd0ODJhN2xj',
    facebook: ''
  }
};
