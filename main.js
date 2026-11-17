(() => {
  'use strict';
  const config = window.NACHA_CONFIG || { heroSlides: [], products: [], socials: {} };
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  // Navigation mobile : ouverte via un vrai bouton, fermable au clavier et au clic sur une destination.
  const menuToggle = $('#menuToggle');
  const mobileNav = $('#mobileNav');
  const closeMenu = () => {
    if (!menuToggle || !mobileNav) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Ouvrir le menu');
    mobileNav.classList.remove('is-open');
    mobileNav.setAttribute('inert', '');
    document.body.classList.remove('menu-open');
  };
  const openMenu = () => {
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Fermer le menu');
    mobileNav.classList.add('is-open');
    mobileNav.removeAttribute('inert');
    document.body.classList.add('menu-open');
    const firstLink = $('a', mobileNav);
    if (firstLink) firstLink.focus({ preventScroll: true });
  };
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => menuToggle.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu());
    $$('a', mobileNav).forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
        closeMenu(); menuToggle.focus();
      }
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 820) closeMenu(); }, { passive: true });
  }
  // Reveal : relecture à chaque nouvelle entrée dans le viewport, avec un état immédiatement lisible sans JS.
  const revealItems = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !prefersReducedMotion.matches) {
    document.documentElement.classList.add('js-reveals-ready');
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
        } else {
          // Réinitialisation douce : l'élément se révèle à nouveau lors d'une navigation ultérieure.
          entry.target.classList.remove('is-revealed');
        }
      });
    }, { threshold: 0.13, rootMargin: '0px 0px -4% 0px' });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('is-revealed'));
  }

  
  // =====================================================
  // NACHA — HERO CAROUSEL
  // GESTION DES IMAGES, VIDÉOS ET SWIPE MANUEL
  // =====================================================

  const hero = $('.hero');
  const heroVideo = $('#heroVideo');
  const heroImage = $('#heroImage');
  const heroPagination = $('#heroPagination');
  const heroDots = [];
  const heroCurrent = $('#heroCurrent');

  // Désactiver définitivement la boucle des vidéos.
  if (heroVideo) {
    heroVideo.loop = false;
    heroVideo.removeAttribute('loop');
  }

  let activeSlide = 0;
  let heroAutoplayTimer = null;
  let heroSlideRevision = 0;

  const HERO_IMAGE_AUTOPLAY_DELAY = 8000;

  const slides = (config.heroSlides || []).filter(
    slide => slide && (slide.video || slide.image)
  );


  // =====================================================
  // 1. PAGINATION
  // =====================================================

  if (heroPagination) {
    heroPagination.replaceChildren();

    slides.forEach((slide, index) => {
      const dot = document.createElement('button');

      dot.type = 'button';
      dot.className = `hero-dot${index === 0 ? ' is-active' : ''}`;
      dot.setAttribute('aria-label', slide.label || `Séquence ${index + 1}`);
      dot.setAttribute('aria-pressed', String(index === 0));

      dot.disabled = true;
      dot.tabIndex = -1;

      const indicator = document.createElement('span');
      indicator.setAttribute('aria-hidden', 'true');

      dot.appendChild(indicator);
      heroPagination.appendChild(dot);

      heroDots.push(dot);
    });
  }


  // =====================================================
  // 2. CHRONOMÉTRAGE DES IMAGES
  // =====================================================

  const stopHeroAutoplay = () => {

    if (heroAutoplayTimer !== null) {
      window.clearTimeout(heroAutoplayTimer);
      heroAutoplayTimer = null;
    }

  };


  const startHeroAutoplay = () => {

    stopHeroAutoplay();

    if (
      slides.length < 2 ||
      prefersReducedMotion.matches ||
      document.hidden
    ) {
      return;
    }

    const slide = slides[activeSlide];

    // Les vidéos ne possèdent aucun chronomètre fixe.
    if (!slide || slide.video) return;

    // Vérifier que l'image active est réellement chargée.
    if (
      !heroImage ||
      !slide.image ||
      heroImage.getAttribute('data-current-source') !== slide.image ||
      !heroImage.complete ||
      heroImage.naturalWidth === 0 ||
      !heroImage.classList.contains('is-visible')
    ) {
      return;
    }

    const scheduledSlide = activeSlide;
    const scheduledRevision = heroSlideRevision;
    const scheduledSource = slide.image;

    heroAutoplayTimer = window.setTimeout(() => {

      heroAutoplayTimer = null;

      // Protection contre les anciennes transitions.
      if (
        document.hidden ||
        activeSlide !== scheduledSlide ||
        heroSlideRevision !== scheduledRevision ||
        slides[activeSlide]?.image !== scheduledSource
      ) {
        return;
      }

      applySlide(scheduledSlide + 1);

    }, HERO_IMAGE_AUTOPLAY_DELAY);

  };


  // =====================================================
  // 3. FONCTION CENTRALE DE CHANGEMENT DE SÉQUENCE
  // =====================================================

  const applySlide = index => {

    if (!slides.length || !hero) return;

    stopHeroAutoplay();

    const revision = ++heroSlideRevision;

    activeSlide = (index + slides.length) % slides.length;

    const slide = slides[activeSlide];

    hero.classList.remove(
      'hero-scene--one',
      'hero-scene--two',
      'hero-scene--three'
    );

    hero.classList.add(
      slide.theme ||
      `hero-scene--${['one', 'two', 'three'][activeSlide % 3]}`
    );


    // Synchronisation de la pagination.
    heroDots.forEach((dot, dotIndex) => {

      const selected = dotIndex === activeSlide;

      dot.classList.toggle('is-active', selected);
      dot.setAttribute('aria-pressed', String(selected));

    });

    if (heroCurrent) {
      heroCurrent.textContent = String(activeSlide + 1).padStart(2, '0');
    }


    const nextVideo = slide.video || '';
    const nextImage = nextVideo ? '' : (slide.image || '');


    // =================================================
    // 3A. GESTION DES VIDÉOS
    // =================================================

    if (heroVideo) {

      const currentVideo =
        heroVideo.getAttribute('data-current-source') || '';

      if (nextVideo !== currentVideo) {

        heroVideo.pause();
        heroVideo.classList.remove('is-visible');

        heroVideo.removeAttribute('src');
        heroVideo.removeAttribute('data-current-source');
        heroVideo.removeAttribute('poster');

        if (nextVideo) {

          heroVideo.loop = false;
          heroVideo.removeAttribute('loop');

          if (slide.poster) {
            heroVideo.setAttribute('poster', slide.poster);
          }

          heroVideo.setAttribute('data-current-source', nextVideo);
          heroVideo.src = nextVideo;

          heroVideo.load();

          if (!prefersReducedMotion.matches && !document.hidden) {

            heroVideo.play().catch(error => {
              console.warn('Lecture automatique de la vidéo impossible :', error);
            });

          }

        } else {

          heroVideo.load();

        }

      } else if (
        nextVideo &&
        !prefersReducedMotion.matches &&
        !document.hidden &&
        heroVideo.paused &&
        !heroVideo.ended
      ) {

        heroVideo.play().catch(error => {
          console.warn('Lecture automatique de la vidéo impossible :', error);
        });

      }

    }


    // =================================================
    // 3B. GESTION DES IMAGES
    // =================================================

    if (heroImage) {

      const currentImage =
        heroImage.getAttribute('data-current-source') || '';

      if (nextImage !== currentImage) {

        heroImage.classList.remove('is-visible');

        heroImage.onload = null;
        heroImage.onerror = null;

        heroImage.removeAttribute('src');
        heroImage.removeAttribute('data-current-source');


        if (nextImage) {

          // Chargement de la nouvelle image.
          heroImage.onload = () => {

            if (
              revision !== heroSlideRevision ||
              heroImage.getAttribute('data-current-source') !== nextImage ||
              slides[activeSlide]?.image !== nextImage
            ) {
              return;
            }

            heroImage.classList.add('is-visible');

            // Démarrer les 8 secondes après le chargement.
            startHeroAutoplay();

          };


          // Gestion des erreurs de chargement.
          heroImage.onerror = () => {

            if (
              revision !== heroSlideRevision ||
              heroImage.getAttribute('data-current-source') !== nextImage
            ) {
              return;
            }

            heroImage.classList.remove('is-visible');

            heroImage.removeAttribute('src');
            heroImage.removeAttribute('data-current-source');

            console.error(
              `Impossible de charger l'image du Hero : ${nextImage}`
            );

          };


          heroImage.setAttribute('data-current-source', nextImage);
          heroImage.src = nextImage;


          // Image déjà présente dans le cache.
          if (heroImage.complete && heroImage.naturalWidth > 0) {

            heroImage.classList.add('is-visible');
            startHeroAutoplay();

          }

        }

      } else if (
        nextImage &&
        heroImage.complete &&
        heroImage.naturalWidth > 0
      ) {

        heroImage.classList.add('is-visible');
        startHeroAutoplay();

      }

    }

  };


  // =====================================================
  // 4. ÉVÉNEMENTS VIDÉO
  // =====================================================

  if (heroVideo) {

    // La vidéo devient visible dès qu'elle est prête.
    heroVideo.addEventListener('canplay', () => {

      const currentSlide = slides[activeSlide];

      if (
        currentSlide?.video &&
        currentSlide.video === heroVideo.getAttribute('data-current-source')
      ) {

        heroVideo.classList.add('is-visible');

      }

    });


    // Passage à la séquence suivante à la fin réelle.
    heroVideo.addEventListener('ended', () => {

      const currentSlide = slides[activeSlide];

      const currentSource =
        heroVideo.getAttribute('data-current-source');

      if (
        !currentSlide?.video ||
        currentSlide.video !== currentSource ||
        !heroVideo.ended
      ) {
        return;
      }

      applySlide(activeSlide + 1);

    });


    // Erreur de lecture.
    heroVideo.addEventListener('error', () => {

      const currentSlide = slides[activeSlide];

      const currentSource =
        heroVideo.getAttribute('data-current-source');

      if (
        !currentSource ||
        currentSlide?.video !== currentSource
      ) {
        return;
      }

      heroVideo.classList.remove('is-visible');

      console.error(
        `Impossible de charger la vidéo du Hero : ${currentSource}`
      );

    });

  }


  // =====================================================
  // 5. NAVIGATION MANUELLE — SWIPE / DRAG
  // =====================================================

  if (hero && slides.length > 1) {

    const HERO_SWIPE_THRESHOLD = 58;
    const HERO_SWIPE_MIN_DISTANCE = 32;
    const HERO_SWIPE_MIN_VELOCITY = 0.45;

    let heroSwipe = null;


    // Début du geste.
    hero.addEventListener('pointerdown', event => {

      if (!event.isPrimary) return;

      if (event.pointerType === 'mouse' && event.button !== 0) {
        return;
      }

      if (heroSwipe !== null) return;

      const target = event.target;

      if (
        target instanceof Element &&
        target.closest(
          'a, button, input, textarea, select, ' +
          '[contenteditable="true"], ' +
          '.site-header, .mobile-nav, .hero-pagination'
        )
      ) {
        return;
      }

      heroSwipe = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startTime: 0,
        dragging: false
      };

      try {
        hero.setPointerCapture(event.pointerId);
      } catch (_) {}

    });


    // Détection du mouvement.
    hero.addEventListener('pointermove', event => {

      if (!heroSwipe) return;

      if (event.pointerId !== heroSwipe.pointerId) return;

      const deltaX = event.clientX - heroSwipe.startX;
      const deltaY = event.clientY - heroSwipe.startY;

      const distanceX = Math.abs(deltaX);
      const distanceY = Math.abs(deltaY);

      if (!heroSwipe.dragging) {

        if (distanceX < 10 && distanceY < 10) return;

        // Ne pas perturber le défilement vertical.
        if (distanceY > distanceX) {
          heroSwipe = null;
          return;
        }

        heroSwipe.dragging = true;
        heroSwipe.startTime = performance.now();

        stopHeroAutoplay();

        hero.classList.add('is-swipe-active');

      }

    });


    // Finalisation du geste.
    const finishHeroSwipe = (event, cancelled = false) => {

      if (!heroSwipe) return;

      if (event.pointerId !== heroSwipe.pointerId) return;

      const gesture = heroSwipe;

      heroSwipe = null;

      if (!gesture.dragging) return;

      const deltaX = event.clientX - gesture.startX;

      const distance = Math.abs(deltaX);

      const duration = Math.max(
        1,
        performance.now() - gesture.startTime
      );

      const velocity = distance / duration;

      const validSwipe =
        distance >= HERO_SWIPE_THRESHOLD ||
        (
          distance >= HERO_SWIPE_MIN_DISTANCE &&
          velocity >= HERO_SWIPE_MIN_VELOCITY
        );

      hero.classList.remove('is-swipe-active');

      if (!cancelled && validSwipe) {

        // Gauche : suivant. Droite : précédent.
        applySlide(activeSlide + (deltaX < 0 ? 1 : -1));

      } else {

        // Si le média n'a pas changé, reprendre son fonctionnement.
        startHeroAutoplay();

      }

    };


    hero.addEventListener('pointerup', event => {
      finishHeroSwipe(event);
    });

    hero.addEventListener('pointercancel', event => {
      finishHeroSwipe(event, true);
    });

    hero.addEventListener('lostpointercapture', event => {
      finishHeroSwipe(event, true);
    });

  }


  // =====================================================
  // 6. INITIALISATION DU CARROUSEL
  // =====================================================

  // Le premier média gère lui-même le démarrage de son cycle.
  applySlide(0);


  // =====================================================
  // 7. GESTION DES PRÉFÉRENCES DE MOUVEMENT
  // =====================================================

  prefersReducedMotion.addEventListener?.('change', event => {

    const currentSlide = slides[activeSlide];

    if (event.matches) {

      if (heroVideo) heroVideo.pause();

      stopHeroAutoplay();

      return;

    }

    if (currentSlide?.video) {

      if (
        heroVideo &&
        heroVideo.getAttribute('data-current-source') === currentSlide.video &&
        heroVideo.paused &&
        !heroVideo.ended &&
        !document.hidden
      ) {

        heroVideo.play().catch(error => {
          console.warn('Lecture vidéo impossible :', error);
        });

      }

    } else {

      startHeroAutoplay();

    }

  });


  // =====================================================
  // 8. GESTION DE LA VISIBILITÉ DE LA PAGE
  // =====================================================

  document.addEventListener('visibilitychange', () => {

    const currentSlide = slides[activeSlide];

    if (document.hidden) {

      stopHeroAutoplay();

      if (
        currentSlide?.video &&
        heroVideo &&
        !heroVideo.paused
      ) {
        heroVideo.pause();
      }

      return;

    }

    if (currentSlide?.video) {

      if (
        heroVideo &&
        heroVideo.getAttribute('data-current-source') === currentSlide.video &&
        heroVideo.paused &&
        !heroVideo.ended &&
        !prefersReducedMotion.matches
      ) {

        heroVideo.play().catch(error => {
          console.warn('Reprise automatique de la vidéo impossible :', error);
        });

      }

    } else {

      startHeroAutoplay();

    }

  });


// =====================================================
// NACHA — GAMME E-COMMERCE
// Grille produits + galeries + fiche immersive
// =====================================================

const nachaProducts = Array.isArray(config.products)
  ? config.products
  : [];

const productGrid = $('#productGrid');

const productDetailModal = $('#productDetailModal');
const productDetailClose = $('#productDetailClose');

const productDetailGallery = $('#productDetailGallery');
const productDetailKicker = $('#productDetailKicker');
const productDetailTitle = $('#productDetailTitle');
const productDetailDescription = $('#productDetailDescription');
const productDetailPrices = $('#productDetailPrices');
const productDetailFormat = $('#productDetailFormat');
const productDetailUsage = $('#productDetailUsage');
const productDetailComposition = $('#productDetailComposition');
const productDetailFacts = $('#productDetailFacts');

const productDetailAddToCart = $('#productDetailAddToCart');

let productDetailReturnFocus = null;
let productDetailRestoreFocus = true;


// =====================================================
// 1. FORMATAGE DES PRIX
// =====================================================

const formatPrice = price => {

  if (
    price === null ||
    price === undefined ||
    price === '' ||
    !Number.isFinite(Number(price)) ||
    Number(price) <= 0
  ) {

    return 'Prix à renseigner';

  }

  return `${new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0
  }).format(Number(price))} ${config.currency || 'FC'}`;

};


const hasValidPrice = product =>
  typeof product?.price === 'number' &&
  Number.isFinite(product.price) &&
  product.price > 0;


// =====================================================
// 2. RÉCUPÉRATION DES IMAGES
// =====================================================

const getProductImages = product => {

  const images = [];

  const registeredSources = new Set();


  const addImage = (entry, fallbackAlt) => {

    const source = typeof entry === 'string'
      ? entry
      : entry?.src;


    if (
      typeof source !== 'string' ||
      !source.trim() ||
      registeredSources.has(source.trim())
    ) {

      return;

    }


    const normalizedSource = source.trim();

    const alt =
      typeof entry === 'object' && entry?.alt
        ? String(entry.alt)
        : fallbackAlt;


    images.push({
      src: normalizedSource,
      alt
    });

    registeredSources.add(normalizedSource);

  };


  // Photographie principale.
  if (product.image) {

    addImage(
      {
        src: product.image,
        alt: product.imageAlt
      },
      product.title || 'Produit NACHA'
    );

  }


  // Photographies supplémentaires.
  if (Array.isArray(product.images)) {

    product.images.forEach((photo, index) => {

      addImage(
        photo,
        `${product.title || 'Produit NACHA'} — vue ${index + 2}`
      );

    });

  }


  return images;

};


// =====================================================
// 3. AFFICHAGE DU PRIX COMMERCIAL
// =====================================================

const renderProductPrices = (container, product) => {

  if (!container) return;

  container.replaceChildren();


  const oldPrice = Number(product.oldPrice);

  const currentPrice = Number(product.price);


  // Ancien prix uniquement si une réduction réelle existe.
  const hasPromotion =
    Number.isFinite(oldPrice) &&
    Number.isFinite(currentPrice) &&
    oldPrice > currentPrice;


  if (hasPromotion) {

    const promotion = document.createElement('span');

    promotion.className = 'nacha-product-promo';

    promotion.textContent = 'OFFRE NACHA';

    container.appendChild(promotion);


    const oldPriceElement = document.createElement('del');

    oldPriceElement.className = 'nacha-product-old-price';

    oldPriceElement.textContent = formatPrice(oldPrice);

    container.appendChild(oldPriceElement);

  }


  const currentPriceElement = document.createElement('strong');

  currentPriceElement.className = 'nacha-product-current-price';

  currentPriceElement.textContent = formatPrice(product.price);

  container.appendChild(currentPriceElement);

};


// =====================================================
// 4. GALERIE ET PAGINATION DES PHOTOGRAPHIES
// =====================================================

const createProductGallery = (
  product,
  options = {}
) => {

  const {
    variant = 'card',
    onOpen = null
  } = options;


  const gallery = document.createElement('div');

  gallery.className =
    `nacha-product-gallery nacha-product-gallery--${variant}`;


  const images = getProductImages(product);


  // Aucun visuel disponible.
  if (!images.length) {

    const placeholder = document.createElement('div');

    placeholder.className = 'nacha-product-gallery-placeholder';

    placeholder.textContent = 'Visuel NACHA à intégrer';

    gallery.appendChild(placeholder);

    return gallery;

  }


  let activeImage = 0;


  // Image principale cliquable.
  const mainButton = document.createElement('button');

  mainButton.type = 'button';

  mainButton.className = 'nacha-product-gallery-main';


  const mainImage = document.createElement('img');

  mainImage.className = 'nacha-product-gallery-image';

  mainImage.src = images[0].src;

  mainImage.alt = images[0].alt;

  mainImage.loading = variant === 'card' ? 'lazy' : 'eager';

  mainImage.draggable = false;


  mainButton.appendChild(mainImage);


  if (typeof onOpen === 'function') {

    mainButton.addEventListener('click', () => {

      onOpen(mainButton);

    });

    mainButton.setAttribute(
      'aria-label',
      `Voir les détails de ${product.title}`
    );

  } else {

    mainButton.setAttribute(
      'aria-label',
      `Photographie de ${product.title}`
    );

  }


  gallery.appendChild(mainButton);


  // Les contrôles ne sont créés qu'en présence de plusieurs images.
  if (images.length > 1) {

    const controls = document.createElement('div');

    controls.className = 'nacha-product-gallery-controls';


    const previous = document.createElement('button');

    previous.type = 'button';

    previous.className =
      'nacha-product-gallery-arrow nacha-product-gallery-arrow--previous';

    previous.textContent = '←';

    previous.setAttribute(
      'aria-label',
      'Photographie précédente'
    );


    const pagination = document.createElement('div');

    pagination.className = 'nacha-product-gallery-pagination';

    pagination.setAttribute(
      'role',
      'group'
    );

    pagination.setAttribute(
      'aria-label',
      `Photographies de ${product.title}`
    );


    const counter = document.createElement('span');

    counter.className = 'nacha-product-gallery-counter';


    const next = document.createElement('button');

    next.type = 'button';

    next.className =
      'nacha-product-gallery-arrow nacha-product-gallery-arrow--next';

    next.textContent = '→';

    next.setAttribute(
      'aria-label',
      'Photographie suivante'
    );


    const dots = [];


    // Mise à jour de la photographie active.
    const showImage = index => {

      activeImage =
        (index + images.length) % images.length;


      const photo = images[activeImage];

      mainImage.src = photo.src;

      mainImage.alt = photo.alt;


      counter.textContent =
        `${String(activeImage + 1).padStart(2, '0')} / ${String(images.length).padStart(2, '0')}`;


      dots.forEach((dot, dotIndex) => {

        const selected = dotIndex === activeImage;

        dot.classList.toggle('is-active', selected);

        dot.setAttribute(
          'aria-pressed',
          String(selected)
        );

      });

    };


    // Création des boutons de pagination.
    images.forEach((photo, index) => {

      const dot = document.createElement('button');

      dot.type = 'button';

      dot.className = 'nacha-product-gallery-dot';

      dot.setAttribute(
        'aria-label',
        `Afficher la photographie ${index + 1}`
      );

      dot.setAttribute(
        'aria-pressed',
        String(index === 0)
      );


      dot.addEventListener('click', () => {

        showImage(index);

      });


      pagination.appendChild(dot);

      dots.push(dot);

    });


    previous.addEventListener('click', () => {

      showImage(activeImage - 1);

    });


    next.addEventListener('click', () => {

      showImage(activeImage + 1);

    });


    controls.append(
      previous,
      pagination,
      counter,
      next
    );


    gallery.appendChild(controls);


    // Initialiser le compteur.
    showImage(0);

  }


  return gallery;

};


// =====================================================
// 5. OUVERTURE DE LA FICHE IMMERSIVE
// =====================================================

const openProductDetails = (
  product,
  index,
  trigger
) => {

  if (!productDetailModal) return;


  productDetailReturnFocus = trigger;

  productDetailRestoreFocus = true;


  // Informations principales.
  productDetailKicker.textContent =
    product.kicker || 'GAMME NACHA';


  productDetailTitle.textContent =
    product.title || 'Produit NACHA';


  productDetailDescription.textContent =
    product.description || 'Description à renseigner.';


  // Prix.
  renderProductPrices(
    productDetailPrices,
    product
  );


  // Format.
  productDetailFormat.textContent =
    product.weight || 'Format à renseigner.';


  // Conseils d'utilisation.
  productDetailUsage.textContent =
    product.usage?.trim() ||
    'Informations à compléter par NACHA.';


  // Composition.
  productDetailComposition.textContent =
    product.composition?.trim() ||
    'Informations à compléter par NACHA.';


  // Caractéristiques complémentaires.
  productDetailFacts.replaceChildren();


  if (Array.isArray(product.facts)) {

    product.facts.forEach(fact => {

      const item = document.createElement('span');

      item.textContent = fact;

      productDetailFacts.appendChild(item);

    });

  }


  // Galerie détaillée avec sa propre pagination.
  productDetailGallery.replaceChildren();

  productDetailGallery.appendChild(
    createProductGallery(product, {
      variant: 'detail'
    })
  );


  // Préparer le bouton d'ajout au panier.
  productDetailAddToCart.dataset.productIndex =
    String(index);

  productDetailAddToCart.dataset.productId =
    String(product.id || index);


  // Ouvrir la fenêtre.
  if (!productDetailModal.open) {

    productDetailModal.showModal();

  }

};


// =====================================================
// 6. FERMETURE DE LA FICHE IMMERSIVE
// =====================================================

const closeProductDetails = (restoreFocus = true) => {

  if (!productDetailModal?.open) return;

  productDetailRestoreFocus = restoreFocus;

  productDetailModal.close();

};


productDetailClose?.addEventListener('click', () => {

  closeProductDetails();

});


// Fermeture avec Échap.
productDetailModal?.addEventListener('cancel', event => {

  event.preventDefault();

  closeProductDetails();

});


// Clic sur le fond de la fenêtre.
productDetailModal?.addEventListener('click', event => {

  if (event.target === productDetailModal) {

    closeProductDetails();

  }

});


// Restaurer le focus après fermeture.
productDetailModal?.addEventListener('close', () => {

  if (
    productDetailRestoreFocus &&
    productDetailReturnFocus?.isConnected
  ) {

    requestAnimationFrame(() => {

      productDetailReturnFocus.focus({
        preventScroll: true
      });

    });

  }

  productDetailReturnFocus = null;

  productDetailRestoreFocus = true;

});


// =====================================================
// 7. CONSTRUCTION DES CARTES PRODUITS
// =====================================================

const createProductCard = (product, index) => {

  const card = document.createElement('article');

  card.className = 'nacha-product-card';


  // Galerie.
  const media = document.createElement('div');

  media.className = 'nacha-product-card-media';


  const indexLabel = document.createElement('span');

  indexLabel.className = 'nacha-product-card-index';

  //indexLabel.textContent =
    //`NACHA / ${String(index + 1).padStart(2, '0')}`;


  const formatLabel = document.createElement('span');

  formatLabel.className = 'nacha-product-card-format';

  formatLabel.textContent = product.weight || 'Format NACHA';


  const gallery = createProductGallery(product, {

    variant: 'card',

    onOpen: trigger => {

      openProductDetails(
        product,
        index,
        trigger
      );

    }

  });


  media.append(
    indexLabel,
    formatLabel,
    gallery
  );


  // Partie commerciale.
  const body = document.createElement('div');

  body.className = 'nacha-product-card-body';


  const kicker = document.createElement('span');

  kicker.className = 'nacha-product-card-kicker';

  kicker.textContent =
    product.kicker || 'GAMME NACHA';


  const title = document.createElement('h3');

  title.className = 'nacha-product-card-title';

  title.textContent = product.title || 'Produit NACHA';


  const description = document.createElement('p');

  description.className = 'nacha-product-card-description';

  description.textContent =
    product.description || 'Description à renseigner.';


  // Prix commercial.
  const prices = document.createElement('div');

  prices.className = 'nacha-product-prices';

  renderProductPrices(prices, product);


  // Caractéristiques.
  const facts = document.createElement('div');

  facts.className = 'nacha-product-card-facts';


  if (Array.isArray(product.facts)) {

    product.facts.forEach(fact => {

      const item = document.createElement('span');

      item.textContent = fact;

      facts.appendChild(item);

    });

  }


  // Bouton d'achat.
  const addButton = document.createElement('button');

  addButton.type = 'button';

  addButton.className = 'nacha-product-add-button';

  addButton.dataset.addToCart = 'true';

  addButton.dataset.productId =
    String(product.id || index);


  const buttonLabel = document.createElement('span');

  buttonLabel.textContent = 'Ajouter au panier';
  buttonLabel.style.fontSize = "13px";
  buttonLabel.style.marginLeft = "70px";


  const buttonArrow = document.createElement('span');

  buttonArrow.setAttribute('aria-hidden', 'true');

  //buttonArrow.textContent = '↗';


  addButton.append(
    buttonLabel,
    buttonArrow
  );


  body.append(
    kicker,
    title,
    description,
    prices,
    facts,
    addButton
  );


  card.append(
    media,
    body
  );


  return card;

};


// =====================================================
// 8. AFFICHAGE DE TOUS LES PRODUITS
// =====================================================

const renderProductGrid = () => {

  if (!productGrid) return;

  productGrid.replaceChildren();


  if (!nachaProducts.length) {

    const message = document.createElement('p');

    message.textContent =
      'Les produits NACHA seront bientôt disponibles.';

    productGrid.appendChild(message);

    return;

  }


  nachaProducts.forEach((product, index) => {

    productGrid.appendChild(
      createProductCard(product, index)
    );

  });

};


// Affichage immédiat des quatre produits.
renderProductGrid();


  // E-commerce NACHA : panier persistant, quantités, suppression et commande WhatsApp.
  const cartStorageKey = 'nacha-cart-v1';
  const cartTrigger = $('#cartTrigger');
  const cartCount = $('#cartCount');
  const cartDrawer = $('#cartDrawer');
  const cartBackdrop = $('#cartBackdrop');
  const cartClose = $('#cartClose');
  const cartItemsContainer = $('#cartItems');
  const cartEmpty = $('#cartEmpty');
  const cartSubtotal = $('#cartSubtotal');
  const cartStatus = $('#cartStatus');
  const cartClear = $('#cartClear');
  const checkoutWhatsapp = $('#checkoutWhatsapp');
  let cartReturnFocus = null;

  const getProductId = (product, index) => String(product.id || index);
  const findProduct = id => (config.products || []).find((product, index) => getProductId(product, index) === String(id));

  const loadCart = () => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(cartStorageKey) || '[]');
      if (!Array.isArray(stored)) return [];
      return stored.map(entry => ({
        id: String(entry.id),
        quantity: Math.max(1, Math.floor(Number(entry.quantity) || 1))
      })).filter(entry => findProduct(entry.id));
    } catch (_) {
      return [];
    }
  };

  let cart = loadCart();

  const saveCart = () => {
    try {
      window.localStorage.setItem(cartStorageKey, JSON.stringify(cart));
    } catch (_) {
      // Le panier reste fonctionnel en mémoire si le navigateur bloque le stockage local.
    }
  };

  const getCartQuantity = () => cart.reduce((sum, entry) => sum + entry.quantity, 0);
  const getCartSubtotal = () => cart.reduce((sum, entry) => {
    const product = findProduct(entry.id);
    return product && hasValidPrice(product) ? sum + product.price * entry.quantity : sum;
  }, 0);
  const cartHasMissingPrices = () => cart.some(entry => {
    const product = findProduct(entry.id);
    return !product || !hasValidPrice(product);
  });

  const setCartStatus = (message, isError = false) => {
    if (!cartStatus) return;
    cartStatus.textContent = message;
    cartStatus.classList.toggle('is-error', isError);
  };

  const makeCartButton = (label, text, action, extraClass = '') => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = extraClass;
    button.dataset.cartAction = action;
    button.setAttribute('aria-label', label);
    button.textContent = text;
    return button;
  };

  const renderCart = () => {
    if (!cartItemsContainer) return;
    cartItemsContainer.replaceChildren();
    const count = getCartQuantity();

    if (cartCount) cartCount.textContent = String(count);
    if (cartTrigger) {
      cartTrigger.setAttribute('aria-label', `Ouvrir le panier, ${count} article${count > 1 ? 's' : ''}`);
    }
    if (cartEmpty) cartEmpty.hidden = cart.length > 0;
    if (cartClear) cartClear.disabled = cart.length === 0;
    if (checkoutWhatsapp) checkoutWhatsapp.disabled = cart.length === 0;

    cart.forEach(entry => {
      const product = findProduct(entry.id);
      if (!product) return;

      const item = document.createElement('article');
      item.className = 'cart-item';
      item.dataset.cartProduct = entry.id;

      if (product.image) {
        const image = document.createElement('img');
        image.className = 'cart-item-image';
        image.src = product.image;
        image.alt = product.imageAlt || '';
        image.loading = 'lazy';
        image.addEventListener('error', () => {
          const placeholder = document.createElement('div');
          placeholder.className = 'cart-item-placeholder';
          placeholder.textContent = 'N.';
          image.replaceWith(placeholder);
        }, { once: true });
        item.appendChild(image);
      } else {
        const placeholder = document.createElement('div');
        placeholder.className = 'cart-item-placeholder';
        placeholder.textContent = 'N.';
        item.appendChild(placeholder);
      }

      const main = document.createElement('div');
      main.className = 'cart-item-main';
      const title = document.createElement('h3');
      title.className = 'cart-item-title';
      title.textContent = product.title || 'Produit NACHA';
      const weight = document.createElement('p');
      weight.className = 'cart-item-weight';
      weight.textContent = product.weight || '';
      const price = document.createElement('p');
      price.className = 'cart-item-price';
      price.textContent = hasValidPrice(product)
        ? `${formatPrice(product.price)} · Total : ${formatPrice(product.price * entry.quantity)}`
        : 'Prix à renseigner';

      const controls = document.createElement('div');
      controls.className = 'cart-item-controls';
      const quantity = document.createElement('div');
      quantity.className = 'cart-quantity';
      quantity.appendChild(makeCartButton('Diminuer la quantité', '−', 'decrease'));
      const quantityValue = document.createElement('span');
      quantityValue.textContent = String(entry.quantity);
      quantity.appendChild(quantityValue);
      quantity.appendChild(makeCartButton('Augmenter la quantité', '+', 'increase'));
      const remove = makeCartButton(`Supprimer ${product.title || 'ce produit'} du panier`, 'Supprimer', 'remove', 'cart-item-remove');
      controls.append(quantity, remove);
      main.append(title, weight, price, controls);
      item.appendChild(main);
      cartItemsContainer.appendChild(item);
    });

    if (cart.length === 0) {
      if (cartSubtotal) cartSubtotal.textContent = '—';
    } else if (cartHasMissingPrices()) {
      if (cartSubtotal) cartSubtotal.textContent = 'À confirmer';
    } else if (cartSubtotal) {
      cartSubtotal.textContent = formatPrice(getCartSubtotal());
    }
  };

  const openCart = (returnFocus = document.activeElement) => {
    if (!cartDrawer || !cartBackdrop) return;
    cartReturnFocus = returnFocus;
    cartBackdrop.hidden = false;
    requestAnimationFrame(() => cartBackdrop.classList.add('is-visible'));
    cartDrawer.classList.add('is-open');
    cartDrawer.removeAttribute('inert');
    cartDrawer.setAttribute('aria-hidden', 'false');
    if (cartTrigger) cartTrigger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('cart-open');
    if (cartClose) cartClose.focus({ preventScroll: true });
  };

  const closeCart = () => {
    if (!cartDrawer || !cartBackdrop) return;
    cartDrawer.classList.remove('is-open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    cartDrawer.setAttribute('inert', '');
    cartBackdrop.classList.remove('is-visible');
    window.setTimeout(() => {
      if (!cartDrawer.classList.contains('is-open')) cartBackdrop.hidden = true;
    }, 320);
    if (cartTrigger) cartTrigger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('cart-open');
    if (cartReturnFocus && typeof cartReturnFocus.focus === 'function') {
      cartReturnFocus.focus({ preventScroll: true });
    }
  };


const addProductToCart = (
  product,
  index,
  returnFocus = cartTrigger
) => {

  if (!product) return;

  const id = getProductId(product, index);

  const existing = cart.find(entry => entry.id === id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, quantity: 1 });
  }

  saveCart();

  renderCart();

  setCartStatus(
    `${product.title || 'Produit NACHA'} ajouté au panier.`
  );

  openCart(returnFocus || cartTrigger);

};



// -----------------------------------------------------
// AJOUT AU PANIER DEPUIS LES CARTES PRODUITS
// -----------------------------------------------------

productGrid?.addEventListener('click', event => {

  const button = event.target.closest('[data-add-to-cart]');

  if (!button) return;

  const productIndex = nachaProducts.findIndex(
    (product, index) =>
      String(product.id || index) === button.dataset.productId
  );

  if (productIndex < 0) return;

  addProductToCart(
    nachaProducts[productIndex],
    productIndex,
    button
  );

});


// -----------------------------------------------------
// AJOUT AU PANIER DEPUIS LA FICHE IMMERSIVE
// -----------------------------------------------------

productDetailAddToCart?.addEventListener('click', () => {

  const productIndex = Number(
    productDetailAddToCart.dataset.productIndex
  );

  const product = nachaProducts[productIndex];

  if (!product) return;

  // Fermer la fiche avant d'ouvrir le panier.
  closeProductDetails(false);

  addProductToCart(
    product,
    productIndex,
    cartTrigger
  );

});


  cartTrigger?.addEventListener('click', () => {
    if (cartDrawer?.classList.contains('is-open')) closeCart();
    else openCart(cartTrigger);
  });
  cartClose?.addEventListener('click', closeCart);
  cartBackdrop?.addEventListener('click', closeCart);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && cartDrawer?.classList.contains('is-open')) closeCart();
  });

  cartItemsContainer?.addEventListener('click', event => {
    const button = event.target.closest('button[data-cart-action]');
    if (!button) return;
    const row = button.closest('[data-cart-product]');
    if (!row) return;
    const entry = cart.find(item => item.id === row.dataset.cartProduct);
    if (!entry) return;

    if (button.dataset.cartAction === 'increase') entry.quantity += 1;
    if (button.dataset.cartAction === 'decrease') {
      if (entry.quantity <= 1) cart = cart.filter(item => item.id !== entry.id);
      else entry.quantity -= 1;
    }
    if (button.dataset.cartAction === 'remove') cart = cart.filter(item => item.id !== entry.id);

    saveCart();
    renderCart();
    setCartStatus('Panier mis à jour.');
  });

  cartClear?.addEventListener('click', () => {
    cart = [];
    saveCart();
    renderCart();
    setCartStatus('Le panier a été vidé.');
  });

  const transferOrderToWhatsApp = () => {
    if (!cart.length) {
      setCartStatus('Votre panier est vide.', true);
      return;
    }
    if (cartHasMissingPrices()) {
      setCartStatus('Configurez le prix de chaque produit dans config.js avant de confirmer la commande.', true);
      return;
    }

    const whatsappNumber = String(config.whatsappBusinessNumber || '').replace(/\D/g, '');
    if (!/^\d{8,15}$/.test(whatsappNumber)) {
      setCartStatus('Le numéro WhatsApp Business doit être renseigné dans config.js au format international, chiffres uniquement.', true);
      return;
    }

    const lines = cart.map(entry => {
      const product = findProduct(entry.id);
      return `• ${product.title || 'Produit NACHA'}${product.weight ? ` (${product.weight})` : ''} × ${entry.quantity} — ${formatPrice(product.price * entry.quantity)}`;
    });
    const message = [
      'Bonjour NACHA, je souhaite confirmer la commande suivante :',
      '',
      ...lines,
      '',
      `Sous-total : ${formatPrice(getCartSubtotal())}`,
      '',
      'Merci de confirmer la disponibilité et les modalités de livraison.'
    ].join('\n');
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    setCartStatus('WhatsApp va s’ouvrir avec le récapitulatif. Envoyez le message pour transmettre la commande.');
    const newWindow = window.open(whatsappUrl, '_blank');
    if (newWindow) newWindow.opener = null;
    else window.location.href = whatsappUrl;
  };

  checkoutWhatsapp?.addEventListener('click', transferOrderToWhatsApp);
  renderCart();

  // Carrousel automatique de l'image du footer uniquement.
  const footerCarousel = $('#footerImageCarousel');
  const footerCarouselImage = $('#footerCarouselImage');
  const footerCarouselPagination = $('#footerCarouselPagination');
  const footerSlides = (config.footerSlides || []).filter(Boolean);
  let activeFooterSlide = 0;
  let footerAutoplayTimer = null;
  let footerTransitionTimer = null;
  const FOOTER_AUTOPLAY_DELAY = 5000;

  if (footerCarousel && footerCarouselImage && footerCarouselPagination && footerSlides.length) {
    const footerDots = footerSlides.map((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'footer-carousel-dot';
      dot.setAttribute('aria-label', `Afficher l'image ${index + 1}`);
      dot.setAttribute('aria-pressed', 'false');
      dot.addEventListener('click', () => {
        showFooterSlide(index);
        startFooterAutoplay();
      });
      footerCarouselPagination.appendChild(dot);
      return dot;
    });

    const updateFooterPagination = () => {
      footerDots.forEach((dot, index) => {
        const selected = index === activeFooterSlide;
        dot.classList.toggle('is-active', selected);
        dot.setAttribute('aria-pressed', String(selected));
      });
    };

    const showFooterSlide = index => {
      activeFooterSlide = ((index % footerSlides.length) + footerSlides.length) % footerSlides.length;
      const imagePath = footerSlides[activeFooterSlide];
      footerCarouselImage.classList.remove('is-visible');
      if (footerTransitionTimer !== null) window.clearTimeout(footerTransitionTimer);
      footerTransitionTimer = window.setTimeout(() => {
        footerCarouselImage.onload = () => footerCarouselImage.classList.add('is-visible');
        footerCarouselImage.onerror = () => {
          footerCarouselImage.classList.remove('is-visible');
          console.error(`Impossible de charger l'image du footer : ${imagePath}`);
        };
        footerCarouselImage.src = imagePath;
        if (footerCarouselImage.complete && footerCarouselImage.naturalWidth > 0) {
          footerCarouselImage.classList.add('is-visible');
        }
      }, 250);
      updateFooterPagination();
    };

    const stopFooterAutoplay = () => {
      if (footerAutoplayTimer !== null) {
        window.clearInterval(footerAutoplayTimer);
        footerAutoplayTimer = null;
      }
    };

    const startFooterAutoplay = () => {
      stopFooterAutoplay();
      if (footerSlides.length < 2 || prefersReducedMotion.matches) return;
      footerAutoplayTimer = window.setInterval(() => {
        if (!document.hidden) showFooterSlide(activeFooterSlide + 1);
      }, FOOTER_AUTOPLAY_DELAY);
    };

    footerCarouselImage.src = footerSlides[0];
    footerCarouselImage.classList.add('is-visible');
    updateFooterPagination();
    startFooterAutoplay();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopFooterAutoplay();
      else startFooterAutoplay();
    });

    prefersReducedMotion.addEventListener?.('change', event => {
      if (event.matches) stopFooterAutoplay();
      else startFooterAutoplay();
    });
  }

  // Les comptes sociaux ne deviennent des liens cliquables qu'après ajout d'une URL officielle.
  $$('[data-social]').forEach(anchor => {
    const platform = anchor.dataset.social;
    const url = (config.socials || {})[platform];
    if (url && /^https:\/\//i.test(url)) {
      anchor.href = url;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.removeAttribute('aria-disabled');
      anchor.removeAttribute('tabindex');
      anchor.setAttribute('aria-label', `${platform} — s'ouvre dans un nouvel onglet`);
    } else {
      anchor.removeAttribute('href');
      anchor.setAttribute('aria-disabled', 'true');
      anchor.setAttribute('tabindex', '-1');
    }
  });
  // En-tête discret au défilement et bouton de retour en haut.
  const siteHeader = $('#siteHeader');
  const backTop = $('#backTop');
  const updateScrollState = () => {
  const scrolled = window.scrollY > 30;
    if (siteHeader) siteHeader.classList.toggle('is-scrolled', scrolled);
    if (backTop) backTop.classList.toggle('is-visible', window.scrollY > 650);
  };
  window.addEventListener('scroll', updateScrollState, { passive: true });
  updateScrollState();
  backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' }));
  const copyrightYear = $('#copyrightYear');
  if (copyrightYear) copyrightYear.textContent = String(new Date().getFullYear());
  // Les ancres restent natives, mais on ferme aussi le menu lors de changements de hash.
  window.addEventListener('hashchange', closeMenu);



// =====================================================
// NACHA — GOOGLE MAPS / POINTS DE VENTE
// Configuration AdvancedMarkerElement
// =====================================================

const nachaStores = Array.isArray(config.storeLocations)
  ? config.storeLocations
  : [];

const nachaMapElement = $('#nachaStoresMap');
const nachaMapStatus = $('#nachaMapStatus');
const nachaMapFallback = $('#nachaMapFallback');

const nachaStorePanel = $('#nachaStorePanel');
const nachaStoreClose = $('#nachaStoreClose');
const nachaStoreDetail = $('#nachaStoreDetail');

let nachaGoogleMap = null;
let activeNachaStore = null;

let nachaPanelTimer = null;
let nachaPanelRevision = 0;

const nachaMarkers = new Map();


// -----------------------------------------------------
// 1. STATUT DE LA CARTE
// -----------------------------------------------------

const setNachaMapStatus = message => {

  if (nachaMapStatus) {
    nachaMapStatus.textContent = message;
  }

};


// -----------------------------------------------------
// 2. CONSTRUCTION DES INFORMATIONS
// -----------------------------------------------------

const renderNachaStoreDetails = store => {

  if (!nachaStoreDetail || !store) return;

  nachaStoreDetail.replaceChildren();

  const kicker = document.createElement('span');

  kicker.className = 'nacha-store-kicker';

  kicker.textContent =
    String(store.type || 'POINT DE VENTE NACHA').toUpperCase();


const initial = document.createElement('div');

initial.className = 'nacha-store-initial';

const logo = document.createElement('img');

logo.src = 'logo.webp';

logo.alt = 'Logo NACHA';

initial.appendChild(logo);


  const title = document.createElement('h3');

  title.textContent = store.name;


  const branch = document.createElement('span');

  branch.className = 'nacha-store-branch';

  branch.textContent = store.commune || 'Kinshasa';


  const information = document.createElement('dl');

  information.className = 'nacha-store-infos';


  const addInformation = (label, value) => {

    if (!value) return;

    const row = document.createElement('div');

    row.className = 'nacha-store-info';


    const term = document.createElement('dt');

    term.textContent = label;


    const description = document.createElement('dd');

    description.textContent = value;


    row.append(term, description);

    information.appendChild(row);

  };


  addInformation('ADRESSE', store.address);

  addInformation('REPÈRE', store.landmark);

  addInformation('HORAIRES', store.hours);

  addInformation('CONTACT', store.phone);

  addInformation('ZONE', store.coverage);

  addInformation('INFORMATION', store.availability);


  // Itinéraire basé directement sur les coordonnées GPS.
  const directions = document.createElement('a');

  directions.className = 'nacha-store-directions';


  const directionsUrl = new URL(
    'https://www.google.com/maps/dir/'
  );

  directionsUrl.searchParams.set('api', '1');

  directionsUrl.searchParams.set(
    'destination',
    `${store.position.lat},${store.position.lng}`
  );


  directions.href = directionsUrl.toString();

  directions.target = '_blank';

  directions.rel = 'noopener noreferrer';


  directions.innerHTML =
    'Obtenir un itinéraire <span aria-hidden="true">↗</span>';


  const note = document.createElement('p');

  note.className = 'nacha-store-note';

  note.textContent =
    'Les informations pratiques sont indicatives. Veuillez confirmer la disponibilité des produits auprès du magasin.';


  nachaStoreDetail.append(
    kicker,
    initial,
    title,
    branch,
    information,
    directions,
    note
  );

};


// -----------------------------------------------------
// 3. OUVERTURE DE LA FICHE FLOTTANTE
// -----------------------------------------------------

const openNachaStorePanel = store => {

  if (!nachaStorePanel || !store) return;

  const revision = ++nachaPanelRevision;


  if (nachaPanelTimer !== null) {

    window.clearTimeout(nachaPanelTimer);

    nachaPanelTimer = null;

  }


  const panelAlreadyOpen =
    nachaStorePanel.classList.contains('is-open');


  // Transition entre deux points de vente.
  if (panelAlreadyOpen) {

    nachaStorePanel.classList.add('is-switching');


    nachaPanelTimer = window.setTimeout(() => {

      if (revision !== nachaPanelRevision) return;

      renderNachaStoreDetails(store);

      nachaStorePanel.classList.remove('is-switching');

      nachaPanelTimer = null;

    }, 170);


    return;

  }


  // Première ouverture.
  renderNachaStoreDetails(store);

  nachaStorePanel.hidden = false;

  nachaStorePanel.setAttribute('aria-hidden', 'false');

  nachaStorePanel.removeAttribute('inert');


  requestAnimationFrame(() => {

    if (revision !== nachaPanelRevision) return;

    nachaStorePanel.classList.add('is-open');

  });

};


// -----------------------------------------------------
// 4. FERMETURE DE LA FICHE
// -----------------------------------------------------

const closeNachaStorePanel = () => {

  if (!nachaStorePanel) return;

  const revision = ++nachaPanelRevision;


  if (nachaPanelTimer !== null) {

    window.clearTimeout(nachaPanelTimer);

    nachaPanelTimer = null;

  }


  nachaStorePanel.classList.remove(
    'is-open',
    'is-switching'
  );


  nachaStorePanel.setAttribute('aria-hidden', 'true');

  nachaStorePanel.setAttribute('inert', '');


  activeNachaStore = null;


  // Réinitialiser l'apparence des marqueurs.
  nachaMarkers.forEach(item => {

    item.element.classList.remove('is-active');

  });


  // Masquer après la transition.
  nachaPanelTimer = window.setTimeout(() => {

    if (
      revision === nachaPanelRevision &&
      !nachaStorePanel.classList.contains('is-open')
    ) {

      nachaStorePanel.hidden = true;

    }

    nachaPanelTimer = null;

  }, 380);

};


// Bouton de fermeture.
nachaStoreClose?.addEventListener(
  'click',
  closeNachaStorePanel
);


// Fermeture avec Échap.
document.addEventListener('keydown', event => {

  if (
    event.key === 'Escape' &&
    nachaStorePanel?.classList.contains('is-open')
  ) {

    closeNachaStorePanel();

  }

});


// -----------------------------------------------------
// 5. SÉLECTION DU POINT DE VENTE
// -----------------------------------------------------

const selectNachaStore = (
  storeId,
  centerMap = true
) => {

  const store = nachaStores.find(
    item => item.id === storeId
  );

  if (!store) return;


  activeNachaStore = storeId;


  // Réinitialiser les marqueurs.
  nachaMarkers.forEach((item, id) => {

    item.element.classList.toggle(
      'is-active',
      id === storeId
    );

  });


  // Afficher les informations.
  openNachaStorePanel(store);


  // Déplacement de la carte.
  if (centerMap && nachaGoogleMap) {

    nachaGoogleMap.panTo(store.position);

    nachaGoogleMap.setZoom(
      window.innerWidth <= 640 ? 14 : 15
    );

  }

};


// -----------------------------------------------------
// 6. INITIALISATION GOOGLE MAPS
// -----------------------------------------------------

const initializeNachaGoogleMap = async () => {

  if (!nachaMapElement || !nachaStores.length) return;


  try {

    // Charger uniquement les bibliothèques nécessaires.
    const [
      { Map },
      { AdvancedMarkerElement }
    ] = await Promise.all([

      google.maps.importLibrary('maps'),

      google.maps.importLibrary('marker')

    ]);


    // Initialisation de la carte.
    nachaGoogleMap = new Map(nachaMapElement, {

      center: {
        lat: -4.3083,
        lng: 15.3003
      },

      zoom: 12,

      minZoom: 10,

      maxZoom: 17,

      // Identifiant requis pour AdvancedMarkerElement.
      mapId: config.googleMapsMapId || 'DEMO_MAP_ID',

      gestureHandling: 'cooperative',

      clickableIcons: false,

      streetViewControl: false,

      mapTypeControl: false,

      fullscreenControl: false,

      zoomControl: true,

      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM
      }

    });


    const bounds = new google.maps.LatLngBounds();

    let successfulMarkers = 0;

    let failedMarkers = 0;


    // -------------------------------------------------
    // CRÉATION DES MARQUEURS NACHA
    // -------------------------------------------------

    nachaStores.forEach((store, index) => {

      try {

        const lat = Number(store.position?.lat);

        const lng = Number(store.position?.lng);


        // Vérifier les coordonnées directement déclarées.
        if (
          !Number.isFinite(lat) ||
          !Number.isFinite(lng) ||
          lat < -90 ||
          lat > 90 ||
          lng < -180 ||
          lng > 180
        ) {

          throw new Error(
            'Coordonnées GPS invalides.'
          );

        }


        const position = {
          lat,
          lng
        };


        // Élément HTML du marqueur.
        const markerElement =
          document.createElement('button');


        markerElement.type = 'button';

        markerElement.className = 'nacha-map-marker';

        markerElement.setAttribute(
          'aria-label',
          `${store.name}, ${store.commune}`
        );


        const number =
          document.createElement('span');

        number.className = 'nacha-map-marker-number';

        number.textContent =
          String(store.number || index + 1)
            .padStart(2, '0');


        markerElement.appendChild(number);


        // Marqueur Google Maps avancé.
        const marker = new AdvancedMarkerElement({

          map: nachaGoogleMap,

          position,

          content: markerElement,

          title: `${store.name} — ${store.commune}`,

          gmpClickable: true,

          zIndex: 10 + index

        });


        // Interaction du marqueur.
        marker.addEventListener('gmp-click', () => {

          selectNachaStore(store.id, true);

        });


        // Stocker le marqueur et son élément HTML.
        nachaMarkers.set(store.id, {

          marker,

          element: markerElement,

          store

        });


        bounds.extend(position);

        successfulMarkers++;


      } catch (error) {

        failedMarkers++;

        console.error(
          `Erreur de positionnement pour ${store.name}:`,
          error
        );

      }

    });


    // -------------------------------------------------
    // CADRAGE AUTOMATIQUE DE LA CARTE
    // -------------------------------------------------

    if (successfulMarkers > 0) {

      nachaGoogleMap.fitBounds(bounds, 70);

    }


    // Supprimer le fallback.
    if (nachaMapFallback) {

      nachaMapFallback.hidden = true;

    }


    // Statut final.
    if (failedMarkers > 0) {

      setNachaMapStatus(
        `${successfulMarkers} point(s) affiché(s) · ${failedMarkers} position(s) à vérifier.`
      );

    } else {

      setNachaMapStatus(
        `${successfulMarkers} points de vente NACHA · Sélectionnez un marqueur pour découvrir l'enseigne.`
      );

    }


    // Compteur facultatif si ajouté plus tard au HTML.
    const countElement = $('#nachaStoreCount');

    if (countElement) {

      countElement.textContent =
        String(successfulMarkers).padStart(2, '0');

    }


  } catch (error) {

    console.error(
      'Erreur d’initialisation de la carte NACHA :',
      error
    );


    setNachaMapStatus(
      'Impossible de charger Google Maps. Vérifiez la clé API, le Map ID et les services activés.'
    );


    if (nachaMapFallback) {

      nachaMapFallback.hidden = false;

    }

  }

};


// -----------------------------------------------------
// 7. CHARGEMENT DE GOOGLE MAPS
// -----------------------------------------------------

if (nachaMapElement && nachaStores.length) {

  const apiKey = String(
    config.googleMapsApiKey || ''
  ).trim();


  if (
    !apiKey ||
    apiKey.includes('REMPLACER_PAR')
  ) {

    setNachaMapStatus(
      'La clé Google Maps doit être configurée.'
    );

  } else {

    // Callback utilisé par Google Maps.
    window.initNachaStoresMap =
      initializeNachaGoogleMap;


    // Éviter de charger l'API une seconde fois.
    if (window.google?.maps?.importLibrary) {

      initializeNachaGoogleMap();

    } else {

      const googleMapsScript =
        document.createElement('script');


      googleMapsScript.src =
        `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async&callback=initNachaStoresMap&v=weekly`;


      googleMapsScript.async = true;


      googleMapsScript.onerror = () => {

        setNachaMapStatus(
          'Le chargement de Google Maps a échoué.'
        );

        if (nachaMapFallback) {
          nachaMapFallback.hidden = false;
        }

      };


      document.head.appendChild(googleMapsScript);

    }


    setNachaMapStatus(
      'Chargement des localisations NACHA...'
    );

  }

}


})();
