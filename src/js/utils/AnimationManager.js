/**
 * Animation Manager (Simplified)
 * Basic animation handling without complex operations that could cause startup failures
 */

export class AnimationManager {
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
   * Initialize the animation system (simplified)
   */
  init() {
    if (this.isInitialized) return;
    
    try {
      this.setupBasicAnimations();
      this.isInitialized = true;
      console.log('✅ Animation Manager initialized (basic mode)');
    } catch (error) {
      console.warn('Animation Manager failed to initialize:', error);
      // Continue without animations rather than blocking startup
    }
  }
  
  /**
   * Setup basic animations without complex observers
   */
  setupBasicAnimations() {
    // Add basic CSS for animations
    const style = document.createElement('style');
    style.textContent = `
      .animate-fade-in {
        opacity: 0;
        animation: fadeIn 0.6s ease forwards;
      }
      
      .animate-slide-up {
        opacity: 0;
        transform: translateY(20px);
        animation: slideUp 0.6s ease forwards;
      }
      
      @keyframes fadeIn {
        to { opacity: 1; }
      }
      
      @keyframes slideUp {
        to { 
          opacity: 1; 
          transform: translateY(0); 
        }
      }
      
      /* Respect reduced motion preference */
      @media (prefers-reduced-motion: reduce) {
        .animate-fade-in,
        .animate-slide-up {
          animation: none !important;
          opacity: 1 !important;
          transform: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Simple scroll-based animation trigger
    if ('IntersectionObserver' in window) {
      try {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !this.reducedMotion) {
              entry.target.classList.add('animate-fade-in');
            }
          });
        }, { threshold: 0.1 });
        
        // Observe sections
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => observer.observe(section));
      } catch (error) {
        console.warn('Could not setup intersection observer:', error);
      }
    }
  }
  
  /**
   * Update animation state based on reduced motion preference
   */
  updateAnimationState() {
    try {
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      if (this.reducedMotion) {
        document.body.classList.add('reduce-motion');
      } else {
        document.body.classList.remove('reduce-motion');
      }
    } catch (error) {
      console.warn('Could not update animation state:', error);
    }
  }
  
  /**
   * Cleanup
   */
  destroy() {
    this.isInitialized = false;
  }
}