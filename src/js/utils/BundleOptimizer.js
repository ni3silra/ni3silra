/**
 * Bundle Optimizer Utility
 * Handles code splitting, minification, and bundle optimization
 */

export class BundleOptimizer {
  constructor() {
    this.loadedModules = new Set();
    this.moduleCache = new Map();
    this.criticalCSS = new Set();
    this.deferredCSS = new Set();
  }
  
  /**
   * Initialize bundle optimization
   */
  init() {
    this.extractCriticalCSS();
    this.setupDynamicImports();
    this.optimizeImages();
    this.setupServiceWorker();
    
    console.log('Bundle optimizer initialized');
  }
  
  /**
   * Extract and inline critical CSS (disabled to prevent CORS issues)
   */
  extractCriticalCSS() {
    // CSS extraction disabled to prevent CORS and startup failures
    // Critical CSS should be handled at build time or manually inlined
    console.log('Critical CSS extraction skipped to prevent CORS issues');
    
    // Instead, ensure basic critical styles are available
    this.ensureBasicStyles();
  }
  
  /**
   * Ensure basic critical styles are available
   */
  ensureBasicStyles() {
    // Add minimal critical styles if none exist
    const existingCritical = document.querySelector('style[data-critical]');
    if (!existingCritical) {
      const criticalStyles = `
        body { margin: 0; font-family: system-ui, sans-serif; }
        .loading-screen { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
        .btn { padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; }
        .btn-primary { background: #2563eb; color: white; }
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0; }
      `;
      
      const style = document.createElement('style');
      style.textContent = criticalStyles;
      style.setAttribute('data-critical', 'fallback');
      document.head.appendChild(style);
    }
  }
  
  /**
   * Inline critical CSS in document head
   */
  inlineCriticalCSS(css) {
    const style = document.createElement('style');
    style.textContent = css;
    style.setAttribute('data-critical', 'true');
    
    // Insert before first stylesheet
    const firstStylesheet = document.querySelector('link[rel="stylesheet"]');
    if (firstStylesheet) {
      document.head.insertBefore(style, firstStylesheet);
    } else {
      document.head.appendChild(style);
    }
  }
  
  /**
   * Set up dynamic imports for code splitting (disabled to prevent startup failures)
   */
  setupDynamicImports() {
    // Module preloading disabled to prevent startup failures
    console.log('Module preloading skipped to prevent startup issues');
    
    // Set up intersection observer for lazy loading modules (optional)
    try {
      this.setupModuleLazyLoading();
    } catch (error) {
      console.warn('Module lazy loading setup failed:', error);
    }
  }
  
  /**
   * Preload a module
   */
  preloadModule(modulePath) {
    if (this.loadedModules.has(modulePath)) {
      return Promise.resolve(this.moduleCache.get(modulePath));
    }
    
    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = modulePath;
    document.head.appendChild(link);
    
    return import(modulePath)
      .then(module => {
        this.loadedModules.add(modulePath);
        this.moduleCache.set(modulePath, module);
        return module;
      })
      .catch(error => {
        console.error(`Failed to preload module ${modulePath}:`, error);
      });
  }
  
  /**
   * Lazy load modules based on viewport intersection
   */
  setupModuleLazyLoading() {
    const moduleMap = {
      '#skills': '/src/js/components/Skills.js',
      '#projects': '/src/js/components/Projects.js',
      '#experience': '/src/js/components/Experience.js',
      '#contact': '/src/js/components/Contact.js'
    };
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const sectionId = '#' + entry.target.id;
            const modulePath = moduleMap[sectionId];
            
            if (modulePath && !this.loadedModules.has(modulePath)) {
              this.loadModule(modulePath);
              observer.unobserve(entry.target);
            }
          }
        });
      },
      {
        rootMargin: '100px 0px',
        threshold: 0.1
      }
    );
    
    // Observe sections
    Object.keys(moduleMap).forEach(selector => {
      const element = document.querySelector(selector);
      if (element) {
        observer.observe(element);
      }
    });
  }
  
  /**
   * Dynamically load a module
   */
  async loadModule(modulePath) {
    if (this.loadedModules.has(modulePath)) {
      return this.moduleCache.get(modulePath);
    }
    
    try {
      console.log(`Loading module: ${modulePath}`);
      const module = await import(modulePath);
      
      this.loadedModules.add(modulePath);
      this.moduleCache.set(modulePath, module);
      
      return module;
    } catch (error) {
      console.error(`Failed to load module ${modulePath}:`, error);
      throw error;
    }
  }
  
  /**
   * Optimize images with modern formats
   */
  optimizeImages() {
    // Convert images to WebP where supported
    if (this.supportsWebP()) {
      this.convertImagesToWebP();
    }
    
    // Set up responsive images
    this.setupResponsiveImages();
    
    // Implement image compression
    this.compressImages();
  }
  
  /**
   * Check WebP support
   */
  supportsWebP() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  
  /**
   * Convert images to WebP format
   */
  convertImagesToWebP() {
    const images = document.querySelectorAll('img[src*=".jpg"], img[src*=".jpeg"], img[src*=".png"]');
    
    images.forEach(img => {
      const originalSrc = img.src;
      const webpSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      
      // Test if WebP version exists
      const testImg = new Image();
      testImg.onload = () => {
        img.src = webpSrc;
        img.dataset.originalSrc = originalSrc;
      };
      testImg.onerror = () => {
        // Keep original if WebP doesn't exist
        console.log(`WebP version not available for: ${originalSrc}`);
      };
      testImg.src = webpSrc;
    });
  }
  
  /**
   * Set up responsive images
   */
  setupResponsiveImages() {
    const images = document.querySelectorAll('img:not([srcset])');
    
    images.forEach(img => {
      const src = img.src || img.dataset.src;
      if (!src) return;
      
      // Generate responsive image sources
      const baseSrc = src.replace(/\.(jpg|jpeg|png|webp)$/i, '');
      const extension = src.match(/\.(jpg|jpeg|png|webp)$/i)?.[0] || '.jpg';
      
      const srcset = [
        `${baseSrc}-400w${extension} 400w`,
        `${baseSrc}-800w${extension} 800w`,
        `${baseSrc}-1200w${extension} 1200w`,
        `${src} 1600w`
      ].join(', ');
      
      img.srcset = srcset;
      img.sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
    });
  }
  
  /**
   * Compress images using canvas
   */
  compressImages() {
    // This would typically be done at build time
    // Here we implement client-side compression for dynamic images
    
    const compressImage = (file, quality = 0.8) => {
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob(resolve, 'image/jpeg', quality);
        };
        
        img.src = URL.createObjectURL(file);
      });
    };
    
    // Expose compression utility
    window.compressImage = compressImage;
  }
  
  /**
   * Set up service worker for caching (disabled to prevent startup failures)
   */
  setupServiceWorker() {
    // Service worker registration disabled to prevent startup failures
    // Can be enabled later when service worker is properly configured
    console.log('Service Worker registration skipped to prevent startup issues');
    
    // Optionally register service worker in background after app is loaded
    setTimeout(() => {
      this.registerServiceWorkerSafely();
    }, 5000);
  }
  
  /**
   * Safely register service worker after app initialization
   */
  registerServiceWorkerSafely() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/src/sw.js')
        .then(registration => {
          console.log('Service Worker registered successfully:', registration);
        })
        .catch(error => {
          console.warn('Service Worker registration failed (non-critical):', error);
        });
    }
  }
  
  /**
   * Show update notification
   */
  showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-text">A new version is available!</span>
        <button class="notification-btn" onclick="this.parentElement.parentElement.remove(); location.reload();">
          Update
        </button>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove();">
          ×
        </button>
      </div>
    `;
    
    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #3b82f6;
      color: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }
  
  /**
   * Minify CSS (basic implementation)
   */
  minifyCSS(css) {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/;\s*}/g, '}') // Remove last semicolon in blocks
      .replace(/\s*{\s*/g, '{') // Clean up braces
      .replace(/}\s*/g, '}')
      .replace(/;\s*/g, ';')
      .replace(/:\s*/g, ':')
      .trim();
  }
  
  /**
   * Minify JavaScript (basic implementation)
   */
  minifyJS(js) {
    return js
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .replace(/\/\/.*$/gm, '') // Remove line comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/;\s*}/g, '}') // Clean up semicolons
      .trim();
  }
  
  /**
   * Get bundle statistics
   */
  getBundleStats() {
    const stats = {
      loadedModules: this.loadedModules.size,
      cachedModules: this.moduleCache.size,
      criticalCSS: this.criticalCSS.size,
      deferredCSS: this.deferredCSS.size,
      totalSize: 0
    };
    
    // Calculate approximate bundle size
    this.moduleCache.forEach((module, path) => {
      // Rough estimation - in real implementation would use actual file sizes
      stats.totalSize += path.length * 100; // Placeholder calculation
    });
    
    return stats;
  }
  
  /**
   * Optimize bundle for production
   */
  optimizeForProduction() {
    // Remove development-only code
    if (process.env.NODE_ENV === 'production') {
      // Remove console.log statements
      this.removeConsoleStatements();
      
      // Minify CSS and JS
      this.minifyAssets();
      
      // Enable compression
      this.enableCompression();
    }
  }
  
  /**
   * Remove console statements in production
   */
  removeConsoleStatements() {
    // This would typically be done at build time
    console.log = () => {};
    console.warn = () => {};
    console.info = () => {};
  }
  
  /**
   * Minify assets
   */
  minifyAssets() {
    // Get all style elements
    const styles = document.querySelectorAll('style');
    styles.forEach(style => {
      if (style.textContent) {
        style.textContent = this.minifyCSS(style.textContent);
      }
    });
  }
  
  /**
   * Enable compression
   */
  enableCompression() {
    // Request compressed assets from server
    if ('CompressionStream' in window) {
      console.log('Compression supported');
    }
  }
}

// Add CSS for update notification animation
const notificationCSS = `
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.update-notification {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.notification-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.notification-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.notification-close {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
`;

// Inject notification CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = notificationCSS;
  document.head.appendChild(style);
}