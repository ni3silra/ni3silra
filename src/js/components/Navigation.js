/**
 * Navigation Component
 * Handles smooth scrolling navigation and active section tracking
 */

import { EventEmitter } from '../utils/EventEmitter.js';

export class Navigation extends EventEmitter {
  constructor(app) {
    super();
    
    this.app = app;
    this.navElement = null;
    this.navLinks = [];
    this.sections = [];
    this.isScrolling = false;
    this.scrollTimeout = null;
    
    // Bind methods
    this.handleNavClick = this.handleNavClick.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.updateActiveLink = this.updateActiveLink.bind(this);
  }
  
  /**
   * Initialize the navigation component
   */
  init() {
    this.createNavigation();
    this.setupEventListeners();
    this.findSections();
    this.updateActiveLink();
    
    console.log('Navigation component initialized');
  }
  
  /**
   * Create the navigation HTML structure
   */
  createNavigation() {
    const navHTML = `
      <nav class="main-nav" role="navigation" aria-label="Main site navigation">
        <div class="nav-container">
          <div class="nav-brand">
            <a href="#hero" class="brand-link" aria-label="Backend Developer Portfolio - Go to homepage">
              <span class="brand-text">Portfolio</span>
            </a>
          </div>
          
          <button class="nav-toggle" 
                  aria-label="Toggle navigation menu" 
                  aria-expanded="false"
                  aria-controls="nav-menu"
                  aria-haspopup="true">
            <span class="nav-toggle-line" aria-hidden="true"></span>
            <span class="nav-toggle-line" aria-hidden="true"></span>
            <span class="nav-toggle-line" aria-hidden="true"></span>
            <span class="sr-only">Menu</span>
          </button>
          
          <ul id="nav-menu" class="nav-menu" role="menubar" aria-label="Main navigation menu">
            <li class="nav-item" role="none">
              <a href="#hero" 
                 class="nav-link" 
                 role="menuitem" 
                 data-section="hero"
                 aria-describedby="nav-home-desc">
                <span class="nav-text">Home</span>
                <span id="nav-home-desc" class="sr-only">Go to homepage and introduction</span>
              </a>
            </li>
            <li class="nav-item" role="none">
              <a href="#experience" 
                 class="nav-link" 
                 role="menuitem" 
                 data-section="experience"
                 aria-describedby="nav-about-desc">
                <span class="nav-text">About</span>
                <span id="nav-about-desc" class="sr-only">Learn about my professional experience and background</span>
              </a>
            </li>
            <li class="nav-item" role="none">
              <a href="#skills" 
                 class="nav-link" 
                 role="menuitem" 
                 data-section="skills"
                 aria-describedby="nav-skills-desc">
                <span class="nav-text">Skills</span>
                <span id="nav-skills-desc" class="sr-only">View my technical skills and expertise</span>
              </a>
            </li>
            <li class="nav-item" role="none">
              <a href="#projects" 
                 class="nav-link" 
                 role="menuitem" 
                 data-section="projects"
                 aria-describedby="nav-projects-desc">
                <span class="nav-text">Projects</span>
                <span id="nav-projects-desc" class="sr-only">Explore my featured projects and work samples</span>
              </a>
            </li>
            <li class="nav-item" role="none">
              <a href="#contact" 
                 class="nav-link" 
                 role="menuitem" 
                 data-section="contact"
                 aria-describedby="nav-contact-desc">
                <span class="nav-text">Contact</span>
                <span id="nav-contact-desc" class="sr-only">Get in touch for opportunities and collaboration</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>
    `;
    
    // Insert navigation at the beginning of the app
    const appElement = document.getElementById('app');
    const loadingScreen = appElement.querySelector('.loading-screen');
    
    if (loadingScreen) {
      loadingScreen.insertAdjacentHTML('beforebegin', navHTML);
    } else {
      appElement.insertAdjacentHTML('afterbegin', navHTML);
    }
    
    // Cache DOM elements
    this.navElement = document.querySelector('.main-nav');
    this.navLinks = Array.from(document.querySelectorAll('.nav-link'));
    this.navToggle = document.querySelector('.nav-toggle');
    this.navMenu = document.querySelector('.nav-menu');
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Navigation link clicks
    this.navLinks.forEach(link => {
      link.addEventListener('click', this.handleNavClick);
      link.addEventListener('keydown', this.handleKeydown);
    });
    
    // Mobile menu toggle
    if (this.navToggle) {
      this.navToggle.addEventListener('click', this.toggleMobileMenu.bind(this));
      this.navToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleMobileMenu();
        }
      });
    }
    
    // Listen to app events
    this.app.on('section:active', this.updateActiveLink);
    this.app.on('viewport:resize', this.handleResize.bind(this));
    
    // Close mobile menu on outside click
    document.addEventListener('click', this.handleOutsideClick.bind(this));
    
    // Handle escape key for mobile menu
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.app.state.getState().isMenuOpen) {
        this.closeMobileMenu();
      }
    });
  }
  
  /**
   * Find all sections that can be navigated to
   */
  findSections() {
    this.sections = this.navLinks.map(link => {
      const sectionId = link.getAttribute('data-section');
      return {
        id: sectionId,
        element: document.getElementById(sectionId),
        link: link
      };
    }).filter(section => section.element);
  }
  
  /**
   * Handle navigation link clicks
   */
  handleNavClick(event) {
    event.preventDefault();
    
    const link = event.currentTarget;
    const sectionId = link.getAttribute('data-section');
    
    this.scrollToSection(sectionId);
    this.closeMobileMenu();
    
    // Update focus for accessibility
    link.blur();
    
    this.emit('navigation:click', sectionId);
  }
  
  /**
   * Handle keyboard navigation
   */
  handleKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleNavClick(event);
    }
  }
  
  /**
   * Scroll to a specific section with smooth animation
   */
  scrollToSection(sectionId) {
    const targetSection = document.getElementById(sectionId);
    
    if (!targetSection) {
      console.warn(`Section with id "${sectionId}" not found`);
      return;
    }
    
    // Calculate target position
    const navHeight = this.navElement.offsetHeight;
    const targetPosition = targetSection.offsetTop - navHeight - 20; // 20px offset
    
    // Check for reduced motion preference
    const reducedMotion = this.app.state.getState().animations.reducedMotion;
    
    if (reducedMotion) {
      // Instant scroll for reduced motion
      window.scrollTo(0, targetPosition);
      this.app.state.setState({ activeSection: sectionId });
    } else {
      // Smooth scroll animation
      this.smoothScrollTo(targetPosition, sectionId);
    }
    
    this.emit('navigation:scroll', sectionId);
  }
  
  /**
   * Smooth scroll implementation
   */
  smoothScrollTo(targetPosition, sectionId) {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = Math.min(Math.abs(distance) / 2, 800); // Max 800ms
    let startTime = null;
    
    this.isScrolling = true;
    
    const animateScroll = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      
      // Easing function (ease-out-cubic)
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      
      const currentPosition = startPosition + (distance * easeOutCubic);
      window.scrollTo(0, currentPosition);
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        this.isScrolling = false;
        this.app.state.setState({ activeSection: sectionId });
        this.emit('navigation:scroll-complete', sectionId);
      }
    };
    
    requestAnimationFrame(animateScroll);
  }
  
  /**
   * Update active navigation link based on current section
   */
  updateActiveLink(activeSectionId) {
    if (this.isScrolling) return; // Don't update during programmatic scrolling
    
    const currentSection = activeSectionId || this.app.state.getState().activeSection;
    
    // Remove active class from all links
    this.navLinks.forEach(link => {
      link.classList.remove('active');
      link.setAttribute('aria-current', 'false');
    });
    
    // Add active class to current section link
    const activeLink = this.navLinks.find(link => 
      link.getAttribute('data-section') === currentSection
    );
    
    if (activeLink) {
      activeLink.classList.add('active');
      activeLink.setAttribute('aria-current', 'page');
    }
  }
  
  /**
   * Toggle mobile menu
   */
  toggleMobileMenu() {
    const isOpen = this.app.state.getState().isMenuOpen;
    
    if (isOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }
  
  /**
   * Open mobile menu
   */
  openMobileMenu() {
    this.app.state.setState({ isMenuOpen: true });
    
    this.navElement.classList.add('nav-open');
    this.navToggle.setAttribute('aria-expanded', 'true');
    this.navMenu.setAttribute('aria-hidden', 'false');
    
    // Focus first menu item
    const firstLink = this.navLinks[0];
    if (firstLink) {
      setTimeout(() => firstLink.focus(), 100);
    }
    
    this.emit('navigation:menu-open');
  }
  
  /**
   * Close mobile menu
   */
  closeMobileMenu() {
    this.app.state.setState({ isMenuOpen: false });
    
    this.navElement.classList.remove('nav-open');
    this.navToggle.setAttribute('aria-expanded', 'false');
    this.navMenu.setAttribute('aria-hidden', 'true');
    
    this.emit('navigation:menu-close');
  }
  
  /**
   * Handle clicks outside mobile menu
   */
  handleOutsideClick(event) {
    if (!this.app.state.getState().isMenuOpen) return;
    
    if (!this.navElement.contains(event.target)) {
      this.closeMobileMenu();
    }
  }
  
  /**
   * Handle viewport resize
   */
  handleResize(viewport) {
    // Close mobile menu on desktop
    if (!viewport.isMobile && this.app.state.getState().isMenuOpen) {
      this.closeMobileMenu();
    }
    
    // Update sections positions after resize
    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.findSections();
    }, 150);
  }
  
  /**
   * Get navigation height (useful for other components)
   */
  getNavHeight() {
    return this.navElement ? this.navElement.offsetHeight : 0;
  }
  
  /**
   * Destroy the navigation component
   */
  destroy() {
    // Remove event listeners
    this.navLinks.forEach(link => {
      link.removeEventListener('click', this.handleNavClick);
      link.removeEventListener('keydown', this.handleKeydown);
    });
    
    if (this.navToggle) {
      this.navToggle.removeEventListener('click', this.toggleMobileMenu);
    }
    
    document.removeEventListener('click', this.handleOutsideClick);
    
    // Remove app event listeners
    this.app.off('section:active', this.updateActiveLink);
    this.app.off('viewport:resize', this.handleResize);
    
    // Clear timeouts
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    
    // Remove DOM element
    if (this.navElement) {
      this.navElement.remove();
    }
    
    this.emit('navigation:destroyed');
  }
}