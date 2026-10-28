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

  // Carrousel Hero : lecture automatique des vidéos.
  // Les URLs restent configurées exclusivement dans config.js.
  const hero = $('.hero');
  const heroVideo = $('#heroVideo');
  const heroPagination = $('#heroPagination');
  const heroDots = $$('.hero-dot');
  const heroCurrent = $('#heroCurrent');

  let activeSlide = 0;
  let heroAutoplayTimer = null;

  const HERO_AUTOPLAY_DELAY = 8000;
  const slides = (config.heroSlides || []).slice(0, 3);

  const applySlide = (index) => {
    if (!slides.length || !hero) return;

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

    heroDots.forEach((dot, dotIndex) => {
      const selected = dotIndex === activeSlide;

      dot.classList.toggle('is-active', selected);
      dot.setAttribute('aria-pressed', String(selected));
    });

    if (heroCurrent) {
      heroCurrent.textContent = String(activeSlide + 1).padStart(2, '0');
    }

    if (!heroVideo) return;

    const nextVideo = slide.video || '';
    const currentSource =
      heroVideo.getAttribute('data-current-source') || '';

    if (nextVideo !== currentSource) {
      heroVideo.pause();
      heroVideo.removeAttribute('src');

      while (heroVideo.firstChild) {
        heroVideo.removeChild(heroVideo.firstChild);
      }

      heroVideo.removeAttribute('poster');
      heroVideo.classList.remove('is-visible');

      if (slide.poster) {
        heroVideo.setAttribute('poster', slide.poster);
      }

      if (nextVideo) {
        heroVideo.src = nextVideo;
        heroVideo.setAttribute('data-current-source', nextVideo);
        heroVideo.load();

        if (!prefersReducedMotion.matches) {
          heroVideo.play().catch(() => {});
        }
      } else {
        heroVideo.removeAttribute('data-current-source');
      }
    } else if (
      nextVideo &&
      !prefersReducedMotion.matches &&
      heroVideo.paused
    ) {
      heroVideo.play().catch(() => {});
    }
  };

  if (heroVideo) {
    heroVideo.addEventListener('canplay', () => {
      heroVideo.classList.add('is-visible');
    });

    heroVideo.addEventListener('error', () => {
      heroVideo.classList.remove('is-visible');
      heroVideo.removeAttribute('src');
      heroVideo.removeAttribute('data-current-source');
    });
  }

  // La pagination devient un indicateur visuel non interactif.
  if (heroPagination) {
    heroDots.forEach(dot => {
      dot.disabled = true;
      dot.tabIndex = -1;
    });
  }

  // Démarrage et arrêt du défilement automatique.
  const stopHeroAutoplay = () => {
    if (heroAutoplayTimer !== null) {
      window.clearInterval(heroAutoplayTimer);
      heroAutoplayTimer = null;
    }
  };

  const startHeroAutoplay = () => {
    stopHeroAutoplay();

    if (slides.length < 2 || prefersReducedMotion.matches) return;

    heroAutoplayTimer = window.setInterval(() => {
      if (!document.hidden) {
        applySlide(activeSlide + 1);
      }
    }, HERO_AUTOPLAY_DELAY);
  };

  // Afficher la première séquence au chargement.
  applySlide(0);
  startHeroAutoplay();

  // Respecter la préférence de réduction des animations.
  prefersReducedMotion.addEventListener?.('change', event => {
    if (event.matches) {
      if (heroVideo) heroVideo.pause();
      stopHeroAutoplay();
    } else {
      if (heroVideo && heroVideo.getAttribute('src')) {
        heroVideo.play().catch(() => {});
      }

      startHeroAutoplay();
    }
  });

  // Présentation interactive des quatre produits : chaque visuel reste vide tant que le pack officiel n'est pas fourni.
  const productOptions = $$('.product-option');
  const productStage = $('#productStage');
  const productVisual = $('#productVisual');
  const productNumber = $('#productNumber');
  const productWeight = $('#productWeight');
  const productTitle = $('#productTitle');
  const productKicker = $('#productKicker');
  const productDescription = $('#productDescription');
  const productFacts = $('#productFacts');
  let activeProduct = 0;
  const renderProduct = index => {
    const products = config.products || [];
    if (!products.length) return;
    activeProduct = (index + products.length) % products.length;
    const item = products[activeProduct];
    if (productStage) {
      productStage.classList.remove('product-tone--small', 'product-tone--red', 'product-tone--green', 'product-tone--portable');
      productStage.classList.add(item.theme || 'product-tone--small');
      productStage.classList.remove('product-switching');
      // Déclenche une transition brève sans flash lors d'un changement de référence.
      if (!prefersReducedMotion.matches) {
        void productStage.offsetWidth;
        productStage.classList.add('product-switching');
      }
    }
    if (productNumber) productNumber.textContent = `RÉFÉRENCE ${String(activeProduct + 1).padStart(2, '0')}`;
    if (productWeight) productWeight.textContent = String(item.weight || '').toUpperCase();
    if (productTitle) productTitle.innerHTML = `${escapeHtml(item.title || 'NACHA')} <em>${escapeHtml(item.weight || '')}</em>`;
    if (productKicker) productKicker.textContent = item.kicker || '';
    if (productDescription) productDescription.textContent = item.description || '';
    if (productFacts) {
      productFacts.replaceChildren();
      (item.facts || []).forEach(fact => {
        const span = document.createElement('span'); span.textContent = fact; productFacts.appendChild(span);
      });
    }
    if (productVisual) {
      productVisual.replaceChildren();
      if (item.image) {
        const image = document.createElement('img'); image.src = item.image; image.alt = item.imageAlt || item.title || 'Produit NACHA'; image.className = 'official-product-image';
        image.addEventListener('error', () => showProductPlaceholder(), { once: true });
        productVisual.appendChild(image);
      } else showProductPlaceholder();
    }
    productOptions.forEach((button, buttonIndex) => {
      const selected = buttonIndex === activeProduct;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  };
  const showProductPlaceholder = () => {
    if (!productVisual) return;
    productVisual.replaceChildren();
    const orbitA = document.createElement('div'); orbitA.className = 'visual-orbit visual-orbit--a'; orbitA.setAttribute('aria-hidden', 'true');
    const orbitB = document.createElement('div'); orbitB.className = 'visual-orbit visual-orbit--b'; orbitB.setAttribute('aria-hidden', 'true');
    const pepper = document.createElement('img'); pepper.className = 'stage-chili'; pepper.src = 'assets/illustrations/chili-art.svg'; pepper.alt = ''; pepper.setAttribute('aria-hidden', 'true');
    const placeholder = document.createElement('div'); placeholder.className = 'asset-placeholder asset-placeholder--product';
    placeholder.innerHTML = '<span class="asset-placeholder__icon" aria-hidden="true">✳</span><strong>Visuel officiel du sachet</strong><span>À intégrer avant publication</span>';
    productVisual.append(orbitA, orbitB, pepper, placeholder);
    productVisual.setAttribute('aria-label', 'Emplacement de la photographie officielle du produit');
  };
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }
  productOptions.forEach(button => button.addEventListener('click', () => renderProduct(Number(button.dataset.product))));
  $('#productPrev')?.addEventListener('click', () => renderProduct(activeProduct - 1));
  $('#productNext')?.addEventListener('click', () => renderProduct(activeProduct + 1));
  renderProduct(0);

    // Carrousel automatique de l'image du footer uniquement.
  const footerCarousel = $('#footerImageCarousel');
  const footerCarouselImage = $('#footerCarouselImage');
  const footerCarouselPagination = $('#footerCarouselPagination');

  const footerSlides = (config.footerSlides || []).filter(Boolean);

  let activeFooterSlide = 0;
  let footerAutoplayTimer = null;
  let footerTransitionTimer = null;

  const FOOTER_AUTOPLAY_DELAY = 5000;

  if (
    footerCarousel &&
    footerCarouselImage &&
    footerCarouselPagination &&
    footerSlides.length
  ) {
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

    const showFooterSlide = (index) => {
      activeFooterSlide =
        ((index % footerSlides.length) + footerSlides.length) %
        footerSlides.length;

      const imagePath = footerSlides[activeFooterSlide];

      footerCarouselImage.classList.remove('is-visible');

      if (footerTransitionTimer !== null) {
        window.clearTimeout(footerTransitionTimer);
      }

      footerTransitionTimer = window.setTimeout(() => {
        footerCarouselImage.onload = () => {
          footerCarouselImage.classList.add('is-visible');
        };

        footerCarouselImage.onerror = () => {
          footerCarouselImage.classList.remove('is-visible');
          console.error(
            `Impossible de charger l'image du footer : ${imagePath}`
          );
        };

        footerCarouselImage.src = imagePath;

        if (
          footerCarouselImage.complete &&
          footerCarouselImage.naturalWidth > 0
        ) {
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

      if (
        footerSlides.length < 2 ||
        prefersReducedMotion.matches
      ) {
        return;
      }

      footerAutoplayTimer = window.setInterval(() => {
        if (!document.hidden) {
          showFooterSlide(activeFooterSlide + 1);
        }
      }, FOOTER_AUTOPLAY_DELAY);
    };

    // Synchroniser la pagination et l'image initiale.
    footerCarouselImage.src = footerSlides[0];
    footerCarouselImage.classList.add('is-visible');
    updateFooterPagination();

    // Démarrer le défilement automatique.
    startFooterAutoplay();

    // Suspendre le carrousel lorsque l'onglet est masqué.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopFooterAutoplay();
      } else {
        startFooterAutoplay();
      }
    });

    // Respecter la préférence de réduction des animations.
    prefersReducedMotion.addEventListener?.('change', (event) => {
      if (event.matches) {
        stopFooterAutoplay();
      } else {
        startFooterAutoplay();
      }
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
})();
