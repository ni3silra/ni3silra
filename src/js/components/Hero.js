/**
 * Hero Component
 * Animated code-style introduction with typewriter effects and syntax highlighting
 */

import { EventEmitter } from '../utils/EventEmitter.js';

export class Hero extends EventEmitter {
  constructor(app) {
    super();
    
    this.app = app;
    this.heroElement = null;
    this.typewriterElement = null;
    this.codeElement = null;
    this.particleContainer = null;
    
    // Animation state
    this.isAnimating = false;
    this.typewriterIndex = 0;
    this.currentLine = 0;
    this.animationFrame = null;
    
    // Code content for typewriter effect
    this.codeLines = [
      '// Welcome to my portfolio',
      'class BackendDeveloper {',
      '  constructor() {',
      '    this.name = "Your Name";',
      '    this.role = "Backend Developer";',
      '    this.skills = [',
      '      "Node.js", "Python", "Go",',
      '      "PostgreSQL", "MongoDB",',
      '      "Docker", "Kubernetes",',
      '      "AWS", "Microservices"',
      '    ];',
      '  }',
      '',
      '  buildAmazingThings() {',
      '    return "Let\'s create something great!";',
      '  }',
      '}'
    ];
    
    // Bind methods
    this.handleResize = this.handleResize.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
  }
  
  /**
   * Initialize the hero component
   */
  init() {
    this.createHeroContent();
    this.setupEventListeners();
    this.startAnimations();
    
    console.log('Hero component initialized');
  }
  
  /**
   * Create the hero HTML structure
   */
  createHeroContent() {
    const heroSection = document.getElementById('hero');
    if (!heroSection) {
      console.error('Hero section not found');
      return;
    }
    
    heroSection.innerHTML = `
      <div class="hero-container">
        <div class="hero-background" aria-hidden="true">
          <div class="particle-container" id="particles" aria-hidden="true"></div>
          <div class="code-rain" aria-hidden="true"></div>
        </div>
        
        <div class="hero-content">
          <div class="hero-intro">
            <div class="hero-greeting">
              <span class="greeting-text">Hello, I'm</span>
              <h1 class="hero-name">
                <span class="name-highlight">Backend Developer</span>
              </h1>
            </div>
            
            <div class="hero-description">
              <p class="description-text">
                I craft robust, scalable backend systems and APIs that power modern applications.
                Passionate about clean code, system architecture, and solving complex problems.
              </p>
            </div>
            
            <div class="hero-code-demo" role="img" aria-labelledby="code-demo-title" aria-describedby="code-demo-desc">
              <h3 id="code-demo-title" class="sr-only">Code demonstration</h3>
              <p id="code-demo-desc" class="sr-only">Interactive code example showing a BackendDeveloper class with skills and methods, demonstrating programming expertise</p>
              <div class="code-window">
                <div class="code-window-header" aria-hidden="true">
                  <div class="window-controls">
                    <span class="control close" aria-hidden="true"></span>
                    <span class="control minimize" aria-hidden="true"></span>
                    <span class="control maximize" aria-hidden="true"></span>
                  </div>
                  <div class="window-title">portfolio.js</div>
                </div>
                <div class="code-content">
                  <pre class="code-block" aria-live="polite" aria-label="Live coding demonstration"><code id="typewriter-code" class="language-javascript"></code></pre>
                  <div class="cursor" id="typing-cursor" aria-hidden="true">|</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="hero-cta">
            <nav class="cta-buttons" aria-label="Main call-to-action buttons">
              <a href="#projects" 
                 class="btn btn-primary hero-btn"
                 aria-describedby="cta-projects-desc">
                <span class="btn-text">View My Work</span>
                <span class="btn-icon" aria-hidden="true">→</span>
                <span id="cta-projects-desc" class="sr-only">Navigate to projects section to see my portfolio of backend systems and applications</span>
              </a>
              <a href="#contact" 
                 class="btn btn-secondary hero-btn"
                 aria-describedby="cta-contact-desc">
                <span class="btn-text">Get In Touch</span>
                <span class="btn-icon" aria-hidden="true">✉</span>
                <span id="cta-contact-desc" class="sr-only">Navigate to contact section to discuss opportunities and collaboration</span>
              </a>
            </nav>
            
            <div class="hero-stats" role="region" aria-labelledby="stats-heading">
              <h3 id="stats-heading" class="sr-only">Professional statistics and achievements</h3>
              <div class="stat-item" role="img" aria-labelledby="stat-projects">
                <span class="stat-number" data-target="50" aria-hidden="true">0</span>
                <span id="stat-projects" class="stat-label">50+ Projects Built</span>
              </div>
              <div class="stat-item" role="img" aria-labelledby="stat-experience">
                <span class="stat-number" data-target="5" aria-hidden="true">0</span>
                <span id="stat-experience" class="stat-label">5+ Years Experience</span>
              </div>
              <div class="stat-item" role="img" aria-labelledby="stat-apis">
                <span class="stat-number" data-target="100" aria-hidden="true">0</span>
                <span id="stat-apis" class="stat-label">100+ APIs Created</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Cache DOM elements
    this.heroElement = heroSection;
    this.typewriterElement = document.getElementById('typewriter-code');
    this.cursorElement = document.getElementById('typing-cursor');
    this.particleContainer = document.getElementById('particles');
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Listen to app events
    this.app.on('viewport:resize', this.handleResize);
    this.app.on('viewport:scroll', this.handleScroll);
    this.app.on('section:active', this.handleSectionActive.bind(this));
    
    // CTA button interactions
    const ctaButtons = this.heroElement.querySelectorAll('.hero-btn');
    ctaButtons.forEach(button => {
      button.addEventListener('click', this.handleCTAClick.bind(this));
      button.addEventListener('mouseenter', this.handleCTAHover.bind(this));
    });
  }
  
  /**
   * Start hero animations
   */
  startAnimations() {
    // Check for reduced motion preference
    const reducedMotion = this.app.state.getState().animations.reducedMotion;
    
    if (!reducedMotion) {
      // Start typewriter effect
      setTimeout(() => this.startTypewriter(), 1000);
      
      // Start particle animation
      setTimeout(() => this.createParticles(), 500);
      
      // Start stats counter animation
      setTimeout(() => this.animateStats(), 2000);
    } else {
      // Show final state immediately for reduced motion
      this.showFinalState();
    }
    
    // Add entrance animations
    this.animateEntrance();
  }
  
  /**
   * Typewriter effect for code demonstration
   */
  startTypewriter() {
    if (!this.typewriterElement || this.isAnimating) return;
    
    this.isAnimating = true;
    this.typewriterIndex = 0;
    this.currentLine = 0;
    
    this.typeNextCharacter();
  }
  
  /**
   * Type the next character in the typewriter effect
   */
  typeNextCharacter() {
    if (this.currentLine >= this.codeLines.length) {
      this.completeTypewriter();
      return;
    }
    
    const currentLineText = this.codeLines[this.currentLine];
    
    if (this.typewriterIndex <= currentLineText.length) {
      const currentText = this.buildCurrentText();
      this.typewriterElement.innerHTML = this.highlightSyntax(currentText);
      
      // Move cursor
      this.updateCursor();
      
      this.typewriterIndex++;
      
      // Typing speed with some randomness for natural feel
      const baseSpeed = 50;
      const randomDelay = Math.random() * 30;
      const delay = currentLineText[this.typewriterIndex - 1] === ' ' ? baseSpeed / 2 : baseSpeed + randomDelay;
      
      setTimeout(() => this.typeNextCharacter(), delay);
    } else {
      // Move to next line
      this.currentLine++;
      this.typewriterIndex = 0;
      
      // Pause at end of line
      setTimeout(() => this.typeNextCharacter(), 200);
    }
  }
  
  /**
   * Build current text for typewriter
   */
  buildCurrentText() {
    let text = '';
    
    for (let i = 0; i <= this.currentLine; i++) {
      if (i < this.currentLine) {
        text += this.codeLines[i] + '\n';
      } else {
        text += this.codeLines[i].substring(0, this.typewriterIndex);
      }
    }
    
    return text;
  }
  
  /**
   * Update cursor position
   */
  updateCursor() {
    if (!this.cursorElement) return;
    
    // Calculate cursor position based on current text
    const lines = this.buildCurrentText().split('\n');
    const currentLineLength = lines[lines.length - 1]?.length || 0;
    
    // Simple positioning - in a real implementation you'd calculate exact position
    this.cursorElement.style.opacity = '1';
  }
  
  /**
   * Complete typewriter animation
   */
  completeTypewriter() {
    this.isAnimating = false;
    
    // Hide cursor after completion
    setTimeout(() => {
      if (this.cursorElement) {
        this.cursorElement.style.opacity = '0';
      }
    }, 1000);
    
    this.emit('hero:typewriter-complete');
  }
  
  /**
   * Simple syntax highlighting
   */
  highlightSyntax(code) {
    return code
      .replace(/(\/\/.*$)/gm, '<span class="code-comment">$1</span>')
      .replace(/\b(class|constructor|return|this)\b/g, '<span class="code-keyword">$1</span>')
      .replace(/\b(buildAmazingThings|name|role|skills)\b/g, '<span class="code-function">$1</span>')
      .replace(/"([^"]*)"/g, '<span class="code-string">"$1"</span>')
      .replace(/\b(\d+)\b/g, '<span class="code-number">$1</span>');
  }
  
  /**
   * Create floating particles background
   */
  createParticles() {
    if (!this.particleContainer) return;
    
    const particleCount = this.app.state.getState().viewport.isMobile ? 20 : 50;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // Random positioning and animation
      const size = Math.random() * 4 + 2;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const duration = Math.random() * 20 + 10;
      const delay = Math.random() * 5;
      
      particle.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${x}%;
        top: ${y}%;
        animation: float ${duration}s ${delay}s infinite linear;
        opacity: ${Math.random() * 0.5 + 0.1};
      `;
      
      this.particleContainer.appendChild(particle);
    }
  }
  
  /**
   * Animate statistics counters
   */
  animateStats() {
    const statNumbers = this.heroElement.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
      const target = parseInt(stat.getAttribute('data-target'));
      const duration = 2000;
      const startTime = performance.now();
      
      const animateNumber = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(target * easeOutQuart);
        
        stat.textContent = current;
        
        if (progress < 1) {
          requestAnimationFrame(animateNumber);
        } else {
          stat.textContent = target;
        }
      };
      
      requestAnimationFrame(animateNumber);
    });
  }
  
  /**
   * Show final state for reduced motion
   */
  showFinalState() {
    if (this.typewriterElement) {
      const fullCode = this.codeLines.join('\n');
      this.typewriterElement.innerHTML = this.highlightSyntax(fullCode);
    }
    
    if (this.cursorElement) {
      this.cursorElement.style.opacity = '0';
    }
    
    // Show final stats
    const statNumbers = this.heroElement.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
      const target = stat.getAttribute('data-target');
      stat.textContent = target;
    });
  }
  
  /**
   * Animate entrance of hero elements
   */
  animateEntrance() {
    const elements = [
      '.hero-greeting',
      '.hero-description',
      '.hero-code-demo',
      '.hero-cta'
    ];
    
    elements.forEach((selector, index) => {
      const element = this.heroElement.querySelector(selector);
      if (element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
          element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }, index * 200);
      }
    });
  }
  
  /**
   * Handle CTA button clicks
   */
  handleCTAClick(event) {
    const button = event.currentTarget;
    const href = button.getAttribute('href');
    
    if (href && href.startsWith('#')) {
      event.preventDefault();
      const targetSection = href.substring(1);
      
      // Use navigation component to scroll
      if (this.app.navigation) {
        this.app.navigation.scrollToSection(targetSection);
      }
    }
    
    this.emit('hero:cta-click', { button, href });
  }
  
  /**
   * Handle CTA button hover
   */
  handleCTAHover(event) {
    const button = event.currentTarget;
    const icon = button.querySelector('.btn-icon');
    
    if (icon) {
      icon.style.transform = 'translateX(5px)';
    }
    
    button.addEventListener('mouseleave', () => {
      if (icon) {
        icon.style.transform = 'translateX(0)';
      }
    }, { once: true });
  }
  
  /**
   * Handle section active changes
   */
  handleSectionActive(sectionId) {
    if (sectionId === 'hero' && !this.isAnimating) {
      // Restart animations when hero comes into view
      this.startAnimations();
    }
  }
  
  /**
   * Handle viewport resize
   */
  handleResize(viewport) {
    // Recreate particles for mobile/desktop
    if (this.particleContainer) {
      this.particleContainer.innerHTML = '';
      setTimeout(() => this.createParticles(), 100);
    }
  }
  
  /**
   * Handle scroll events
   */
  handleScroll(scrollY) {
    // Parallax effect for hero background
    if (this.heroElement && scrollY < window.innerHeight) {
      const parallaxSpeed = 0.5;
      const yPos = scrollY * parallaxSpeed;
      
      const background = this.heroElement.querySelector('.hero-background');
      if (background) {
        background.style.transform = `translateY(${yPos}px)`;
      }
    }
  }
  
  /**
   * Destroy the hero component
   */
  destroy() {
    // Clear animation frame
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    // Remove event listeners
    this.app.off('viewport:resize', this.handleResize);
    this.app.off('viewport:scroll', this.handleScroll);
    
    // Clear particles
    if (this.particleContainer) {
      this.particleContainer.innerHTML = '';
    }
    
    this.emit('hero:destroyed');
  }
}