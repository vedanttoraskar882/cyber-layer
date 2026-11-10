const PUBLIC_CONTACT_EMAIL = 'cyberphysicallayeruk@outlook.com';

// Navbar scroll elevation
const navbar = document.getElementById('navbar');
if (navbar) {
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 16);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// Mobile navigation menu
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

if (menuToggle && navMenu) {
  const closeMenu = () => {
    navMenu.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (e) => {
    if (
      navMenu.classList.contains('active') &&
      !navMenu.contains(e.target) &&
      !menuToggle.contains(e.target)
    ) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
      closeMenu();
      menuToggle.focus();
    }
  });
}

// Smooth scroll & pricing tier pre-fill
const messageField = document.getElementById('contact-message');

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });

    const tier = anchor.getAttribute('data-tier');
    if (tier && messageField && !messageField.value.trim()) {
      messageField.value = `Enquiry regarding ${tier}.\n\nSite location & systems: `;
      updateDraftHref();
    }
  });
});

// Interactive 5-stage pipeline viewer (all 5 stage descriptions remain visible at all times)
const stages = [
  {
    badge: 'STAGE 01 · COLLECTION',
    title: '1 — Collection',
    desc: 'Reads standard interfaces from existing cameras, doors, connected machines and network equipment without sending video off site.',
    img: '/images/cyber1.png',
    alt: 'Stage 1: Collection across camera metadata, door access, machine logs and network records',
  },
  {
    badge: 'STAGE 02 · NORMALISATION',
    title: '2 — Normalisation',
    desc: 'Puts events from separate suppliers into one schema, corrects clock drift to one reference clock, and labels place, actor and domain.',
    img: '/images/stage2-normalisation.png',
    alt: 'Stage 2: Normalisation to one format and reference clock',
  },
  {
    badge: 'STAGE 03 · SUSPICION CHAINS',
    title: '3 — Suspicion chains',
    desc: 'Links related events by time, place and order across physical and digital systems so one sequence can be assessed as one incident.',
    img: '/images/stage3-suspicion-chains.png',
    alt: 'Stage 3: Suspicion chains linking events by time, place and order',
  },
  {
    badge: 'STAGE 04 · RECONSTRUCTION',
    title: '4 — Reconstruction',
    desc: 'Identifies the most probable sequence when evidence is missing, explicitly labels the inferred step, and states reduced confidence.',
    img: '/images/stage4-reconstruction.png',
    alt: 'Stage 4: Reconstruction of missing steps with stated confidence',
  },
  {
    badge: 'STAGE 05 · NARRATIVE & GUIDANCE',
    title: '5 — Narrative & guidance',
    desc: 'Delivers a plain-English operational account, names contributing and missing sources, and sets out the first physical and digital actions.',
    img: '/images/cyber3.png',
    alt: 'Stage 5: Plain-English narrative and mixed-incident response guidance',
  },
];

const stageSteps = Array.from(document.querySelectorAll('.pipeline-step[data-stage]'));
const viewerDots = Array.from(document.querySelectorAll('.viewer-dot[data-stage]'));
const viewerBadge = document.getElementById('viewerBadge');
const viewerImg = document.getElementById('viewerImg');
const viewerTitle = document.getElementById('viewerTitle');
const viewerDesc = document.getElementById('viewerDesc');

function selectStage(index) {
  const data = stages[index];
  if (!data) return;

  stageSteps.forEach((btn, idx) => {
    const active = idx === index;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', String(active));
  });

  viewerDots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === index);
  });

  if (viewerBadge) viewerBadge.textContent = data.badge;
  if (viewerTitle) viewerTitle.textContent = data.title;
  if (viewerDesc) viewerDesc.textContent = data.desc;

  if (viewerImg && viewerImg.getAttribute('src') !== data.img) {
    viewerImg.classList.add('switching');
    window.setTimeout(() => {
      viewerImg.setAttribute('src', data.img);
      viewerImg.setAttribute('alt', data.alt);
      viewerImg.classList.remove('switching');
    }, 110);
  }
}

[...stageSteps, ...viewerDots].forEach((trigger) => {
  trigger.addEventListener('click', () => {
    const idx = Number(trigger.getAttribute('data-stage'));
    if (!Number.isNaN(idx)) selectStage(idx);
  });
});

// Technology "Learn More" / "Show Less" toggles
document.querySelectorAll('.learn-btn[data-card]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const cardId = btn.getAttribute('data-card');
    const card = cardId ? document.getElementById(cardId) : null;
    if (!card) return;

    const isOpen = card.classList.toggle('open');
    btn.textContent = isOpen ? 'Show Less' : 'Learn More';
    btn.setAttribute('aria-expanded', String(isOpen));
  });
});

// FAQ accordion (native <button> supports Enter/Space automatically)
const faqButtons = Array.from(document.querySelectorAll('.faq-question'));
faqButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    if (!item) return;
    const wasOpen = item.classList.contains('open');

    document.querySelectorAll('.faq-item').forEach((other) => {
      other.classList.remove('open');
      const otherBtn = other.querySelector('.faq-question');
      if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
    });

    if (!wasOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

// Contact form validation, Web3Forms submission, and explicit "Open email draft" fallback
const contactForm = document.getElementById('contactForm');
const nameInput = document.getElementById('contact-name');
const emailInput = document.getElementById('contact-email');
const orgInput = document.getElementById('contact-org');
const roleSelect = document.getElementById('contact-role');
const submitBtn = document.getElementById('formSubmitBtn');
const draftBtn = document.getElementById('openEmailDraftBtn');
const formStatus = document.getElementById('formStatus');

function buildMailtoHref() {
  const name = nameInput?.value.trim() || '';
  const email = emailInput?.value.trim() || '';
  const org = orgInput?.value.trim() || '';
  const role = roleSelect?.value.trim() || '';
  const msg = messageField?.value.trim() || '';

  const subjectParts = ['CPSL Website Enquiry'];
  if (org) subjectParts.push(org);
  const subject = subjectParts.join(' — ');

  const lines = [
    `Full Name: ${name || '(not entered)'}`,
    `Email Address: ${email || '(not entered)'}`,
    `Organisation: ${org || '(not entered)'}`,
    `Role: ${role || '(not selected)'}`,
    '',
    'Message:',
    msg || '(please describe your site systems or enquiry)',
  ];

  return `mailto:${PUBLIC_CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
}

function updateDraftHref() {
  if (draftBtn) {
    draftBtn.setAttribute('href', buildMailtoHref());
  }
}

function showFormStatus(kind, text) {
  if (!formStatus) return;
  formStatus.hidden = false;
  formStatus.className = `form-status ${kind}`;
  formStatus.textContent = text;
}

if (contactForm) {
  [nameInput, emailInput, orgInput, roleSelect, messageField].forEach((el) => {
    if (!el) return;
    el.addEventListener('input', updateDraftHref);
    el.addEventListener('change', updateDraftHref);
  });
  updateDraftHref();

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    updateDraftHref();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      showFormStatus('error', 'Please complete your name, a valid email address, and your message before submitting.');
      return;
    }

    const endpoint = contactForm.getAttribute('action') || 'https://api.web3forms.com/submit';
    const formData = new FormData(contactForm);

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timer);

      let result = null;
      try {
        result = await res.json();
      } catch {
        result = null;
      }

      if (res.ok && result && result.success === true) {
        showFormStatus(
          'success',
          'Enquiry sent. Thank you for contacting Cyber-Physical Security Layer Ltd (CPSL).'
        );
        contactForm.reset();
        updateDraftHref();
      } else {
        showFormStatus(
          'error',
          `Your enquiry was not delivered automatically (${result?.message || 'service unavailable'}). Please click "Open email draft" to send it from your email app to ${PUBLIC_CONTACT_EMAIL}.`
        );
      }
    } catch {
      showFormStatus(
        'error',
        `Could not reach the form service. Nothing was sent — please click "Open email draft" to compose your message directly to ${PUBLIC_CONTACT_EMAIL}.`
      );
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="btn-label">Send Enquiry &rarr;</span>';
      }
    }
  });
}

// Purposeful one-time scroll reveals (respects prefers-reduced-motion; safe if JS fails)
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = Array.from(document.querySelectorAll('.reveal'));

if (!prefersReducedMotion && 'IntersectionObserver' in window && revealItems.length > 0) {
  document.documentElement.classList.add('has-motion');

  const revealVisibleAndPassed = () => {
    const thresholdY = window.innerHeight * 0.96;
    revealItems.forEach((el) => {
      if (el.classList.contains('is-visible')) return;
      const rect = el.getBoundingClientRect();
      if (rect.top <= thresholdY) {
        el.classList.add('is-visible');
      }
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting || entry.boundingClientRect.top <= window.innerHeight) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.01, rootMargin: '0px 0px 40px 0px' }
  );

  revealItems.forEach((el) => observer.observe(el));
  revealVisibleAndPassed();

  let rafPending = false;
  window.addEventListener(
    'scroll',
    () => {
      if (rafPending) return;
      rafPending = true;
      window.requestAnimationFrame(() => {
        revealVisibleAndPassed();
        rafPending = false;
      });
    },
    { passive: true }
  );
} else {
  revealItems.forEach((el) => el.classList.add('is-visible'));
}
