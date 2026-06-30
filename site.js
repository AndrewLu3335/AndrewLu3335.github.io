const navToggle = document.querySelector('[data-nav-toggle]');
const siteNav = document.querySelector('[data-site-nav]');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  siteNav.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      siteNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

const imageDialog = document.querySelector('[data-image-dialog]');
const dialogImage = imageDialog?.querySelector('img');
const dialogClose = imageDialog?.querySelector('[data-dialog-close]');

if (imageDialog && dialogImage && dialogClose) {
  document.querySelectorAll('[data-enlarge]').forEach((button) => {
    button.addEventListener('click', () => {
      const sourceImage = button.querySelector('img');
      if (!sourceImage) return;

      dialogImage.src = sourceImage.currentSrc || sourceImage.src;
      dialogImage.alt = sourceImage.alt;
      imageDialog.showModal();
      document.body.classList.add('dialog-open');
    });
  });

  const closeDialog = () => {
    imageDialog.close();
    dialogImage.removeAttribute('src');
    document.body.classList.remove('dialog-open');
  };

  dialogClose.addEventListener('click', closeDialog);
  imageDialog.addEventListener('click', (event) => {
    if (event.target === imageDialog) closeDialog();
  });
  imageDialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
  });
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduceMotion && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('reveal-ready');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );

  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
} else {
  document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
}
