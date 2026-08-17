// Executive Portfolio – Scroll Animation Controller

document.addEventListener('DOMContentLoaded', () => {

  // ── Intersection Observer for Scroll-Triggered Fade-In Animations ──
  const fadeElements = document.querySelectorAll('.fade-in-up');

  const observerOptions = {
    threshold: 0.05,
    rootMargin: '0px 0px -10px 0px'
  };

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Once visible, stop observing to avoid re-triggering
        fadeObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  fadeElements.forEach(el => {
    fadeObserver.observe(el);
  });

  // ── Smooth Scroll for Anchor Links ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // ── Keyboard Navigation Between Sections ──
  const sections = document.querySelectorAll('.opportunity-section');
  let isScrolling = false;

  document.addEventListener('keydown', (e) => {
    if (isScrolling) return;

    const currentSection = getCurrentSection();
    const currentIndex = Array.from(sections).indexOf(currentSection);

    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      if (currentIndex < sections.length - 1) {
        isScrolling = true;
        sections[currentIndex + 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => { isScrolling = false; }, 800);
      }
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      if (currentIndex > 0) {
        isScrolling = true;
        sections[currentIndex - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => { isScrolling = false; }, 800);
      }
    }
  });

  function getCurrentSection() {
    let current = sections[0];
    const scrollPos = window.scrollY + window.innerHeight / 3;
    sections.forEach(section => {
      if (section.offsetTop <= scrollPos) {
        current = section;
      }
    });
    return current;
  }

});
