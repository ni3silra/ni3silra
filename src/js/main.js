/**
 * Main Application Entry Point
 * Modular JavaScript architecture with ES6 modules
 */

import { App } from './core/App.js';
import { ThemeManager } from './utils/ThemeManager.js';
import { PerformanceMonitor } from './utils/PerformanceMonitor.js';

/**
 * Initialize the application with robust error handling
 */
async function init() {
  let perfMonitor = null;
  let themeManager = null;
  let app = null;
  
  try {
    // Start performance monitoring with error handling
    try {
      perfMonitor = new PerformanceMonitor();
      perfMonitor.start();
    } catch (perfError) {
      console.warn('Performance monitoring failed to start:', perfError);
    }
    
    // Initialize theme system with error handling
    try {
      themeManager = new ThemeManager();
      themeManager.init();
    } catch (themeError) {
      console.warn('Theme manager failed to initialize:', themeError);
      // Apply basic theme fallback
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.style.setProperty('--primary-color', '#2563eb');
      document.documentElement.style.setProperty('--text-color', '#1f2937');
      document.documentElement.style.setProperty('--bg-color', '#ffffff');
    }
    
    // Initialize main application with error handling
    try {
      app = new App();
      await app.init();
    } catch (appError) {
      console.error('App initialization failed:', appError);
      // Show basic content instead of complete failure
      showFallbackContent();
      return;
    }
    
    // Mark app as ready and hide loading screen
    document.body.classList.add('app-ready');
    hideLoadingScreen();
    
    // Log performance metrics if available
    if (perfMonitor) {
      try {
        perfMonitor.logMetrics();
      } catch (logError) {
        console.warn('Failed to log performance metrics:', logError);
      }
    }
    
    console.log('🚀 Backend Developer Portfolio loaded successfully');
    
  } catch (error) {
    console.error('❌ Critical initialization failure:', error);
    showCriticalError(error);
  }
}

/**
 * Hide loading screen safely
 */
function hideLoadingScreen() {
  try {
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
      // Force hide immediately to prevent layout issues
      loadingScreen.style.opacity = '0';
      loadingScreen.style.visibility = 'hidden';
      loadingScreen.style.pointerEvents = 'none';
      loadingScreen.style.zIndex = '-1';
      
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 300);
    }
  } catch (error) {
    console.warn('Failed to hide loading screen:', error);
    // Force hide even if there's an error
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
      loadingScreen.style.display = 'none';
    }
  }
}

/**
 * Show fallback content when app fails to initialize
 */
function showFallbackContent() {
  hideLoadingScreen();
  
  const appElement = document.getElementById('app');
  if (appElement) {
    appElement.innerHTML = `
      <div class="fallback-content">
        <header class="fallback-header">
          <h1>Backend Developer Portfolio</h1>
          <p>Welcome to my professional portfolio</p>
        </header>
        
        <main class="fallback-main">
          <section class="fallback-section">
            <h2>About Me</h2>
            <p>I'm a backend developer with expertise in modern web technologies.</p>
          </section>
          
          <section class="fallback-section">
            <h2>Contact</h2>
            <p>Email: <a href="mailto:contact@example.com">contact@example.com</a></p>
            <p>GitHub: <a href="https://github.com/username" target="_blank">github.com/username</a></p>
          </section>
        </main>
        
        <div class="fallback-notice">
          <p>⚠️ Some features are temporarily unavailable. Please refresh the page.</p>
          <button onclick="window.location.reload()" class="refresh-btn">Refresh Page</button>
        </div>
      </div>
    `;
    
    // Add basic styling
    const style = document.createElement('style');
    style.textContent = `
      .fallback-content { max-width: 800px; margin: 2rem auto; padding: 2rem; font-family: system-ui, sans-serif; }
      .fallback-header { text-align: center; margin-bottom: 3rem; }
      .fallback-header h1 { color: #2563eb; margin-bottom: 0.5rem; }
      .fallback-section { margin-bottom: 2rem; }
      .fallback-section h2 { color: #1f2937; margin-bottom: 1rem; }
      .fallback-notice { background: #fef3c7; padding: 1rem; border-radius: 8px; text-align: center; margin-top: 2rem; }
      .refresh-btn { background: #2563eb; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
      .refresh-btn:hover { background: #1d4ed8; }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Show critical error message
 */
function showCriticalError(error) {
  const loadingScreen = document.querySelector('.loading-screen');
  if (loadingScreen) {
    loadingScreen.innerHTML = `
      <div class="error-message">
        <h2>⚠️ Application Error</h2>
        <p>The portfolio failed to load properly.</p>
        <details>
          <summary>Technical Details</summary>
          <pre>${error.message || 'Unknown error'}</pre>
        </details>
        <button onclick="window.location.reload()" class="error-retry-btn">
          🔄 Retry
        </button>
      </div>
    `;
    
    // Add error styling
    const errorStyle = document.createElement('style');
    errorStyle.textContent = `
      .error-message { 
        background: white; padding: 2rem; border-radius: 8px; max-width: 500px; 
        margin: 2rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;
        font-family: system-ui, sans-serif;
      }
      .error-message h2 { color: #dc2626; margin-bottom: 1rem; }
      .error-message details { margin: 1rem 0; text-align: left; }
      .error-message pre { background: #f3f4f6; padding: 1rem; border-radius: 4px; overflow: auto; }
      .error-retry-btn { 
        background: #2563eb; color: white; border: none; padding: 0.75rem 1.5rem; 
        border-radius: 4px; cursor: pointer; font-size: 1rem;
      }
      .error-retry-btn:hover { background: #1d4ed8; }
    `;
    document.head.appendChild(errorStyle);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

// Handle global errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

// Export for potential external access
export { init };