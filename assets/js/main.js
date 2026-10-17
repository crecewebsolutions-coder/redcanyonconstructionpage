/**
 * RED CANYON REMODELING LLC - MAIN JAVASCRIPT
 * High-performance animations, before/after comparison slider,
 * quote wizard modal, dynamic calculator, and lightbox.
 */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileDrawer();
  initScrollAnimations();
  initCounterAnimations();
  initHeroSlider();
  initBeforeAfterSlider();
  initGalleryFilter();
  initLightbox();
  initSubthemeAccordions();
  initPhaseAccordions();
  initSpCarousels();
  initCalculator();
  initQuoteWizardModal();
  initFormHandler();
  initFaqAccordion();
  setCurrentYear();
});

/* ==========================================================================
   STICKY HEADER
   ========================================================================== */
function initStickyHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  let ticking = false;
  const handleScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (window.scrollY > 40) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ==========================================================================
   MOBILE DRAWER NAVIGATION
   ========================================================================== */
function initMobileDrawer() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const backdrop = document.querySelector('.drawer-backdrop');
  const closeBtn = document.querySelector('.drawer-close');

  if (!toggleBtn || !drawer) return;

  const openDrawer = () => {
    drawer.classList.add('active');
    if (backdrop) backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
    document.body.style.overflow = '';
  };

  toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  const drawerLinks = drawer.querySelectorAll('a:not(.drawer-dropdown-title)');
  drawerLinks.forEach(link => link.addEventListener('click', closeDrawer));

  // Drawer dropdown accordion ("desplegar a gusto")
  const drawerDropdownToggles = drawer.querySelectorAll('.drawer-dropdown-title, .drawer-dropdown-toggle');
  drawerDropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const parent = toggle.closest('.drawer-dropdown');
      if (parent) {
        const isExpanded = parent.classList.toggle('active');
        toggle.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      }
    });
  });

  // Desktop nav touch support for dropdown
  const desktopDropdowns = document.querySelectorAll('.nav-item-dropdown');
  desktopDropdowns.forEach(dd => {
    const toggle = dd.querySelector('.nav-dropdown-toggle');
    if (toggle) {
      toggle.addEventListener('click', (e) => {
        // If on touch device, toggle class on tap
        if (window.innerWidth <= 1024) {
          e.preventDefault();
          dd.classList.toggle('active');
        }
      });
    }
  });
}

/* ==========================================================================
   SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
   ========================================================================== */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-zoom');
  if (!revealElements.length) return;

  const isMobile = window.innerWidth <= 768;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: isMobile ? 0.05 : 0.12,
    rootMargin: isMobile ? '40px 0px 0px 0px' : '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   ANIMATED METRIC COUNTERS
   ========================================================================== */
function initCounterAnimations() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const rawTarget = counter.getAttribute('data-counter') || '0';
        const isDecimal = rawTarget.includes('.');
        const targetValue = parseFloat(rawTarget);
        const prefix = counter.getAttribute('data-prefix') || '';
        const suffix = counter.getAttribute('data-suffix') || '';
        const duration = 1800;
        const startTime = performance.now();

        function update(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out exponential curve
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          const current = isDecimal 
            ? (easeProgress * targetValue).toFixed(1)
            : Math.floor(easeProgress * targetValue);

          counter.innerHTML = `${prefix}${current}<span>${suffix}</span>`;

          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            counter.innerHTML = `${prefix}${targetValue}<span>${suffix}</span>`;
          }
        }

        requestAnimationFrame(update);
        obs.unobserve(counter);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach(c => observer.observe(c));
}

/* ==========================================================================
   HERO SLIDER
   ========================================================================== */
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slider-img');
  const dots = document.querySelectorAll('.slider-dot');
  if (slides.length <= 1) return;

  let current = 0;
  const total = slides.length;

  const showSlide = (index) => {
    slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    current = index;
  };

  let timer = setInterval(() => {
    showSlide((current + 1) % total);
  }, 6000);

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      clearInterval(timer);
      showSlide(idx);
      timer = setInterval(() => {
        showSlide((current + 1) % total);
      }, 6000);
    });
  });
}

/* ==========================================================================
   INTERACTIVE BEFORE / AFTER SLIDER
   ========================================================================== */
function initBeforeAfterSlider() {
  const container = document.querySelector('.before-after-wrapper');
  if (!container) return;

  const overlay = container.querySelector('.before-after-overlay');
  const handle = container.querySelector('.before-after-handle');
  const imgOver = container.querySelector('.before-after-img-over');
  if (!overlay || !handle) return;

  let isDragging = false;
  let touchStartX = 0;
  let touchStartY = 0;
  let isIntentionalHorizontalDrag = false;

  // Ensure overlay image width precisely matches container width on all viewports
  const updateOverlayWidth = () => {
    if (imgOver) {
      imgOver.style.width = `${container.clientWidth}px`;
    }
  };

  updateOverlayWidth();
  window.addEventListener('resize', updateOverlayWidth, { passive: true });

  const setSliderPosition = (x) => {
    const rect = container.getBoundingClientRect();
    let position = ((x - rect.left) / rect.width) * 100;

    // Constrain position between 4% and 96%
    if (position < 4) position = 4;
    if (position > 96) position = 96;

    overlay.style.width = `${position}%`;
    handle.style.left = `${position}%`;
  };

  // Mouse drag handling (desktop)
  const startMouseDrag = (e) => {
    isDragging = true;
    container.style.cursor = 'ew-resize';
  };

  const stopMouseDrag = () => {
    isDragging = false;
    container.style.cursor = '';
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    setSliderPosition(e.clientX);
  };

  container.addEventListener('mousedown', startMouseDrag);
  window.addEventListener('mouseup', stopMouseDrag);
  window.addEventListener('mousemove', onMouseMove);

  // Touch drag handling (mobile): strictly prevents hijacking vertical scrolling
  container.addEventListener('touchstart', (e) => {
    if (!e.touches || !e.touches[0]) return;
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    isIntentionalHorizontalDrag = false;

    // If touching directly on the handle or button, immediately initiate drag
    if (e.target.closest('.before-after-handle') || e.target.closest('.before-after-button')) {
      isDragging = true;
      isIntentionalHorizontalDrag = true;
    } else {
      isDragging = false;
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!e.touches || !e.touches[0]) return;
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartX);
    const deltaY = Math.abs(touch.clientY - touchStartY);

    // If user is clearly scrolling down/up vertically, cancel any slider drag so page scrolls smoothly
    if (!isIntentionalHorizontalDrag && deltaY > 8 && deltaY > deltaX) {
      isDragging = false;
      return;
    }

    // If user explicitly swipes horizontally across the slider, activate drag
    if (!isDragging && deltaX > 15 && deltaX > deltaY * 1.5) {
      isDragging = true;
      isIntentionalHorizontalDrag = true;
    }

    if (isDragging) {
      setSliderPosition(touch.clientX);
    }
  }, { passive: true });

  const stopTouchDrag = () => {
    isDragging = false;
    isIntentionalHorizontalDrag = false;
  };

  window.addEventListener('touchend', stopTouchDrag, { passive: true });
  window.addEventListener('touchcancel', stopTouchDrag, { passive: true });

  // Direct click to move
  container.addEventListener('click', (e) => {
    if (!isIntentionalHorizontalDrag) {
      setSliderPosition(e.clientX);
    }
  });
}

/* ==========================================================================
   PORTFOLIO GALLERY FILTERING
   ========================================================================== */
function initGalleryFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.gallery-item');
  const albums = document.querySelectorAll('.album-card-block');

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      items.forEach(item => {
        const category = item.getAttribute('data-category') || '';
        const matches = (filterValue === 'all' || category === filterValue || category.split(' ').includes(filterValue));
        if (matches) {
          item.style.display = '';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 30);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 250);
        }
      });

      // Also filter parent album blocks when filtering by location or trade
      albums.forEach(album => {
        const albumCat = album.getAttribute('data-album') || '';
        const matches = (filterValue === 'all' || albumCat === filterValue || albumCat.split(' ').includes(filterValue));
        if (matches) {
          album.style.display = '';
        } else {
          album.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   EXPANDABLE SUBTHEMES FOR SPECIAL PROJECTS
   ========================================================================== */
function initSubthemeAccordions() {
  const toggles = document.querySelectorAll('.sp-subtheme-toggle');
  toggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const parentBlock = toggle.closest('.sp-subtheme-block');
      if (!parentBlock) return;

      const isOpen = parentBlock.classList.contains('active');
      parentBlock.classList.toggle('active');
      toggle.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
    });
  });

  const toggleAllBtns = document.querySelectorAll('.sp-toggle-all-btn');
  toggleAllBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const projectCard = btn.closest('.album-card-block');
      if (!projectCard) return;
      const subthemes = projectCard.querySelectorAll('.sp-subtheme-block');
      const allActive = Array.from(subthemes).every(st => st.classList.contains('active'));

      subthemes.forEach(st => {
        if (allActive) {
          st.classList.remove('active');
          st.querySelector('.sp-subtheme-toggle')?.setAttribute('aria-expanded', 'false');
        } else {
          st.classList.add('active');
          st.querySelector('.sp-subtheme-toggle')?.setAttribute('aria-expanded', 'true');
        }
      });

      const iconSpan = btn.querySelector('.btn-icon');
      const textSpan = btn.querySelector('.btn-text');
      if (allActive) {
        if (textSpan) textSpan.textContent = textSpan.getAttribute('data-expand-text') || 'Expandir Subtemas';
        if (iconSpan) iconSpan.textContent = '▾';
      } else {
        if (textSpan) textSpan.textContent = textSpan.getAttribute('data-collapse-text') || 'Contraer Subtemas';
        if (iconSpan) iconSpan.textContent = '▴';
      }
    });
  });
}

/* ==========================================================================
   SPECIAL PROJECTS PHASE ACCORDIONS ("desplegar a gusto")
   ========================================================================== */
function initPhaseAccordions() {
  const phaseCards = document.querySelectorAll('.sp-phase-card');
  if (!phaseCards.length) return;

  phaseCards.forEach(card => {
    const header = card.querySelector('.sp-phase-header');
    if (!header) return;

    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-expanded', 'true');

    const toggle = (e) => {
      if (e.target.closest('a, button:not(.sp-phase-header)')) return;
      const isCollapsed = card.classList.toggle('collapsed');
      header.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
      const label = card.querySelector('.sp-phase-toggle-label');
      if (label) {
        const isSpanish = document.documentElement.lang === 'es' || window.location.pathname.includes('proyecto');
        label.textContent = isCollapsed 
          ? (isSpanish ? 'Desplegar' : 'Expand') 
          : (isSpanish ? 'Plegar' : 'Collapse');
      }
    };

    header.addEventListener('click', toggle);
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle(e);
      }
    });
  });

  const expandAllBtn = document.getElementById('expandAllPhases');
  const collapseAllBtn = document.getElementById('collapseAllPhases');

  if (expandAllBtn) {
    expandAllBtn.addEventListener('click', () => {
      phaseCards.forEach(card => {
        card.classList.remove('collapsed');
        card.querySelector('.sp-phase-header')?.setAttribute('aria-expanded', 'true');
        const label = card.querySelector('.sp-phase-toggle-label');
        if (label) {
          const isSpanish = document.documentElement.lang === 'es' || window.location.pathname.includes('proyecto');
          label.textContent = isSpanish ? 'Plegar' : 'Collapse';
        }
      });
    });
  }

  if (collapseAllBtn) {
    collapseAllBtn.addEventListener('click', () => {
      phaseCards.forEach(card => {
        card.classList.add('collapsed');
        card.querySelector('.sp-phase-header')?.setAttribute('aria-expanded', 'false');
        const label = card.querySelector('.sp-phase-toggle-label');
        if (label) {
          const isSpanish = document.documentElement.lang === 'es' || window.location.pathname.includes('proyecto');
          label.textContent = isSpanish ? 'Desplegar' : 'Expand';
        }
      });
    });
  }
}

/* ==========================================================================
   CAROUSEL NAVIGATION FOR SPECIAL PROJECTS PHOTO GALLERIES ("carrusel")
   ========================================================================== */
function initSpCarousels() {
  const containers = document.querySelectorAll('.sp-carousel-wrapper, .sp-phase-card');
  containers.forEach(container => {
    const track = container.querySelector('.sp-carousel-track, .sp-desktop-photo-grid');
    const prevBtn = container.querySelector('.sp-carousel-arrow.prev');
    const nextBtn = container.querySelector('.sp-carousel-arrow.next');

    if (!track) return;

    const scrollCard = (direction) => {
      const card = track.querySelector('.subtheme-photo-thumb');
      const scrollAmount = card ? card.offsetWidth + 16 : 300;
      track.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    };

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        scrollCard(-1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        scrollCard(1);
      });
    }
  });
}

/* ==========================================================================
   FULLSCREEN LIGHTBOX MODAL
   ========================================================================== */
function initLightbox() {
  const lightbox = document.getElementById('lightboxModal');
  if (!lightbox) return;

  const lightboxImg = lightbox.querySelector('.lightbox-img');
  const lightboxCategory = lightbox.querySelector('.lightbox-category');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');

  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  let currentIndex = -1;

  const openLightbox = (index) => {
    if (index < 0 || index >= galleryItems.length) return;
    currentIndex = index;
    const item = galleryItems[currentIndex];
    const img = item.querySelector('img');
    if (!img) return;

    const title = item.querySelector('.gallery-title')?.textContent || '';
    const tag = item.querySelector('.gallery-tag')?.textContent || '';
    const caption = item.querySelector('.gallery-caption')?.textContent || '';

    lightboxImg.src = img.src;
    lightboxImg.alt = title;
    if (lightboxCategory) lightboxCategory.textContent = tag;
    if (lightboxCaption) lightboxCaption.textContent = title + (caption ? ' — ' + caption : '');

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  };

  const showNext = () => {
    if (currentIndex < galleryItems.length - 1) {
      openLightbox(currentIndex + 1);
    } else {
      openLightbox(0);
    }
  };

  const showPrev = () => {
    if (currentIndex > 0) {
      openLightbox(currentIndex - 1);
    } else {
      openLightbox(galleryItems.length - 1);
    }
  };

  galleryItems.forEach((item, idx) => {
    if (!item.classList.contains('video-thumb')) {
      item.addEventListener('click', () => openLightbox(idx));
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });
}

/* ==========================================================================
   PROJECT ESTIMATE CALCULATOR
   ========================================================================== */
function initCalculator() {
  const typeSelect = document.getElementById('calcType');
  const sizeInput = document.getElementById('calcSize');
  const sizeVal = document.getElementById('calcSizeVal');
  const tierSelect = document.getElementById('calcTier');
  const priceDisplay = document.getElementById('calcPrice');
  const timeDisplay = document.getElementById('calcTime');
  const applyBtn = document.getElementById('calcApplyBtn');

  if (!typeSelect || !sizeInput || !tierSelect || !priceDisplay) return;

  const baseRates = {
    kitchen: { base: 6800, perSqFt: 62, time: 'Custom Project Milestones (Permits, Custom Cabinetry & Slab Fabrication)' },
    bathroom: { base: 4500, perSqFt: 48, time: '5 – 8 weeks (Tear-Down, Waterproofing Cure & Tile Setting)' },
    wholehouse: { base: 18000, perSqFt: 42, time: '16 – 24 weeks (Comprehensive Multi-Trade Reconstruction)' },
    closet: { base: 2800, perSqFt: 34, time: '3 – 5 weeks (Millwork Fabrication & Architectural Install)' },
    outdoor: { base: 5500, perSqFt: 38, time: '6 – 10 weeks (Permits, Structural Framing & Masonry)' }
  };

  const tierMultipliers = {
    premium: 1.0,
    luxury: 1.25,
    ultra: 1.60
  };

  function updateEstimate() {
    const type = typeSelect.value || 'kitchen';
    const sqft = parseInt(sizeInput.value, 10) || 250;
    const tier = tierSelect.value || 'luxury';

    if (sizeVal) sizeVal.textContent = sqft + ' sq ft';

    const rate = baseRates[type] || baseRates.kitchen;
    const mult = tierMultipliers[tier] || 1.45;

    const estimated = (rate.base + (sqft * rate.perSqFt)) * mult;
    const minCost = Math.round((estimated * 0.9) / 500) * 500;
    const maxCost = Math.round((estimated * 1.15) / 500) * 500;

    const fmtMin = '$' + minCost.toLocaleString('en-US');
    const fmtMax = '$' + maxCost.toLocaleString('en-US');

    priceDisplay.textContent = `${fmtMin} - ${fmtMax}`;
    if (timeDisplay) {
      timeDisplay.textContent = `Estimated Execution Time: ${rate.time}`;
    }
  }

  typeSelect.addEventListener('change', updateEstimate);
  sizeInput.addEventListener('input', updateEstimate);
  tierSelect.addEventListener('change', updateEstimate);
  updateEstimate();

  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      const formService = document.getElementById('formService');
      const formMessage = document.getElementById('formMessage');

      if (formService) {
        formService.value = typeSelect.value;
      }
      if (formMessage) {
        formMessage.value = `[Calculated Estimate Summary]: Project Type: ${typeSelect.options[typeSelect.selectedIndex].text}, Scope Area: ${sizeInput.value} sq ft, Finish Tier: ${tierSelect.options[tierSelect.selectedIndex].text}, Estimated Range: ${priceDisplay.textContent}.\n\nAdditional project vision & custom requirements: `;
      }

      const formElem = document.getElementById('quoteSection') || document.querySelector('.form-card');
      if (formElem) {
        formElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (formMessage) formMessage.focus();
      }
    });
  }
}

/* ==========================================================================
   QUICK ESTIMATE WIZARD MODAL
   ========================================================================== */
function initQuoteWizardModal() {
  const wizardModal = document.getElementById('quoteWizardModal');
  const triggerBtns = document.querySelectorAll('.open-quote-wizard');
  const closeBtn = document.querySelector('.wizard-modal-close');

  if (!wizardModal) return;

  const openModal = () => {
    wizardModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    wizardModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  triggerBtns.forEach(btn => btn.addEventListener('click', openModal));
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  wizardModal.addEventListener('click', (e) => {
    if (e.target === wizardModal) closeModal();
  });
}

/* ==========================================================================
   QUOTE / CONTACT FORM HANDLER
   ========================================================================== */
function initFormHandler() {
  const form = document.getElementById('quoteForm');
  if (!form) return;

  const feedback = document.getElementById('formFeedback');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('[name="name"]')?.value.trim();
    const email = form.querySelector('[name="email"]')?.value.trim();
    const location = form.querySelector('[name="location"]')?.value.trim() || 'Arizona';
    const propertyType = form.querySelector('[name="propertyType"]')?.value || 'Single-Family Home';
    const propertyAge = form.querySelector('[name="propertyAge"]')?.value || 'Not specified';
    const budget = form.querySelector('[name="budget"]')?.value || 'Flexible / To be estimated';
    const financing = form.querySelector('[name="financing"]')?.value || 'Not specified';
    const occupancy = form.querySelector('[name="occupancy"]')?.value || 'Not specified';
    const hoa = form.querySelector('[name="hoa"]')?.value || 'Not specified';
    const plans = form.querySelector('[name="plans"]')?.value || 'Need Red Canyon to provide 3D design & permits';
    const timeline = form.querySelector('[name="timeline"]')?.value || 'Flexible';
    const message = form.querySelector('[name="message"]')?.value.trim();

    // Collect multiple checked scopes
    const checkedScopes = Array.from(form.querySelectorAll('input[name="scope"]:checked'))
      .map(cb => cb.value);
    const scopeSummary = checkedScopes.length ? checkedScopes.join(', ') : (form.querySelector('[name="service"]')?.value || 'Comprehensive Remodeling');

    if (!name || !email || !message) {
      if (feedback) {
        feedback.className = 'form-feedback error';
        feedback.innerHTML = '<strong>Attention:</strong> Please complete your Full Name, Email Address, and Project Details before submitting.';
        feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      return;
    }

    // Mandatory Policy Agreement Validation
    const policyCheckbox = form.querySelector('[name="policyAgreement"]');
    if (policyCheckbox && !policyCheckbox.checked) {
      if (feedback) {
        feedback.className = 'form-feedback error';
        const isSpanish = document.documentElement.lang === 'es' || window.location.pathname.includes('contacto');
        feedback.innerHTML = isSpanish
          ? '<strong>Acción Requerida:</strong> Debe leer y marcar la casilla de aceptación de las Políticas y Condiciones del Servicio antes de enviar.'
          : '<strong>Action Required:</strong> You must read and check the agreement box for our Policies & Service Conditions before proceeding.';
        feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      policyCheckbox.focus();
      return;
    }

    const quoteId = 'RC-' + Math.floor(1000 + Math.random() * 9000);
    const businessEmail = 'redcanyonred@gmail.com';
    const subject = encodeURIComponent(`[100% Fixed-Price Quote #${quoteId}] - ${name} - ${location}`);
    const body = encodeURIComponent(
      `Hello Red Canyon Remodeling LLC Team,\n\n` +
      `I would like to request an official in-home consultation and fixed-price remodeling proposal:\n\n` +
      `===================================================\n` +
      `PROJECT ESTIMATE FILE #${quoteId}\n` +
      `===================================================\n` +
      `• Homeowner Name: ${name}\n` +
      `• Primary Email: ${email}\n` +
      `• Arizona City / Neighborhood: ${location}\n` +
      `• Property Type: ${propertyType} (Approx Age: ${propertyAge})\n` +
      `• Selected Remodel Spaces: ${scopeSummary}\n` +
      `• Planned Investment Range: ${budget}\n` +
      `• Financing Method: ${financing}\n` +
      `• Residing in Home During Work: ${occupancy}\n` +
      `• HOA Review Required: ${hoa}\n` +
      `• Blueprints / City Permits: ${plans}\n` +
      `• Target Groundbreak Timeline: ${timeline}\n` +
      `• Service Policies & Conditions: Accepted & Agreed\n` +
      `===================================================\n\n` +
      `ARCHITECTURAL VISION & CUSTOM SPECIFICATIONS:\n` +
      `${message}\n\n` +
      `I understand Red Canyon provides 100% fixed-price certainty and a Comprehensive Craftsmanship Warranty.\n` +
      `Please contact me to schedule our on-site architectural evaluation.\n\n` +
      `Thank you,\n${name}`
    );

    const mailtoUrl = `mailto:${businessEmail}?subject=${subject}&body=${body}`;

    if (feedback) {
      feedback.className = 'form-feedback success';
      feedback.innerHTML = `
        <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
          <div style="color: #4ade80; font-size: 1.5rem; line-height: 1;">✓</div>
          <div>
            <strong style="font-size: 1.05rem;">Estimate File #${quoteId} Created!</strong><br>
            Thank you, ${name}. Your comprehensive project questionnaire has been structured for direct submission to <strong>${businessEmail}</strong>.<br><br>
            <a href="${mailtoUrl}" class="btn btn-primary btn-sm" style="display: inline-flex;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              Click Here to Open Email Client & Send
            </a>
          </div>
        </div>
      `;
      feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Attempt to launch client
    window.location.href = mailtoUrl;
  });
}

/* ==========================================================================
   FAQ ACCORDION
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      faqItems.forEach(other => {
        other.classList.remove('active');
        const otherAns = other.querySelector('.faq-answer');
        if (otherAns) otherAns.style.maxHeight = null;
      });

      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  if (faqItems[0]) {
    const firstAns = faqItems[0].querySelector('.faq-answer');
    faqItems[0].classList.add('active');
    if (firstAns) firstAns.style.maxHeight = firstAns.scrollHeight + 'px';
  }
}

/* ==========================================================================
   CURRENT YEAR
   ========================================================================== */
function setCurrentYear() {
  const yr = document.getElementById('currentYear');
  if (yr) {
    yr.textContent = new Date().getFullYear();
  }
}
