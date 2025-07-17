/**
 * Main Application Class
 * Coordinates all application components and manages global state
 */

import { EventEmitter } from '../utils/EventEmitter.js';
import { StateManager } from '../utils/StateManager.js';
import { ComponentRegistry } from '../utils/ComponentRegistry.js';
import { LazyLoader } from '../utils/LazyLoader.js';
import { PerformanceMonitor } from '../utils/PerformanceMonitor.js';
import { BundleOptimizer } from '../utils/BundleOptimizer.js';
import { AccessibilityManager } from '../utils/AccessibilityManager.js';
import { AnimationManager } from '../utils/AnimationManager.js';
import { MicroInteractions } from '../utils/MicroInteractions.js';
import { Navigation } from '../components/Navigation.js';
import { Hero } from '../components/Hero.js';
import { Skills } from '../components/Skills.js';
import { Projects } from '../components/Projects.js';
import { Experience } from '../components/Experience.js';
import { Contact } from '../components/Contact.js';

export class App extends EventEmitter {
  constructor() {
    super();
    
    this.state = new StateManager();
    this.components = new ComponentRegistry();
    this.isInitialized = false;
    
    // Bind methods
    this.handleResize = this.handleResize.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
  }
  
  /**
   * Initialize the application
   */
  async init() {
    if (this.isInitialized) {
      console.warn('App already initialized');
      return;
    }
    
    try {
      // Initialize global state
      this.initializeState();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Initialize performance monitoring
      this.initializePerformanceMonitor();
      
      // Initialize lazy loading system
      this.initializeLazyLoader();
      
      // Initialize bundle optimizer
      this.initializeBundleOptimizer();
      
      // Initialize accessibility manager
      this.initializeAccessibilityManager();
      
      // Initialize animation manager
      this.initializeAnimationManager();
      
      // Initialize micro-interactions
      this.initializeMicroInteractions();
      
      // Initialize components (will be expanded in later tasks)
      await this.initializeComponents();
      
      // Set up intersection observers for animations
      this.setupIntersectionObservers();
      
      // Complete performance monitoring
      this.performanceMonitor.endTiming('app_init');
      
      // Log performance metrics in development
      if (process.env.NODE_ENV !== 'production') {
        setTimeout(() => {
          this.performanceMonitor.logMetrics();
        }, 1000);
      }
      
      this.isInitialized = true;
      this.emit('app:initialized');
      
    } catch (error) {
      console.error('Failed to initialize app:', error);
      throw error;
    }
  }
  
  /**
   * Initialize global application state with validators and computed properties
   */
  initializeState() {
    // Set up state validators
    this.setupStateValidators();
    
    // Set up computed properties
    this.setupComputedProperties();
    
    // Set up persistent keys
    this.setupPersistentState();
    
    // Set up state middleware
    this.setupStateMiddleware();
    
    const initialState = {
      // UI State
      activeSection: 'hero',
      isMenuOpen: false,
      selectedSkillCategory: 'all',
      selectedProjectFilter: 'all',
      theme: this.getPreferredTheme(),
      
      // Animation State
      animations: {
        reducedMotion: this.prefersReducedMotion(),
        currentAnimations: []
      },
      
      // Viewport State
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        scrollY: window.scrollY,
        isMobile: window.innerWidth < 768
      },
      
      // Performance State
      performance: {
        loadTime: 0,
        renderTime: 0,
        bundleSize: 0
      },
      
      // Component State
      components: {
        initialized: [],
        failed: [],
        loading: []
      },
      
      // Error State
      errors: {
        count: 0,
        recent: [],
        recovered: []
      }
    };
    
    this.state.setState(initialState);
    
    // Set up state change listeners
    this.setupStateChangeListeners();
  }
  
  /**
   * Set up state validators
   */
  setupStateValidators() {
    // Theme validator
    this.state.addValidator('theme', (value) => {
      const validThemes = ['light', 'dark', 'auto'];
      return validThemes.includes(value) || `Theme must be one of: ${validThemes.join(', ')}`;
    });
    
    // Active section validator
    this.state.addValidator('activeSection', (value) => {
      const validSections = ['hero', 'skills', 'projects', 'experience', 'contact'];
      return validSections.includes(value) || `Active section must be one of: ${validSections.join(', ')}`;
    });
    
    // Menu state validator
    this.state.addValidator('isMenuOpen', (value) => {
      return typeof value === 'boolean' || 'Menu state must be a boolean';
    });
    
    // Skill category validator
    this.state.addValidator('selectedSkillCategory', (value) => {
      return typeof value === 'string' || 'Skill category must be a string';
    });
    
    // Project filter validator
    this.state.addValidator('selectedProjectFilter', (value) => {
      return typeof value === 'string' || 'Project filter must be a string';
    });
    
    // Viewport validator
    this.state.addValidator('viewport', (value) => {
      const required = ['width', 'height', 'scrollY', 'isMobile'];
      const hasRequired = required.every(key => key in value);
      return hasRequired || `Viewport must have properties: ${required.join(', ')}`;
    });
    
    // Animations validator
    this.state.addValidator('animations', (value) => {
      return (typeof value === 'object' && 'reducedMotion' in value) || 
             'Animations must be an object with reducedMotion property';
    });
  }
  
  /**
   * Set up computed properties
   */
  setupComputedProperties() {
    // Is mobile computed property
    this.state.addComputedProperty('isMobile', (state) => {
      return state.viewport?.width < 768;
    });
    
    // Is dark theme computed property
    this.state.addComputedProperty('isDarkTheme', (state) => {
      if (state.theme === 'auto') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return state.theme === 'dark';
    });
    
    // Has errors computed property
    this.state.addComputedProperty('hasErrors', (state) => {
      return state.errors?.count > 0;
    });
    
    // Component status computed property
    this.state.addComputedProperty('componentStatus', (state) => {
      const total = state.components?.initialized.length + 
                   state.components?.failed.length + 
                   state.components?.loading.length;
      return {
        total,
        initialized: state.components?.initialized.length || 0,
        failed: state.components?.failed.length || 0,
        loading: state.components?.loading.length || 0,
        allInitialized: state.components?.failed.length === 0 && 
                       state.components?.loading.length === 0
      };
    });
    
    // Performance status computed property
    this.state.addComputedProperty('performanceStatus', (state) => {
      const perf = state.performance || {};
      return {
        isGood: perf.loadTime < 1000 && perf.renderTime < 16,
        loadTimeGrade: perf.loadTime < 500 ? 'excellent' : 
                      perf.loadTime < 1000 ? 'good' : 
                      perf.loadTime < 2000 ? 'fair' : 'poor',
        renderTimeGrade: perf.renderTime < 16 ? 'excellent' : 
                        perf.renderTime < 33 ? 'good' : 'poor'
      };
    });
  }
  
  /**
   * Set up persistent state keys
   */
  setupPersistentState() {
    this.state.setPersistentKeys([
      'theme',
      'selectedSkillCategory',
      'selectedProjectFilter',
      'animations'
    ]);
  }
  
  /**
   * Set up state middleware
   */
  setupStateMiddleware() {
    // Logging middleware
    this.state.addMiddleware((updates, currentState, options) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('State update:', updates, options);
      }
      return updates;
    });
    
    // Performance tracking middleware
    this.state.addMiddleware((updates, currentState, options) => {
      if (updates.performance && this.performanceMonitor) {
        this.performanceMonitor.recordMetric('state_update', performance.now(), {
          keys: Object.keys(updates),
          batched: options.batched
        });
      }
      return updates;
    });
    
    // Error tracking middleware
    this.state.addMiddleware((updates, currentState, options) => {
      if (updates.errors) {
        // Limit recent errors to last 10
        if (updates.errors.recent && updates.errors.recent.length > 10) {
          updates.errors.recent = updates.errors.recent.slice(-10);
        }
      }
      return updates;
    });
  }
  
  /**
   * Set up state change listeners
   */
  setupStateChangeListeners() {
    // Listen to UI state changes
    this.state.subscribeToUI('section-change', (sectionId) => {
      this.updateActiveSection(sectionId);
    });
    
    this.state.subscribeToUI('menu-toggle', (isOpen) => {
      this.updateMenuState(isOpen);
    });
    
    this.state.subscribeToUI('theme-change', (theme) => {
      this.updateThemeState(theme);
    });
    
    this.state.subscribeToUI('viewport-change', (viewport) => {
      this.updateViewportState(viewport);
    });
    
    // Listen to component state changes
    this.state.subscribe((stateChange) => {
      if (stateChange.updates.components) {
        this.handleComponentStateChange(stateChange.updates.components);
      }
    });
    
    // Listen to error state changes
    this.state.subscribe((stateChange) => {
      if (stateChange.updates.errors) {
        this.handleErrorStateChange(stateChange.updates.errors);
      }
    });
  }
  
  /**
   * Handle component state changes
   */
  handleComponentStateChange(componentState) {
    const status = this.state.getState('componentStatus');
    
    // Update UI indicators
    this.updateComponentStatusIndicator(status);
    
    // Emit component status events
    if (status.allInitialized) {
      this.emit('components:all-initialized');
    }
    
    if (componentState.failed && componentState.failed.length > 0) {
      this.emit('components:failures', componentState.failed);
    }
  }
  
  /**
   * Handle error state changes
   */
  handleErrorStateChange(errorState) {
    // Update error indicators
    this.updateErrorIndicator(errorState);
    
    // Auto-recovery for certain errors
    if (errorState.recent && errorState.recent.length > 0) {
      const recentError = errorState.recent[errorState.recent.length - 1];
      this.attemptErrorRecovery(recentError);
    }
  }
  
  /**
   * Update component status indicator
   */
  updateComponentStatusIndicator(status) {
    let indicator = document.querySelector('.app-state-indicator');
    
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'app-state-indicator';
      document.body.appendChild(indicator);
    }
    
    if (status.loading.length > 0) {
      indicator.textContent = `Loading components: ${status.loading.length}`;
      indicator.className = 'app-state-indicator visible';
    } else if (status.failed.length > 0) {
      indicator.textContent = `Component errors: ${status.failed.length}`;
      indicator.className = 'app-state-indicator visible error';
    } else if (status.allInitialized) {
      indicator.textContent = 'All components ready';
      indicator.className = 'app-state-indicator visible success';
      
      // Hide after 3 seconds
      setTimeout(() => {
        indicator.classList.remove('visible');
      }, 3000);
    }
  }
  
  /**
   * Update error indicator
   */
  updateErrorIndicator(errorState) {
    if (errorState.count > 0) {
      console.warn(`Application has ${errorState.count} errors`);
      
      // Show error indicator for critical errors
      if (errorState.count > 3) {
        this.showCriticalErrorIndicator(errorState);
      }
    }
  }
  
  /**
   * Show critical error indicator
   */
  showCriticalErrorIndicator(errorState) {
    const indicator = document.createElement('div');
    indicator.className = 'error-notification critical';
    indicator.innerHTML = `
      <div class="error-content">
        <h3>Multiple Issues Detected</h3>
        <p>The application has encountered ${errorState.count} errors. Some features may not work correctly.</p>
        <button class="error-dismiss" onclick="this.parentElement.parentElement.remove()">Dismiss</button>
        <button class="error-recovery-btn" onclick="window.location.reload()">Reload Page</button>
      </div>
    `;
    
    document.body.appendChild(indicator);
  }

  /**
   * Show critical initialization error without causing app crash
   */
  showCriticalInitializationError(criticalFailures) {
    console.error('Critical components failed to initialize:', criticalFailures);
    
    // Hide loading screen
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
      loadingScreen.style.display = 'none';
    }
    
    // Show user-friendly error message
    const errorContainer = document.createElement('div');
    errorContainer.className = 'critical-error-container';
    errorContainer.innerHTML = `
      <div class="critical-error-content">
        <h2>⚠️ Application Initialization Error</h2>
        <p>Some critical components failed to load properly:</p>
        <ul class="error-list">
          ${criticalFailures.map(failure => `
            <li><strong>${failure.name}</strong>: ${failure.error?.message || 'Unknown error'}</li>
          `).join('')}
        </ul>
        <p>The application may not function correctly. Please try refreshing the page.</p>
        <div class="error-actions">
          <button class="btn btn-primary" onclick="window.location.reload()">
            🔄 Refresh Page
          </button>
          <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">
            ❌ Dismiss
          </button>
        </div>
      </div>
    `;
    
    // Add some basic styling
    errorContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    const content = errorContainer.querySelector('.critical-error-content');
    content.style.cssText = `
      background: white;
      padding: 2rem;
      border-radius: 8px;
      max-width: 500px;
      margin: 1rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(errorContainer);
  }
  
  /**
   * Attempt error recovery
   */
  attemptErrorRecovery(error) {
    // Implement specific recovery strategies based on error type
    if (error.component && error.method === 'init') {
      // Component initialization error - retry after delay
      setTimeout(() => {
        this.retryComponentInitialization(error.component);
      }, 2000);
    }
  }
  
  /**
   * Set up global event listeners
   */
  setupEventListeners() {
    // Viewport events
    window.addEventListener('resize', this.handleResize, { passive: true });
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    
    // Keyboard navigation
    document.addEventListener('keydown', this.handleKeydown.bind(this));
    
    // Focus management
    document.addEventListener('focusin', this.handleFocusIn.bind(this));
    document.addEventListener('focusout', this.handleFocusOut.bind(this));
    
    // Theme change detection
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', this.handleThemeChange.bind(this));
    
    // Reduced motion detection
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', this.handleMotionPreferenceChange.bind(this));
  }
  
  /**
   * Initialize performance monitoring
   */
  initializePerformanceMonitor() {
    this.performanceMonitor = new PerformanceMonitor();
    this.performanceMonitor.start();
    
    // Listen to performance events
    this.on('performance:image-loaded', (detail) => {
      this.performanceMonitor.recordMetric('image_loaded', performance.now(), detail);
    });
    
    this.on('performance:image-error', (detail) => {
      this.performanceMonitor.recordMetric('image_error', performance.now(), detail);
    });
    
    // Record app initialization time
    this.performanceMonitor.startTiming('app_init');
    
    console.log('Performance monitoring initialized');
  }
  
  /**
   * Initialize lazy loading system
   */
  initializeLazyLoader() {
    this.lazyLoader = new LazyLoader({
      rootMargin: '50px 0px',
      threshold: 0.1,
      loadingClass: 'lazy-loading',
      loadedClass: 'lazy-loaded',
      errorClass: 'lazy-error'
    });
    
    // Listen to lazy loading events
    document.addEventListener('lazyload:loaded', (event) => {
      this.emit('performance:image-loaded', event.detail);
    });
    
    document.addEventListener('lazyload:error', (event) => {
      console.warn('Failed to load lazy image:', event.detail.error);
      this.emit('performance:image-error', event.detail);
    });
    
    console.log('Lazy loading system initialized');
  }
  
  /**
   * Initialize bundle optimizer
   */
  initializeBundleOptimizer() {
    this.bundleOptimizer = new BundleOptimizer();
    this.bundleOptimizer.init();
    
    console.log('Bundle optimizer initialized');
  }
  
  /**
   * Initialize accessibility manager
   */
  initializeAccessibilityManager() {
    this.accessibilityManager = new AccessibilityManager(this);
    this.accessibilityManager.init();
    
    console.log('Accessibility manager initialized');
  }
  
  /**
   * Initialize animation manager
   */
  initializeAnimationManager() {
    this.animationManager = new AnimationManager();
    
    // Listen to motion preference changes
    this.on('motion:preference-change', (reducedMotion) => {
      this.animationManager.reducedMotion = reducedMotion;
      this.animationManager.updateAnimationState();
    });
    
    console.log('Animation manager initialized');
  }
  
  /**
   * Initialize micro-interactions
   */
  initializeMicroInteractions() {
    this.microInteractions = new MicroInteractions();
    
    // Listen to motion preference changes
    this.on('motion:preference-change', (reducedMotion) => {
      this.microInteractions.reducedMotion = reducedMotion;
      this.microInteractions.updateInteractionState();
    });
    
    console.log('Micro-interactions initialized');
  }
  
  /**
   * Initialize components with error boundaries and integration
   */
  async initializeComponents() {
    const componentConfigs = [
      { name: 'navigation', Class: Navigation, required: true },
      { name: 'hero', Class: Hero, required: true },
      { name: 'skills', Class: Skills, required: true },
      { name: 'projects', Class: Projects, required: true },
      { name: 'experience', Class: Experience, required: true },
      { name: 'contact', Class: null, required: true, lazy: true } // Lazy loaded
    ];
    
    const initPromises = componentConfigs.map(config => 
      this.initializeComponent(config)
    );
    
    // Wait for all components to initialize
    const results = await Promise.allSettled(initPromises);
    
    // Handle initialization results
    const failed = [];
    const succeeded = [];
    
    results.forEach((result, index) => {
      const config = componentConfigs[index];
      if (result.status === 'fulfilled') {
        succeeded.push(config.name);
      } else {
        failed.push({ name: config.name, error: result.reason, required: config.required });
        console.error(`Failed to initialize ${config.name}:`, result.reason);
      }
    });
    
    // Handle critical failures gracefully
    const criticalFailures = failed.filter(f => f.required);
    if (criticalFailures.length > 0) {
      console.warn('Some components failed to initialize:', criticalFailures);
      // Continue with available components instead of blocking the app
      this.handlePartialInitialization(criticalFailures, succeeded);
    }
    
    // Set up component integration
    this.setupComponentIntegration();
    
    // Set up component error boundaries
    this.setupComponentErrorBoundaries();
    
    console.log(`Components initialized successfully: ${succeeded.join(', ')}`);
    if (failed.length > 0) {
      console.warn(`Non-critical components failed: ${failed.map(f => f.name).join(', ')}`);
    }
  }
  
  /**
   * Initialize individual component with error handling
   */
  async initializeComponent(config) {
    try {
      let ComponentClass = config.Class;
      
      // Handle lazy loading
      if (config.lazy) {
        const module = await import(`../components/${config.name.charAt(0).toUpperCase() + config.name.slice(1)}.js`);
        ComponentClass = module[config.name.charAt(0).toUpperCase() + config.name.slice(1)];
      }
      
      // Create component instance
      const component = new ComponentClass(this);
      
      // Add error boundary wrapper
      const wrappedComponent = this.wrapComponentWithErrorBoundary(component, config.name);
      
      // Initialize component
      if (typeof wrappedComponent.init === 'function') {
        await wrappedComponent.init();
      }
      
      // Register component
      this.components.register(config.name, wrappedComponent);
      this[config.name] = wrappedComponent;
      
      // Set up component state synchronization
      this.setupComponentStateSync(wrappedComponent, config.name);
      
      return wrappedComponent;
      
    } catch (error) {
      // Create fallback component if initialization fails
      const fallback = this.createFallbackComponent(config.name, error);
      this.components.register(config.name, fallback);
      this[config.name] = fallback;
      
      throw error;
    }
  }
  
  /**
   * Wrap component with error boundary
   */
  wrapComponentWithErrorBoundary(component, name) {
    const originalMethods = {};
    
    // Wrap all methods with try-catch
    Object.getOwnPropertyNames(Object.getPrototypeOf(component)).forEach(methodName => {
      if (typeof component[methodName] === 'function' && methodName !== 'constructor') {
        originalMethods[methodName] = component[methodName];
        
        component[methodName] = (...args) => {
          try {
            const result = originalMethods[methodName].apply(component, args);
            
            // Handle promises
            if (result && typeof result.catch === 'function') {
              return result.catch(error => {
                this.handleComponentError(name, methodName, error);
                return this.getComponentFallbackValue(name, methodName);
              });
            }
            
            return result;
          } catch (error) {
            this.handleComponentError(name, methodName, error);
            return this.getComponentFallbackValue(name, methodName);
          }
        };
      }
    });
    
    return component;
  }
  
  /**
   * Set up component integration and communication
   */
  setupComponentIntegration() {
    // Cross-component communication patterns
    const integrationMap = {
      navigation: {
        listens: ['section:active', 'viewport:scroll'],
        emits: ['navigation:change', 'menu:toggle']
      },
      hero: {
        listens: ['theme:change', 'viewport:resize'],
        emits: ['hero:cta-click', 'hero:animation-complete']
      },
      skills: {
        listens: ['section:active', 'skills:filter-change'],
        emits: ['skills:category-select', 'skills:item-hover']
      },
      projects: {
        listens: ['section:active', 'projects:filter-change'],
        emits: ['projects:item-select', 'projects:github-data-loaded']
      },
      experience: {
        listens: ['section:active', 'viewport:scroll'],
        emits: ['experience:item-expand', 'experience:timeline-scroll']
      },
      contact: {
        listens: ['section:active'],
        emits: ['contact:form-submit', 'contact:validation-error']
      }
    };
    
    // Set up component communication
    Object.entries(integrationMap).forEach(([componentName, config]) => {
      const component = this[componentName];
      if (!component) return;
      
      // Set up listeners
      config.listens.forEach(event => {
        this.on(event, (...args) => {
          if (typeof component.handleGlobalEvent === 'function') {
            component.handleGlobalEvent(event, ...args);
          }
        });
      });
      
      // Forward component events to global event system
      config.emits.forEach(event => {
        if (typeof component.on === 'function') {
          component.on(event, (...args) => {
            this.emit(event, ...args);
          });
        }
      });
    });
    
    // Set up global UI state synchronization
    this.setupGlobalUISync();
  }
  
  /**
   * Set up global UI state synchronization
   */
  setupGlobalUISync() {
    // Navigation state sync
    this.on('navigation:change', (sectionId) => {
      this.state.setState({ activeSection: sectionId });
      this.updateActiveSection(sectionId);
    });
    
    // Menu state sync
    this.on('menu:toggle', (isOpen) => {
      this.state.setState({ isMenuOpen: isOpen });
      this.updateMenuState(isOpen);
    });
    
    // Filter state sync
    this.on('skills:category-select', (category) => {
      this.state.setState({ selectedSkillCategory: category });
    });
    
    this.on('projects:filter-change', (filter) => {
      this.state.setState({ selectedProjectFilter: filter });
    });
    
    // Theme state sync
    this.on('theme:change', (theme) => {
      this.updateThemeState(theme);
    });
    
    // Viewport state sync
    this.on('viewport:resize', (viewport) => {
      this.updateViewportState(viewport);
    });
  }
  
  /**
   * Set up component state synchronization
   */
  setupComponentStateSync(component, name) {
    if (typeof component.syncWithGlobalState === 'function') {
      // Initial sync
      component.syncWithGlobalState(this.state.getState());
      
      // Subscribe to state changes
      this.state.on('state:change', (stateChange) => {
        component.syncWithGlobalState(stateChange.current);
      });
    }
  }
  
  /**
   * Set up component error boundaries
   */
  setupComponentErrorBoundaries() {
    // Global error handler for component errors
    this.on('component:error', (error) => {
      console.error('Component error caught by boundary:', error);
      
      // Show user-friendly error message
      this.showErrorNotification(error);
      
      // Attempt recovery if possible
      this.attemptComponentRecovery(error);
    });
    
    // Set up error recovery strategies
    this.setupErrorRecoveryStrategies();
  }
  
  /**
   * Handle component errors
   */
  handleComponentError(componentName, methodName, error) {
    const errorInfo = {
      component: componentName,
      method: methodName,
      error: error,
      timestamp: Date.now(),
      state: this.state.getState()
    };
    
    console.error(`Error in ${componentName}.${methodName}:`, error);
    
    // Emit error event for handling
    this.emit('component:error', errorInfo);
    
    // Log error for monitoring
    if (this.performanceMonitor) {
      this.performanceMonitor.recordError(errorInfo);
    }
  }
  
  /**
   * Get fallback value for component method
   */
  getComponentFallbackValue(componentName, methodName) {
    const fallbacks = {
      render: () => '<div class="component-error">Content temporarily unavailable</div>',
      getData: () => ({}),
      init: () => Promise.resolve(),
      destroy: () => {},
      update: () => {}
    };
    
    return fallbacks[methodName] || null;
  }
  
  /**
   * Handle partial initialization when some components fail
   */
  handlePartialInitialization(criticalFailures, succeeded) {
    console.log(`App running with ${succeeded.length} components, ${criticalFailures.length} failed`);
    
    // Show a subtle notification about partial functionality
    const notification = document.createElement('div');
    notification.className = 'partial-init-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">⚠️</span>
        <span class="notification-text">Some features may be limited</span>
        <button class="notification-dismiss" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    // Add basic styling
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 12px;
      z-index: 1000;
      font-family: system-ui, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;
    
    document.body.appendChild(notification);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
    
    // Create fallback components for failed ones
    criticalFailures.forEach(failure => {
      const fallback = this.createFallbackComponent(failure.name, failure.error);
      this.components.register(failure.name, fallback);
      this[failure.name] = fallback;
      
      // Try to initialize fallback
      try {
        if (typeof fallback.init === 'function') {
          fallback.init();
        }
      } catch (fallbackError) {
        console.warn(`Fallback for ${failure.name} also failed:`, fallbackError);
      }
    });
  }

  /**
   * Create fallback component
   */
  createFallbackComponent(name, error) {
    return {
      name: `${name}-fallback`,
      error: error,
      init: () => {
        console.warn(`Using fallback for ${name} component`);
        this.renderFallbackContent(name);
      },
      render: () => this.getFallbackHTML(name),
      destroy: () => {},
      handleGlobalEvent: () => {},
      syncWithGlobalState: () => {}
    };
  }

  /**
   * Render fallback content for failed component
   */
  renderFallbackContent(name) {
    const section = document.getElementById(name);
    if (section) {
      section.innerHTML = `
        <div class="component-fallback">
          <div class="fallback-content">
            <h3>Content Temporarily Unavailable</h3>
            <p>The ${name} section is currently experiencing issues.</p>
            <button onclick="window.location.reload()" class="fallback-retry-btn">
              Refresh Page
            </button>
          </div>
        </div>
      `;
      
      // Add basic styling
      const style = document.createElement('style');
      style.textContent = `
        .component-fallback {
          padding: 2rem;
          text-align: center;
          background: #f9fafb;
          border-radius: 8px;
          margin: 1rem 0;
        }
        .fallback-content h3 {
          color: #6b7280;
          margin-bottom: 0.5rem;
        }
        .fallback-content p {
          color: #9ca3af;
          margin-bottom: 1rem;
        }
        .fallback-retry-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }
        .fallback-retry-btn:hover {
          background: #2563eb;
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Get fallback HTML for component
   */
  getFallbackHTML(name) {
    return `
      <div class="component-fallback">
        <div class="fallback-content">
          <h3>${name.charAt(0).toUpperCase() + name.slice(1)} Section</h3>
          <p>Content is temporarily unavailable.</p>
        </div>
      </div>
    `;
  }
  
  /**
   * Render fallback content for failed components
   */
  renderFallbackContent(componentName) {
    const container = document.getElementById(componentName);
    if (container) {
      container.innerHTML = this.getFallbackHTML(componentName);
      container.classList.add('component-fallback');
    }
  }
  
  /**
   * Get fallback HTML for components
   */
  getFallbackHTML(componentName) {
    const fallbacks = {
      navigation: '<nav class="fallback-nav"><div class="nav-placeholder">Navigation temporarily unavailable</div></nav>',
      hero: '<div class="fallback-hero"><h1>Welcome</h1><p>Content loading...</p></div>',
      skills: '<div class="fallback-skills"><h2>Skills</h2><p>Skills information temporarily unavailable</p></div>',
      projects: '<div class="fallback-projects"><h2>Projects</h2><p>Projects information temporarily unavailable</p></div>',
      experience: '<div class="fallback-experience"><h2>Experience</h2><p>Experience information temporarily unavailable</p></div>',
      contact: '<div class="fallback-contact"><h2>Contact</h2><p>Contact form temporarily unavailable</p></div>'
    };
    
    return fallbacks[componentName] || '<div class="component-fallback">Content temporarily unavailable</div>';
  }
  
  /**
   * Set up error recovery strategies
   */
  setupErrorRecoveryStrategies() {
    // Retry failed component initialization after delay
    this.on('component:error', (errorInfo) => {
      if (errorInfo.method === 'init') {
        setTimeout(() => {
          this.retryComponentInitialization(errorInfo.component);
        }, 5000);
      }
    });
  }
  
  /**
   * Attempt to recover from component errors
   */
  attemptComponentRecovery(errorInfo) {
    const component = this[errorInfo.component];
    if (component && typeof component.recover === 'function') {
      try {
        component.recover(errorInfo);
      } catch (recoveryError) {
        console.error('Component recovery failed:', recoveryError);
      }
    }
  }
  
  /**
   * Retry component initialization
   */
  async retryComponentInitialization(componentName) {
    try {
      console.log(`Retrying initialization for ${componentName} component`);
      
      const config = this.getComponentConfig(componentName);
      if (config) {
        await this.initializeComponent(config);
        console.log(`Successfully recovered ${componentName} component`);
      }
    } catch (error) {
      console.error(`Failed to recover ${componentName} component:`, error);
    }
  }
  
  /**
   * Get component configuration
   */
  getComponentConfig(name) {
    const configs = {
      navigation: { name: 'navigation', Class: Navigation, required: true },
      hero: { name: 'hero', Class: Hero, required: true },
      skills: { name: 'skills', Class: Skills, required: true },
      projects: { name: 'projects', Class: Projects, required: true },
      experience: { name: 'experience', Class: Experience, required: true },
      contact: { name: 'contact', Class: Contact, required: true, lazy: true }
    };
    
    return configs[name];
  }
  
  /**
   * Update active section across all components
   */
  updateActiveSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
      section.classList.toggle('active', section.id === sectionId);
    });
    
    // Update navigation active state
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === `#${sectionId}`);
    });
  }
  
  /**
   * Update menu state across components
   */
  updateMenuState(isOpen) {
    document.body.classList.toggle('menu-open', isOpen);
    
    const menuButton = document.querySelector('.menu-toggle');
    if (menuButton) {
      menuButton.setAttribute('aria-expanded', isOpen.toString());
    }
  }
  
  /**
   * Update theme state across components
   */
  updateThemeState(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update theme toggle buttons
    document.querySelectorAll('.theme-toggle').forEach(button => {
      button.setAttribute('data-theme', theme);
    });
  }
  
  /**
   * Update viewport state across components
   */
  updateViewportState(viewport) {
    document.documentElement.style.setProperty('--viewport-width', `${viewport.width}px`);
    document.documentElement.style.setProperty('--viewport-height', `${viewport.height}px`);
    
    // Update mobile class
    document.body.classList.toggle('mobile', viewport.isMobile);
  }
  
  /**
   * Show error notification to user
   */
  showErrorNotification(errorInfo) {
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerHTML = `
      <div class="error-content">
        <h3>Something went wrong</h3>
        <p>We're working to fix this issue. Please try refreshing the page.</p>
        <button class="error-dismiss" onclick="this.parentElement.parentElement.remove()">Dismiss</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }
  
  /**
   * Set up intersection observers for scroll-based animations
   */
  setupIntersectionObservers() {
    // Observer for section visibility
    this.sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            this.state.setState({ activeSection: sectionId });
            this.emit('section:active', sectionId);
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '-20% 0px -20% 0px'
      }
    );
    
    // Observer for animation triggers
    this.animationObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.state.getState().animations.reducedMotion) {
            entry.target.classList.add('animate-in');
            this.emit('animation:trigger', entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -10% 0px'
      }
    );
    
    // Observe all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
      this.sectionObserver.observe(section);
      this.animationObserver.observe(section);
    });
  }
  
  /**
   * Handle window resize
   */
  handleResize() {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollY: window.scrollY,
      isMobile: window.innerWidth < 768
    };
    
    this.state.setState({ viewport });
    this.emit('viewport:resize', viewport);
  }
  
  /**
   * Handle window scroll
   */
  handleScroll() {
    const scrollY = window.scrollY;
    const viewport = { ...this.state.getState().viewport, scrollY };
    
    this.state.setState({ viewport });
    this.emit('viewport:scroll', scrollY);
  }
  
  /**
   * Handle keyboard navigation
   */
  handleKeydown(event) {
    // Escape key handling
    if (event.key === 'Escape') {
      this.closeAllModals();
    }
    
    // Tab navigation enhancement
    if (event.key === 'Tab') {
      document.body.classList.add('keyboard-navigation');
    }
    
    this.emit('keyboard:input', event);
  }
  
  /**
   * Handle focus events
   */
  handleFocusIn(event) {
    this.emit('focus:in', event.target);
  }
  
  handleFocusOut(event) {
    this.emit('focus:out', event.target);
  }
  
  /**
   * Handle theme preference changes
   */
  handleThemeChange(event) {
    if (this.state.getState().theme === 'auto') {
      const newTheme = event.matches ? 'dark' : 'light';
      this.setTheme(newTheme);
    }
  }
  
  /**
   * Handle motion preference changes
   */
  handleMotionPreferenceChange(event) {
    const reducedMotion = event.matches;
    this.state.setState({ 
      animations: { 
        ...this.state.getState().animations, 
        reducedMotion 
      } 
    });
    this.emit('motion:preference-change', reducedMotion);
  }
  
  /**
   * Get preferred theme from system/storage
   */
  getPreferredTheme() {
    const stored = localStorage.getItem('theme');
    if (stored && ['light', 'dark', 'auto'].includes(stored)) {
      return stored;
    }
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  
  /**
   * Set application theme
   */
  setTheme(theme) {
    this.state.setState({ theme });
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    this.emit('theme:change', theme);
  }
  
  /**
   * Close all open modals/overlays
   */
  closeAllModals() {
    this.state.setState({ isMenuOpen: false });
    this.emit('modals:close');
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('scroll', this.handleScroll);
    
    // Disconnect observers
    if (this.sectionObserver) {
      this.sectionObserver.disconnect();
    }
    
    if (this.animationObserver) {
      this.animationObserver.disconnect();
    }
    
    // Clean up lazy loader
    if (this.lazyLoader) {
      this.lazyLoader.destroy();
    }
    
    // Clean up performance monitor
    if (this.performanceMonitor) {
      this.performanceMonitor.destroy();
    }
    
    // Clean up accessibility manager
    if (this.accessibilityManager) {
      this.accessibilityManager.destroy();
    }
    
    // Clean up animation manager
    if (this.animationManager) {
      this.animationManager.destroy();
    }
    
    // Clean up micro-interactions
    if (this.microInteractions) {
      this.microInteractions.destroy();
    }
    
    // Clean up components
    this.components.destroyAll();
    
    this.isInitialized = false;
    this.emit('app:destroyed');
  }

  /**
   * Retry component initialization
   */
  async retryComponentInitialization(componentName) {
    try {
      console.log(`Retrying initialization for ${componentName} component`);
      
      const config = this.getComponentConfig(componentName);
      if (config) {
        await this.initializeComponent(config);
        console.log(`Successfully recovered ${componentName} component`);
      }
    } catch (error) {
      console.error(`Failed to recover ${componentName} component:`, error);
    }
  }
  
  /**
   * Get component configuration
   */
  getComponentConfig(name) {
    const configs = {
      navigation: { name: 'navigation', Class: Navigation, required: true },
      hero: { name: 'hero', Class: Hero, required: true },
      skills: { name: 'skills', Class: Skills, required: true },
      projects: { name: 'projects', Class: Projects, required: true },
      experience: { name: 'experience', Class: Experience, required: true },
      contact: { name: 'contact', Class: null, required: true, lazy: true }
    };
    
    return configs[name];
  }
  
  /**
   * Update active section across all components
   */
  updateActiveSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
      section.classList.toggle('active', section.id === sectionId);
    });
    
    // Update navigation active state
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === `#${sectionId}`);
    });
  }
  
  /**
   * Update menu state across components
   */
  updateMenuState(isOpen) {
    document.body.classList.toggle('menu-open', isOpen);
    
    const menuButton = document.querySelector('.menu-toggle');
    if (menuButton) {
      menuButton.setAttribute('aria-expanded', isOpen.toString());
    }
  }
  
  /**
   * Update theme state across components
   */
  updateThemeState(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update theme toggle buttons
    document.querySelectorAll('.theme-toggle').forEach(button => {
      button.setAttribute('data-theme', theme);
    });
  }
  
  /**
   * Update viewport state across components
   */
  updateViewportState(viewport) {
    document.documentElement.style.setProperty('--viewport-width', `${viewport.width}px`);
    document.documentElement.style.setProperty('--viewport-height', `${viewport.height}px`);
    
    // Update mobile class
    document.body.classList.toggle('mobile', viewport.isMobile);
  }
  
  /**
   * Show error notification to user
   */
  showErrorNotification(errorInfo) {
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerHTML = `
      <div class="error-content">
        <h3>Something went wrong</h3>
        <p>We're working to fix this issue. Please try refreshing the page.</p>
        <button class="error-dismiss" onclick="this.parentElement.parentElement.remove()">Dismiss</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }
  
  /**
   * Set up intersection observers for scroll-based animations
   */
  setupIntersectionObservers() {
    // Observer for section visibility
    this.sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            this.state.setState({ activeSection: sectionId });
            this.emit('section:active', sectionId);
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '-20% 0px -20% 0px'
      }
    );
    
    // Observer for animation triggers
    this.animationObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.state.getState().animations.reducedMotion) {
            entry.target.classList.add('animate-in');
            this.emit('animation:trigger', entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -10% 0px'
      }
    );
    
    // Observe all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
      this.sectionObserver.observe(section);
      this.animationObserver.observe(section);
    });
  }
  
  /**
   * Handle window resize
   */
  handleResize() {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollY: window.scrollY,
      isMobile: window.innerWidth < 768
    };
    
    this.state.setState({ viewport });
    this.emit('viewport:resize', viewport);
  }
  
  /**
   * Handle window scroll
   */
  handleScroll() {
    const scrollY = window.scrollY;
    const viewport = { ...this.state.getState().viewport, scrollY };
    
    this.state.setState({ viewport });
    this.emit('viewport:scroll', scrollY);
  }
  
  /**
   * Handle keyboard navigation
   */
  handleKeydown(event) {
    // Escape key handling
    if (event.key === 'Escape') {
      this.closeAllModals();
    }
    
    // Tab navigation enhancement
    if (event.key === 'Tab') {
      document.body.classList.add('keyboard-navigation');
    }
    
    this.emit('keyboard:input', event);
  }
  
  /**
   * Handle focus events
   */
  handleFocusIn(event) {
    this.emit('focus:in', event.target);
  }
  
  handleFocusOut(event) {
    this.emit('focus:out', event.target);
  }
  
  /**
   * Handle theme preference changes
   */
  handleThemeChange(event) {
    if (this.state.getState().theme === 'auto') {
      const newTheme = event.matches ? 'dark' : 'light';
      this.setTheme(newTheme);
    }
  }
  
  /**
   * Handle motion preference changes
   */
  handleMotionPreferenceChange(event) {
    const reducedMotion = event.matches;
    this.state.setState({ 
      animations: { 
        ...this.state.getState().animations, 
        reducedMotion 
      } 
    });
    this.emit('motion:preference-change', reducedMotion);
  }
  
  /**
   * Get preferred theme from system/storage
   */
  getPreferredTheme() {
    const stored = localStorage.getItem('theme');
    if (stored && ['light', 'dark', 'auto'].includes(stored)) {
      return stored;
    }
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  
  /**
   * Set application theme
   */
  setTheme(theme) {
    this.state.setState({ theme });
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    this.emit('theme:change', theme);
  }
  
  /**
   * Close all open modals/overlays
   */
  closeAllModals() {
    this.state.setState({ isMenuOpen: false });
    this.emit('modals:close');
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('scroll', this.handleScroll);
    
    // Disconnect observers
    if (this.sectionObserver) {
      this.sectionObserver.disconnect();
    }
    
    if (this.animationObserver) {
      this.animationObserver.disconnect();
    }
    
    // Clean up lazy loader
    if (this.lazyLoader) {
      this.lazyLoader.destroy();
    }
    
    // Clean up performance monitor
    if (this.performanceMonitor) {
      this.performanceMonitor.destroy();
    }
    
    // Clean up accessibility manager
    if (this.accessibilityManager) {
      this.accessibilityManager.destroy();
    }
    
    // Clean up animation manager
    if (this.animationManager) {
      this.animationManager.destroy();
    }
    
    // Clean up micro-interactions
    if (this.microInteractions) {
      this.microInteractions.destroy();
    }
    
    // Clean up components
    this.components.destroyAll();
    
    this.isInitialized = false;
    this.emit('app:destroyed');
  }
}