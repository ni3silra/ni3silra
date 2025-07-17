/**
 * Theme Manager Utility
 * Handles theme switching and CSS custom properties
 */

import { EventEmitter } from './EventEmitter.js';

export class ThemeManager extends EventEmitter {
  constructor() {
    super();
    this.currentTheme = 'light';
    this.themes = new Map();
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Bind methods
    this.handleMediaChange = this.handleMediaChange.bind(this);
  }
  
  /**
   * Initialize theme manager
   */
  init() {
    // Set up default themes
    this.setupDefaultThemes();
    
    // Load saved theme or detect system preference
    this.loadTheme();
    
    // Create theme toggle button
    this.createThemeToggle();
    
    // Listen for system theme changes
    this.mediaQuery.addEventListener('change', this.handleMediaChange);
    
    this.emit('theme:initialized', this.currentTheme);
  }
  
  /**
   * Set up default light and dark themes
   */
  setupDefaultThemes() {
    // Light theme is defined in CSS as default
    this.themes.set('light', {
      name: 'Light',
      properties: {} // Uses CSS defaults
    });
    
    // Dark theme properties are defined in CSS under [data-theme="dark"]
    this.themes.set('dark', {
      name: 'Dark',
      properties: {} // Uses CSS [data-theme="dark"] selector
    });
  }
  
  /**
   * Load theme from storage or system preference
   */
  loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme && this.themes.has(savedTheme)) {
      this.setTheme(savedTheme);
    } else {
      // Use system preference
      const systemTheme = this.mediaQuery.matches ? 'dark' : 'light';
      this.setTheme(systemTheme);
    }
  }
  
  /**
   * Set active theme with smooth transition
   * @param {string} themeName - Theme name
   */
  setTheme(themeName) {
    if (!this.themes.has(themeName)) {
      console.warn(`Theme "${themeName}" not found`);
      return;
    }
    
    const previousTheme = this.currentTheme;
    this.currentTheme = themeName;
    
    // Add transition class for smooth animation
    document.documentElement.classList.add('theme-transitioning');
    
    // Update document attribute
    document.documentElement.setAttribute('data-theme', themeName);
    
    // Remove transition class after animation completes
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 300);
    
    // Save to localStorage
    localStorage.setItem('theme', themeName);
    
    // Emit theme change event
    this.emit('theme:change', {
      current: themeName,
      previous: previousTheme
    });
  }
  
  /**
   * Create theme toggle button
   */
  createThemeToggle() {
    // Check if toggle already exists
    if (document.querySelector('.theme-toggle')) {
      return;
    }
    
    const toggle = document.createElement('button');
    toggle.className = 'theme-toggle';
    toggle.setAttribute('aria-label', 'Toggle theme');
    toggle.setAttribute('data-theme', this.currentTheme);
    
    // Create SVG icons
    const lightIcon = this.createSVGIcon('sun', 'theme-icon-light');
    const darkIcon = this.createSVGIcon('moon', 'theme-icon-dark');
    
    toggle.appendChild(lightIcon);
    toggle.appendChild(darkIcon);
    
    // Add click handler
    toggle.addEventListener('click', () => {
      toggle.classList.add('theme-switching');
      this.toggleTheme();
      
      // Update toggle button theme attribute
      setTimeout(() => {
        toggle.setAttribute('data-theme', this.currentTheme);
        toggle.classList.remove('theme-switching');
      }, 150);
    });
    
    // Add keyboard support
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle.click();
      }
    });
    
    // Append to body
    document.body.appendChild(toggle);
    
    // Listen for theme changes to update button
    this.on('theme:change', (data) => {
      toggle.setAttribute('data-theme', data.current);
    });
  }
  
  /**
   * Create SVG icon element
   * @param {string} type - Icon type ('sun' or 'moon')
   * @param {string} className - CSS class name
   * @returns {SVGElement} SVG element
   */
  createSVGIcon(type, className) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', `theme-toggle-icon ${className}`);
    svg.setAttribute('fill', 'none');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    
    if (type === 'sun') {
      svg.innerHTML = `
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      `;
    } else if (type === 'moon') {
      svg.innerHTML = `
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      `;
    }
    
    return svg;
  }
  
  /**
   * Toggle between light and dark themes
   */
  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
  
  /**
   * Get current theme
   * @returns {string} Current theme name
   */
  getCurrentTheme() {
    return this.currentTheme;
  }
  
  /**
   * Get available themes
   * @returns {Array} Array of theme names
   */
  getAvailableThemes() {
    return Array.from(this.themes.keys());
  }
  
  /**
   * Register a custom theme
   * @param {string} name - Theme name
   * @param {Object} theme - Theme configuration
   */
  registerTheme(name, theme) {
    this.themes.set(name, theme);
    this.emit('theme:registered', name);
  }
  
  /**
   * Handle system theme preference changes
   * @param {MediaQueryListEvent} event - Media query event
   */
  handleMediaChange(event) {
    // Only auto-switch if user hasn't manually set a theme
    const savedTheme = localStorage.getItem('theme');
    
    if (!savedTheme) {
      const systemTheme = event.matches ? 'dark' : 'light';
      this.setTheme(systemTheme);
    }
  }
  
  /**
   * Get CSS custom property value
   * @param {string} property - CSS property name (without --)
   * @returns {string} Property value
   */
  getCSSProperty(property) {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(`--${property}`)
      .trim();
  }
  
  /**
   * Set CSS custom property
   * @param {string} property - CSS property name (without --)
   * @param {string} value - Property value
   */
  setCSSProperty(property, value) {
    document.documentElement.style.setProperty(`--${property}`, value);
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    this.mediaQuery.removeEventListener('change', this.handleMediaChange);
    this.removeAllListeners();
  }
}