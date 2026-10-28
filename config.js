/*
  Configuration du site NACHA.
  Renseigner les prix exacts en FC et le numéro WhatsApp Business officiel avant d'activer les commandes.
  Le numéro doit être au format international, chiffres uniquement, sans + ni espaces.
*/
window.NACHA_CONFIG = {
  currency: 'FC',
  whatsappBusinessNumber: '32492887742', // Numéro fourni dans la configuration actuelle.
  heroSlides: [
    { label: 'Vidéo 1', video: 'video_1.mp4', poster: '', theme: 'hero-scene--one' },
    { label: 'Image 1', image: 'piment_bocal_5.jpg', theme: 'hero-scene--two' },
    { label: 'Image 3', image: 'piment_sachet_rouge.jpg', theme: 'hero-scene--three' },
    { label: 'Image 4', image: 'double_dose.jpg', theme: 'hero-scene--three' },
    { label: 'Image 5', image: 'piment_bocal_4.jpg', theme: 'hero-scene--three' },
    { label: 'Image 6', image: 'piment_bocal_3.jpg', theme: 'hero-scene--three' },
    { label: 'Image 7', image: 'piment_bocal_2.jpg', theme: 'hero-scene--three' },
    { label: 'Image 8', image: 'piment_bocal.jpg', theme: 'hero-scene--three' },
    { label: 'Image 9', image: 'piment_complet.jpg', theme: 'hero-scene--three' },
  ],
  footerSlides: [
    'platAvecNacha_1.jpg',
    'platAvecNacha_2.jpg',
    'platAvecNacha_3.jpg'
  ],
  products: [
    {
      id: 'nacha-60g', title: 'Petit format', weight: '60 g', kicker: 'Le format découverte',
      description: 'Un format compact de la gamme NACHA.',
      facts: ['Format 60 grammes'], image: 'piment_bocal_5.jpg', imageAlt: 'Produit NACHA petit format 60 grammes',
      price: 15000, theme: 'product-tone--small'
    },
    {
      id: 'nacha-red-100g', title: 'Sachet rouge', weight: '100 g', kicker: 'La version piquante',
      description: 'La version piquante de la gamme, présentée dans son sachet rouge.',
      facts: ['Version piquante', 'Sachet rouge · 100 grammes'], image: 'piment_sachet_rouge.jpg', imageAlt: 'Sachet rouge NACHA 100 grammes',
      price: 12000, theme: 'product-tone--red'
    },
    {
      id: 'nacha-green-100g', title: 'Sachet vert', weight: '100 g', kicker: 'La spécialité Mukubi',
      description: 'La spécialité Mukubi de NACHA, dans son sachet vert.',
      facts: ['Spécialité Mukubi', 'Sachet vert · 100 grammes'], image: 'piment_vert.jpg', imageAlt: 'Sachet vert NACHA 100 grammes',
      price: 10000, theme: 'product-tone--green'
    },
    {
      id: 'nacha-portable-15g', title: 'Format portatif', weight: '15 g', kicker: 'Le format à emporter',
      description: 'Le petit format portatif de 15 grammes.',
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
