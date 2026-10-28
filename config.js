/*
  Configuration du site NACHA.
  Remplacer les chemins vides par les médias officiels validés.
  Les URLs sociales doivent pointer vers les comptes réellement contrôlés par la marque.
*/
window.NACHA_CONFIG = {
  heroSlides: [
    { label: 'Séquence 1', video: 'video_1.mp4', poster: '', theme: 'hero-scene--one' },
    { label: 'Séquence 2', video: 'video_3.mp4', poster: '', theme: 'hero-scene--two' },
    { label: 'Séquence 3', video: 'video_1.mp4', poster: '', theme: 'hero-scene--three' }
  ],
    footerSlides: [
    'platAvecNacha_1.jpg',
    'platAvecNacha_2.jpg',
    'platAvecNacha_3.jpg'
  ],
  products: [
    {
      title: 'Petit format', weight: '60 g', kicker: 'Le format découverte',
      description: "Un format compact de la gamme NACHA.",
      facts: ['Format 60 grammes'], image: 'piment_bocal_5.jpg', imageAlt: '', theme: 'product-tone--small'
    },
    {
      title: 'Sachet rouge', weight: '100 g', kicker: 'La version piquante',
      description: "La version piquante de la gamme, présentée dans son sachet rouge.",
      facts: ['Version piquante', 'Sachet rouge · 100 grammes'], image: 'piment_sachet_rouge.jpg', imageAlt: '', theme: 'product-tone--red'
    },
    {
      title: 'Sachet vert', weight: '100 g', kicker: 'La spécialité Mukubi',
      description: "La spécialité Mukubi de NACHA, dans son sachet vert.",
      facts: ['Spécialité Mukubi', 'Sachet vert · 100 grammes'], image: 'piment_vert.jpg', imageAlt: '', theme: 'product-tone--green'
    },
    {
      title: 'Format portatif', weight: '15 g', kicker: 'Le format à emporter',
      description: "Le petit format portatif de 15 grammes.",
      facts: ['Format portatif', '15 grammes'], image: 'piment_petit_format.jpg', imageAlt: '', theme: 'product-tone--portable'
    }
  ],
  socials: {
    tiktok: '',
    x: '',
    instagram: 'https://www.instagram.com/nacha_spices?obrf=Z3VzeDd0ODJhN2xj',
    facebook: ''
  }
};
