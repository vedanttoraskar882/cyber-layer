const PUBLIC_CONTACT_EMAIL = 'cyberphysicallayeruk@outlook.com';

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

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
      closeMenu();
      menuToggle.focus();
    }
  });
}

// Smooth scroll for internal anchor links & pricing tier enquiry pre-fill
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
        submitBtn.innerHTML = 'Send Enquiry &rarr;';
      }
    }
  });
}
