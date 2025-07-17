/**
 * Micro-Interactions Manager (Simplified)
 * Basic hover effects and interactions without complex operations that could cause startup failures
 */

export class MicroInteractions {
  constructor() {
    this.isInitialized = false;
    this.reducedMotion = false;
    
    try {
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (error) {
      console.warn('Could not detect motion preference:', error);
    }
  }
  
  /**
   * Initialize micro-interactions system (simplified)
   */
  init() {
    if (this.isInitialized) return;
    
    try {
      this.setupBasicInteractions();
      this.isInitialized = true;
      console.log('✅ Micro-interactions initialized (basic mode)');
    } catch (error) {
      console.warn('Micro-interactions failed to initialize:', error);
      // Continue without micro-interactions rather than blocking startup
    }
  }
  
  /**
   * Setup basic interactions with CSS
   */
  setupBasicInteractions() {
    // Add basic CSS for interactions
    const style = document.createElement('style');
    style.textContent = `
      /* Basic hover effects */
      .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: all 0.2s ease;
      }
      
      .project-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
      }
      
      .filter-btn:hover {
        background-color: var(--color-primary, #3b82f6);
        color: white;
        transition: all 0.2s ease;
      }
      
      /* Button press effects */
      .btn:active {
        transform: translateY(-1px) scale(0.98);
      }
      
      /* Loading states */
      .loading {
        opacity: 0.7;
        pointer-events: none;
      }
      
      .loading-spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      /* Respect reduced motion preference */
      @media (prefers-reduced-motion: reduce) {
        .btn:hover,
        .project-card:hover,
        .filter-btn:hover {
          transform: none !important;
          transition: none !important;
        }
        
        .loading-spinner {
          animation: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  /**
   * Update interaction state based on reduced motion preference
   */
  updateInteractionState() {
    try {
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      if (this.reducedMotion) {
        document.body.classList.add('reduce-motion');
      } else {
        document.body.classList.remove('reduce-motion');
      }
    } catch (error) {
      console.warn('Could not update interaction state:', error);
    }
  }
  
  /**
   * Cleanup
   */
  destroy() {
    this.isInitialized = false;
  }
}