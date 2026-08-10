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

// Scrollspy & Modal functionality
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

  // Mobile Hamburger Toggle logic
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const hamburgerIcon = document.getElementById('hamburger-icon');
  const mobileLinks = document.querySelectorAll('.mobile-tab-btn');

  if (mobileMenuBtn && mobileMenu && hamburgerIcon) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      if (mobileMenu.classList.contains('hidden')) {
        hamburgerIcon.classList.remove('fa-xmark');
        hamburgerIcon.classList.add('fa-bars');
      } else {
        hamburgerIcon.classList.remove('fa-bars');
        hamburgerIcon.classList.add('fa-xmark');
      }
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        hamburgerIcon.classList.remove('fa-xmark');
        hamburgerIcon.classList.add('fa-bars');
      });
    });
  }

  window.addEventListener('scroll', updateActiveNav);
  updateActiveNav();

  // Team Details Modal Data Dictionary
  const teamData = {
    'db-internet': {
      title: '<i class="fa-solid fa-globe text-dbCyan"></i> DB-Internet',
      badge: 'Primary Platform Ecosystem',
      functionality: 'Hub of core functionality like payments, bookings, Forex, limits, accounts, statements, and interest rates for digital banking customers.',
      platform: 'HP NonStop Mainframe',
      role: 'Technical Transformation Lead - Directing platform modernization, CI/CD automated release engineering, legacy HP NonStop decommissioning, and multi-team technical alignment.'
    },
    'kannon-proxy': {
      title: '<i class="fa-solid fa-network-wired text-indigo-400"></i> Kannon Proxy',
      badge: 'Sub-Component Layer',
      functionality: 'Low-cost gateway proxy system handling secure request routing, access control, and reducing expensive HP NonStop plugin licensing costs.',
      platform: 'Fabric 2.0',
      role: 'Lead Developer / Architect - Built and integrated low-cost proxy system saving significant team costs on HP NonStop plugins.'
    },
    'booking-api': {
      title: '<i class="fa-solid fa-code text-dbCyan"></i> Booking API',
      badge: 'Led Stream',
      functionality: 'Core transactional API engine handling booking transactions, account posting, and transaction authorization flows.',
      platform: 'Fabric 2.0 / REST microservices / Oracle ExaCC',
      role: 'Stream Lead - Managing core transactional API development, release governance, and high-availability operations.'
    },
    'booking-sep': {
      title: '<i class="fa-solid fa-book-bookmark text-emerald-400"></i> Booking SEP',
      badge: 'Global System Integration',
      functionality: 'Single Entry Point (SEP) for many products, where DB-Internet acts as one of the key Demand Deposit Accounts (DDA).',
      platform: 'Server Grid / Oracle / IBM MQ / SFTP',
      role: 'Migration SME & Team Member - Led database (DHS to ExaCC) and platform migration while ensuring uninterrupted business logic.'
    },
    'esa': {
      title: '<i class="fa-solid fa-vault text-amber-400"></i> ESA (Currency & Metals)',
      badge: 'Standalone FX Platform',
      functionality: 'Independent high-frequency trading platform specifically handling Foreign Exchange (FX), currency transactions, and precious metals trading across global markets.',
      platform: 'VHS / MongoDB / Cinovo Partner / Automation of Robots',
      role: 'Technical Lead'
    }
  };

  const modal = document.getElementById('team-modal');
  const modalContent = document.getElementById('team-modal-content');
  const modalTitle = document.getElementById('modal-title');
  const modalBadge = document.getElementById('modal-badge');
  const modalFunctionality = document.getElementById('modal-functionality');
  const modalPlatform = document.getElementById('modal-platform');
  const modalRole = document.getElementById('modal-role');
  const closeModalBtn = document.getElementById('close-modal-btn');

  function openModal(teamKey) {
    const data = teamData[teamKey];
    if (!data) return;

    modalTitle.innerHTML = data.title;
    modalBadge.textContent = data.badge;
    modalFunctionality.textContent = data.functionality;
    modalPlatform.textContent = data.platform;
    modalRole.textContent = data.role;

    modal.classList.remove('hidden');
    setTimeout(() => {
      modalContent.classList.remove('scale-95');
      modalContent.classList.add('scale-100');
    }, 10);
  }

  function closeModal() {
    modalContent.classList.remove('scale-100');
    modalContent.classList.add('scale-95');
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 200);
  }

  document.querySelectorAll('[data-team]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const teamKey = trigger.getAttribute('data-team');
      openModal(teamKey);
    });
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });

  // POWERPOINT SLIDE PRESENTATION MODE LOGIC
  const presentationModal = document.getElementById('presentation-modal');
  const startPresentationBtn = document.getElementById('start-presentation-btn');
  const mobileStartPresentationBtn = document.getElementById('mobile-start-presentation-btn');
  const closePresentationBtn = document.getElementById('close-presentation-btn');
  const toggleFullscreenBtn = document.getElementById('toggle-fullscreen-btn');
  const prevSlideBtn = document.getElementById('prev-slide-btn');
  const nextSlideBtn = document.getElementById('next-slide-btn');
  const slideCounter = document.getElementById('slide-counter');
  const slideDotsContainer = document.getElementById('slide-dots-container');
  const slides = document.querySelectorAll('.presentation-slide');

  let currentSlideIndex = 0;

  function initSlideDots() {
    if (!slideDotsContainer) return;
    slideDotsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.className = `slide-dot ${idx === currentSlideIndex ? 'active-dot' : ''}`;
      dot.setAttribute('title', `Go to Slide ${idx + 1}`);
      dot.addEventListener('click', () => showSlide(idx));
      slideDotsContainer.appendChild(dot);
    });
  }

  function showSlide(index) {
    if (!slides.length) return;
    if (index < 0) index = 0;
    if (index >= slides.length) index = slides.length - 1;

    currentSlideIndex = index;

    slides.forEach((slide, idx) => {
      if (idx === currentSlideIndex) {
        slide.classList.add('active-slide');
      } else {
        slide.classList.remove('active-slide');
      }
    });

    if (slideCounter) {
      slideCounter.textContent = `${currentSlideIndex + 1} / ${slides.length}`;
    }

    if (prevSlideBtn) {
      prevSlideBtn.disabled = currentSlideIndex === 0;
    }

    if (nextSlideBtn) {
      nextSlideBtn.disabled = currentSlideIndex === slides.length - 1;
    }

    initSlideDots();
  }

  function openPresentation() {
    if (!presentationModal) return;
    presentationModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    showSlide(0);

    // Request native browser fullscreen mode (F11 experience)
    if (presentationModal.requestFullscreen) {
      presentationModal.requestFullscreen().catch(err => console.log('Fullscreen note:', err));
    } else if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => console.log('Fullscreen note:', err));
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen();
    }
  }

  function closePresentation() {
    if (!presentationModal) return;
    presentationModal.classList.add('hidden');
    document.body.style.overflow = '';

    // Exit native browser fullscreen mode
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (presentationModal.requestFullscreen) {
        presentationModal.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  // Handle exiting fullscreen via ESC / F11 browser native keys
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && presentationModal && !presentationModal.classList.contains('hidden')) {
      closePresentation();
    }
  });

  if (startPresentationBtn) {
    startPresentationBtn.addEventListener('click', openPresentation);
  }

  if (mobileStartPresentationBtn) {
    mobileStartPresentationBtn.addEventListener('click', () => {
      if (mobileMenu) mobileMenu.classList.add('hidden');
      openPresentation();
    });
  }

  if (closePresentationBtn) {
    closePresentationBtn.addEventListener('click', closePresentation);
  }

  if (toggleFullscreenBtn) {
    toggleFullscreenBtn.addEventListener('click', toggleFullscreen);
  }

  if (prevSlideBtn) {
    prevSlideBtn.addEventListener('click', () => showSlide(currentSlideIndex - 1));
  }

  if (nextSlideBtn) {
    nextSlideBtn.addEventListener('click', () => showSlide(currentSlideIndex + 1));
  }

  // Keyboard navigation for presentation mode
  document.addEventListener('keydown', (e) => {
    if (!presentationModal || presentationModal.classList.contains('hidden')) return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      showSlide(currentSlideIndex + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      showSlide(currentSlideIndex - 1);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closePresentation();
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      toggleFullscreen();
    }
  });
});

