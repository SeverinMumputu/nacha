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
      description: 'Moyennement piquant avec une saveur aromatisante à base du mukubi, une épice aux propriétés thérapeutiques exceptionnelles.',
      facts: ['Format 60 grammes'], image: 'piment_bocal_6.jpeg', imageAlt: 'Produit NACHA petit format 60 grammes',
        // Photographies supplémentaires du même produit.
  images: [
    { src: 'groupe_piment_bocal_7.jpeg', alt: '' }
  ],
      price: 4000, theme: 'product-tone--small'
    },

    {
      id: 'nacha-red-100g', title: 'NACHA ELENGI', weight: '100 g', kicker: 'La version piquante',
      description: 'Piquant avec une saveur aromatisante à base du poivre sauvage des forêts de la RDC. Ce type de poivre favorise la digestion et possède des vertus antibactériennes.',
      facts: ['Version piquante', 'Sachet rouge · 100 grammes'], image: 'piment_sachet_rouge.jpg', imageAlt: 'Sachet rouge NACHA 100 grammes',
      price: 6500, theme: 'product-tone--red'
    },

    {
      id: 'nacha-green-100g', title: 'NACHA SEBENE vert', weight: '100 g', kicker: 'La spécialité Mukubi',
      description: 'Moyennement piquant avec une saveur aromatisante à base du mukubi, une épice aux propriétés thérapeutiques exceptionnelles.',
      facts: ['Spécialité Mukubi', 'Sachet vert · 100 grammes'], image: 'piment_vert.jpg', imageAlt: 'Sachet vert NACHA 100 grammes',
        images: [
    { src: 'Nacha_Vert.png', alt: 'Vue arrière du produit NACHA 60 g' },
    // { src: 'photo-60g-detail.jpeg', alt: 'Détail du produit NACHA 60 g' },
    // { src: 'photo-60g-packaging.jpeg', alt: 'Présentation du produit NACHA 60 g' }
  ],
      price: 6500, theme: 'product-tone--green'
    },
    {
      id: 'nacha-portable-15g', title: 'NACHA portatif', weight: '15 g', kicker: 'Le format à emporter',
      description: 'Le petit format portatif de Nacha, qui vous accompagne partout.',
      facts: ['Format portatif', '15 grammes'], image: 'piment_petit_format.jpg', imageAlt: 'Format portatif NACHA 15 grammes',
      price: 5000, theme: 'product-tone--portable'
    }
  ],
  socials: {
    tiktok: '',
    x: '',
    instagram: 'https://www.instagram.com/nacha_spices?obrf=Z3VzeDd0ODJhN2xj',
    facebook: ''
  }
};
