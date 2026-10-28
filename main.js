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
  // Carrousel Hero : lecture automatique des images et des vidéos configurées dans config.js.
  const hero = $('.hero');
  const heroVideo = $('#heroVideo');
  const heroImage = $('#heroImage');
  const heroPagination = $('#heroPagination');
  const heroDots = [];
  const heroCurrent = $('#heroCurrent');

  let activeSlide = 0;
  let heroAutoplayTimer = null;

  const HERO_AUTOPLAY_DELAY = 8000;
  const slides = (config.heroSlides || []).filter(slide => slide && (slide.video || slide.image));

  // Générer autant d'indicateurs que de médias configurés.
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

  const applySlide = index => {
    if (!slides.length || !hero) return;

    activeSlide = (index + slides.length) % slides.length;
    const slide = slides[activeSlide];

    hero.classList.remove('hero-scene--one', 'hero-scene--two', 'hero-scene--three');
    hero.classList.add(slide.theme || `hero-scene--${['one', 'two', 'three'][activeSlide % 3]}`);

    heroDots.forEach((dot, dotIndex) => {
      const selected = dotIndex === activeSlide;
      dot.classList.toggle('is-active', selected);
      dot.setAttribute('aria-pressed', String(selected));
    });

    if (heroCurrent) {
      heroCurrent.textContent = String(activeSlide + 1).padStart(2, '0');
    }

    // Une entrée vidéo utilise le lecteur existant ; une entrée image utilise #heroImage.
    const nextVideo = slide.video || '';
    const nextImage = nextVideo ? '' : (slide.image || '');

    if (heroVideo) {
      const currentVideo = heroVideo.getAttribute('data-current-source') || '';

      if (nextVideo !== currentVideo) {
        heroVideo.pause();
        heroVideo.classList.remove('is-visible');
        heroVideo.removeAttribute('src');
        heroVideo.removeAttribute('data-current-source');
        heroVideo.removeAttribute('poster');

        if (nextVideo) {
          if (slide.poster) heroVideo.setAttribute('poster', slide.poster);
          heroVideo.setAttribute('data-current-source', nextVideo);
          heroVideo.src = nextVideo;
          heroVideo.load();
          if (!prefersReducedMotion.matches) {
            heroVideo.play().catch(() => {});
          }
        } else {
          heroVideo.load();
        }
      } else if (nextVideo && !prefersReducedMotion.matches && heroVideo.paused) {
        heroVideo.play().catch(() => {});
      }
    }

    if (heroImage) {
      const currentImage = heroImage.getAttribute('data-current-source') || '';

      if (nextImage !== currentImage) {
        heroImage.classList.remove('is-visible');
        heroImage.onload = null;
        heroImage.onerror = null;
        heroImage.removeAttribute('src');
        heroImage.removeAttribute('data-current-source');

        if (nextImage) {
          heroImage.onload = () => {
            if (heroImage.getAttribute('data-current-source') === nextImage && slides[activeSlide]?.image === nextImage) {
              heroImage.classList.add('is-visible');
            }
          };
          heroImage.onerror = () => {
            if (heroImage.getAttribute('data-current-source') === nextImage) {
              heroImage.classList.remove('is-visible');
              heroImage.removeAttribute('src');
              heroImage.removeAttribute('data-current-source');
              console.error(`Impossible de charger l'image du Hero : ${nextImage}`);
            }
          };
          heroImage.setAttribute('data-current-source', nextImage);
          heroImage.src = nextImage;
          if (heroImage.complete && heroImage.naturalWidth > 0) {
            heroImage.classList.add('is-visible');
          }
        }
      } else if (nextImage && heroImage.complete && heroImage.naturalWidth > 0) {
        heroImage.classList.add('is-visible');
      }
    }
  };

  if (heroVideo) {
    heroVideo.addEventListener('canplay', () => {
      const currentSlide = slides[activeSlide];
      if (currentSlide?.video && currentSlide.video === heroVideo.getAttribute('data-current-source')) {
        heroVideo.classList.add('is-visible');
      }
    });

    heroVideo.addEventListener('error', () => {
      const currentSlide = slides[activeSlide];
      const currentSource = heroVideo.getAttribute('data-current-source');
      if (!currentSource || currentSlide?.video !== currentSource) return;
      heroVideo.classList.remove('is-visible');
      heroVideo.removeAttribute('src');
      heroVideo.removeAttribute('data-current-source');
    });
  }

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
      if (!document.hidden) applySlide(activeSlide + 1);
    }, HERO_AUTOPLAY_DELAY);
  };

  // Afficher le premier média puis faire défiler images et vidéos automatiquement.
  applySlide(0);
  startHeroAutoplay();

  prefersReducedMotion.addEventListener?.('change', event => {
    if (event.matches) {
      if (heroVideo) heroVideo.pause();
      stopHeroAutoplay();
    } else {
      const currentSlide = slides[activeSlide];
      if (heroVideo && currentSlide?.video && heroVideo.getAttribute('src')) {
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
  const productPrice = $('#productPrice');
  const productAddToCartButton = $('#productAddToCart');
  const formatPrice = price => {
    if (price === null || price === undefined || price === '' || !Number.isFinite(Number(price)) || Number(price) <= 0) return 'Prix à renseigner';
    return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(price))} ${config.currency || 'FC'}`;
  };
  const hasValidPrice = product => typeof product?.price === 'number' && Number.isFinite(product.price) && product.price > 0;
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
    if (productPrice) productPrice.textContent = formatPrice(item.price);
    if (productAddToCartButton) productAddToCartButton.setAttribute('aria-label', `Ajouter ${item.title || 'ce produit'} au panier`);
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
        if (productAddToCartButton) productVisual.appendChild(productAddToCartButton);
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
    if (productAddToCartButton) productVisual.appendChild(productAddToCartButton);
    productVisual.setAttribute('aria-label', 'Emplacement de la photographie officielle du produit');
  };
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }
  productOptions.forEach(button => button.addEventListener('click', () => renderProduct(Number(button.dataset.product))));
  $('#productPrev')?.addEventListener('click', () => renderProduct(activeProduct - 1));
  $('#productNext')?.addEventListener('click', () => renderProduct(activeProduct + 1));
  renderProduct(0);

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

  const addProductToCart = (product, index) => {
    if (!product) return;
    const id = getProductId(product, index);
    const existing = cart.find(entry => entry.id === id);
    if (existing) existing.quantity += 1;
    else cart.push({ id, quantity: 1 });
    saveCart();
    renderCart();
    setCartStatus(`${product.title || 'Produit NACHA'} ajouté au panier.`);
    openCart(productAddToCartButton || cartTrigger);
  };

  if (productAddToCartButton) {
    productAddToCartButton.addEventListener('click', () => {
      const product = (config.products || [])[activeProduct];
      addProductToCart(product, activeProduct);
    });
  }

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
})();
