/**
 * Critical Path Optimizer (Simplified)
 * Basic optimization without complex operations that could cause startup failures
 */

export class CriticalPathOptimizer {
  constructor() {
    this.isInitialized = false;
  }
  
  /**
   * Initialize critical path optimization (simplified)
   */
  init() {
    if (this.isInitialized) return;
    
    try {
      this.setupBasicOptimizations();
      this.isInitialized = true;
      console.log('✅ Critical Path Optimizer initialized (basic mode)');
    } catch (error) {
      console.warn('Critical Path Optimizer failed to initialize:', error);
      // Continue without optimizations rather than blocking startup
    }
  }
  
  /**
   * Setup basic optimizations
   */
  setupBasicOptimizations() {
    // Add basic critical CSS if not present
    if (!document.querySelector('style[data-critical]')) {
      const criticalCSS = `
        body { 
          margin: 0; 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          line-height: 1.6;
        }
        .loading-screen { 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          min-height: 100vh; 
          background: #f8fafc;
        }
        .btn { 
          padding: 0.5rem 1rem; 
          border: none; 
          border-radius: 4px; 
          cursor: pointer; 
          font-size: 1rem;
          transition: all 0.2s ease;
        }
        .btn-primary { 
          background: #3b82f6; 
          color: white; 
        }
        .sr-only { 
          position: absolute !important; 
          width: 1px !important; 
          height: 1px !important; 
          padding: 0 !important; 
          margin: -1px !important; 
          overflow: hidden !important; 
          clip: rect(0,0,0,0) !important; 
          border: 0 !important; 
        }
      `;
      
      const style = document.createElement('style');
      style.textContent = criticalCSS;
      style.setAttribute('data-critical', 'basic');
      document.head.appendChild(style);
    }
    
    // Basic resource hints (safe ones only)
    this.addBasicResourceHints();
  }
  
  /**
   * Add basic resource hints
   */
  addBasicResourceHints() {
    try {
      // Only add safe resource hints that won't cause CORS issues
      const hints = [
        { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true }
      ];
      
      hints.forEach(hint => {
        const existing = document.querySelector(`link[rel="${hint.rel}"][href="${hint.href}"]`);
        if (!existing) {
          const link = document.createElement('link');
          link.rel = hint.rel;
          link.href = hint.href;
          if (hint.crossorigin) link.crossOrigin = 'anonymous';
          document.head.appendChild(link);
        }
      });
    } catch (error) {
      console.warn('Could not add resource hints:', error);
    }
  }
  
  /**
   * Get basic performance metrics
   */
  getPerformanceMetrics() {
    try {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0,
        loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
        available: true
      };
    } catch (error) {
      return { available: false, error: error.message };
    }
  }
  
  /**
   * Cleanup
   */
  destroy() {
    this.isInitialized = false;
  }
}