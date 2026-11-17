/* NACHA — motion complémentaire de la page Qui sommes-nous ? */
(async () => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Repli discret pour les médias absents : les compositions restent propres.
  document.querySelectorAll('[data-fallback-image]').forEach(image => {
    image.addEventListener('error', () => {
      image.closest('[data-media-frame]')?.classList.add('is-missing');
    }, { once: true });
    if (image.complete && image.naturalWidth === 0) {
      image.closest('[data-media-frame]')?.classList.add('is-missing');
    }
  });

  // Mettre en évidence l'étape de traçabilité visible et faire progresser le repère.
  const traceSteps = [...document.querySelectorAll('.trace-step')];
  const traceProgress = document.querySelector('#traceProgress');
  if (traceSteps.length && 'IntersectionObserver' in window) {
    const traceObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const index = traceSteps.indexOf(entry.target);
        traceSteps.forEach((step, stepIndex) => {
          step.classList.toggle('is-current', stepIndex === index);
        });
        if (traceProgress) {
          traceProgress.style.width = `${traceSteps.length > 1 ? (index / (traceSteps.length - 1)) * 100 : 100}%`;
        }
      });
    }, { threshold: 0.55, rootMargin: '-8% 0px -18% 0px' });
    traceSteps.forEach(step => traceObserver.observe(step));
  }

  // Scène Three.js décorative : poussières d'épices stylisées, sans modèle produit fictif.
  const canvas = document.querySelector('#aboutThreeCanvas');
  if (!canvas || reduceMotion.matches || !('WebGLRenderingContext' in window)) return;

  let THREE;
  try {
    THREE = await import('https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.js');
  } catch (error) {
    canvas.hidden = true;
    console.warn('La scène Three.js NACHA est indisponible ; le visuel CSS reste actif.', error);
    return;
  }

  const host = canvas.parentElement;
  if (!host) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch (error) {
    canvas.hidden = true;
    console.warn('WebGL indisponible ; le visuel CSS reste actif.', error);
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 30);
  camera.position.set(0, 0, 6.3);

  const orbitGroup = new THREE.Group();
  scene.add(orbitGroup);

  const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xD28402, transparent: true, opacity: 0.23, wireframe: true });
  const ringOne = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.006, 6, 160), ringMaterial);
  ringOne.rotation.set(0.9, 0.2, -0.35);
  orbitGroup.add(ringOne);
  const ringTwo = new THREE.Mesh(
    new THREE.TorusGeometry(1.35, 0.004, 6, 140),
    new THREE.MeshBasicMaterial({ color: 0xFFF8F0, transparent: true, opacity: 0.14, wireframe: true })
  );
  ringTwo.rotation.set(-0.55, 0.9, 0.5);
  orbitGroup.add(ringTwo);

  const particleCount = 210;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i += 1) {
    const radius = 1.65 + Math.random() * 1.1;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.cos(phi);
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMaterial = new THREE.PointsMaterial({
    color: 0xE9AD45,
    size: 0.027,
    transparent: true,
    opacity: 0.72,
    sizeAttenuation: true,
    depthWrite: false
  });
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  orbitGroup.add(particles);

  const resize = () => {
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);

  let visible = true;
  let frameId = 0;
  const visibilityObserver = new IntersectionObserver(entries => {
    visible = entries[0]?.isIntersecting ?? true;
    if (visible) startAnimation();
    else cancelAnimationFrame(frameId);
  }, { threshold: 0.05 });
  visibilityObserver.observe(host);

  const animate = time => {
    if (!visible || reduceMotion.matches) return;
    const seconds = time * 0.00012;
    orbitGroup.rotation.y = seconds;
    orbitGroup.rotation.x = Math.sin(seconds * 1.4) * 0.08;
    ringOne.rotation.z = -seconds * 0.55;
    ringTwo.rotation.y = seconds * 0.42;
    renderer.render(scene, camera);
    frameId = requestAnimationFrame(animate);
  };
  function startAnimation() {
    cancelAnimationFrame(frameId);
    if (visible && !reduceMotion.matches) frameId = requestAnimationFrame(animate);
  }
  startAnimation();

  reduceMotion.addEventListener?.('change', event => {
    if (event.matches) {
      cancelAnimationFrame(frameId);
      renderer.render(scene, camera);
    } else startAnimation();
  });

  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(frameId);
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    particleGeometry.dispose();
    particleMaterial.dispose();
    ringMaterial.dispose();
    renderer.dispose();
  }, { once: true });
})();


/* =====================================================
   NACHA — AFFICHAGE DES COORDONNÉES DE CONTRIBUTION
   ===================================================== */

(() => {

  const initKwiluContribution = () => {

    const button = document.getElementById("kwilu-contribute-btn");
    const paymentDetails = document.getElementById("kwilu-payment-details");

    if (!button || !paymentDetails) return;

    const buttonLabel = button.querySelector(
      ".kwilu-support__button-label"
    );

    if (!buttonLabel) return;

    button.addEventListener("click", () => {

      const isExpanded =
        button.getAttribute("aria-expanded") === "true";

      if (isExpanded) {

        paymentDetails.hidden = true;

        button.setAttribute("aria-expanded", "false");
        buttonLabel.textContent = "Contribuer";

      } else {

        paymentDetails.hidden = false;

        button.setAttribute("aria-expanded", "true");
        buttonLabel.textContent = "Masquer les coordonnées";

      }

    });

  };

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initKwiluContribution,
      { once: true }
    );
  } else {
    initKwiluContribution();
  }

})();
