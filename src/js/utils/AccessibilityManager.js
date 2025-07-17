/**
 * Accessibility Manager Utility (Simplified)
 * Basic accessibility features without complex operations that could cause startup failures
 */

export class AccessibilityManager {
  constructor(app) {
    this.app = app;
    this.isInitialized = false;
  }
  
  /**
   * Initialize accessibility features (simplified to prevent startup failures)
   */
  init() {
    if (this.isInitialized) return;
    
    try {
      // Basic accessibility setup without complex operations
      this.setupBasicAccessibility();
      this.isInitialized = true;
      console.log('✅ Accessibility manager initialized (basic mode)');
    } catch (error) {
      console.warn('Accessibility manager failed to initialize:', error);
      // Continue without accessibility features rather than blocking startup
    }
  }
  
  /**
   * Setup basic accessibility features
   */
  setupBasicAccessibility() {
    // Add basic ARIA live region
    if (!document.getElementById('aria-announcements')) {
      const liveRegion = document.createElement('div');
      liveRegion.id = 'aria-announcements';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.style.cssText = `
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0,0,0,0) !important;
        border: 0 !important;
      `;
      document.body.appendChild(liveRegion);
    }
    
    // Basic keyboard support
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Close any open modals
        const modal = document.querySelector('.modal.active, .project-modal.active');
        if (modal) {
          const closeBtn = modal.querySelector('.modal-close');
          if (closeBtn) closeBtn.click();
        }
      }
    });
  }
  
  /**
   * Announce message to screen readers (simplified)
   */
  announce(message) {
    try {
      const liveRegion = document.getElementById('aria-announcements');
      if (liveRegion) {
        liveRegion.textContent = message;
        setTimeout(() => {
          liveRegion.textContent = '';
        }, 1000);
      }
    } catch (error) {
      console.warn('Failed to announce message:', error);
    }
  }
  
  /**
   * Destroy accessibility manager
   */
  destroy() {
    this.isInitialized = false;
    console.log('Accessibility manager destroyed');
  }
}