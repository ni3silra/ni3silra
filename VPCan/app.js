// Configure Tailwind CSS extension
if (typeof tailwind !== 'undefined') {
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          dbNavy: '#001838',
          dbBlue: '#00509d',
          dbCyan: '#00a3e0',
          dbLight: '#f8fafc'
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
          mono: ['JetBrains Mono', 'monospace'],
        }
      }
    }
  };
}

// Scrollspy functionality: updates active header tab as user scrolls down the page
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.tab-panel');
  const navLinks = document.querySelectorAll('.tab-btn');

  function updateActiveNav() {
    let currentSectionId = '';
    const scrollPosition = window.scrollY + 150;
    const isAtBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50;

    if (isAtBottom && sections.length > 0) {
      currentSectionId = sections[sections.length - 1].getAttribute('id');
    } else {
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          currentSectionId = section.getAttribute('id');
        }
      });
    }

    if (currentSectionId) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + currentSectionId) {
          link.classList.add('active');
        }
      });
    }
  }

  window.addEventListener('scroll', updateActiveNav);
  updateActiveNav();
});
