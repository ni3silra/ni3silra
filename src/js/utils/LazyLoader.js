/**
 * LazyLoader Utility
 * Implements Intersection Observer for lazy loading images and content
 */

export class LazyLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: '50px 0px',
      threshold: 0.1,
      loadingClass: 'lazy-loading',
      loadedClass: 'lazy-loaded',
      errorClass: 'lazy-error',
      ...options
    };
    
    this.observer = null;
    this.loadedImages = new Set();
    this.loadingImages = new Set();
    
    this.init();
  }
  
  /**
   * Initialize the lazy loader
   */
  init() {
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver
      this.loadAllImages();
      return;
    }
    
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      this.options
    );
    
    this.observeImages();
    this.observeContent();
  }
  
  /**
   * Handle intersection observer entries
   */
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        
        if (element.tagName === 'IMG' || element.hasAttribute('data-src')) {
          this.loadImage(element);
        } else {
          this.loadContent(element);
        }
        
        this.observer.unobserve(element);
      }
    });
  }
  
  /**
   * Observe all images with data-src attribute
   */
  observeImages() {
    const lazyImages = document.querySelectorAll('img[data-src], [data-bg-src]');
    
    lazyImages.forEach(img => {
      // Add loading placeholder
      this.addLoadingPlaceholder(img);
      this.observer.observe(img);
    });
  }
  
  /**
   * Observe content elements for lazy loading
   */
  observeContent() {
    const lazyContent = document.querySelectorAll('[data-lazy-content]');
    
    lazyContent.forEach(element => {
      this.observer.observe(element);
    });
  }
  
  /**
   * Load a single image
   */
  async loadImage(element) {
    if (this.loadingImages.has(element) || this.loadedImages.has(element)) {
      return;
    }
    
    this.loadingImages.add(element);
    element.classList.add(this.options.loadingClass);
    
    try {
      const src = element.dataset.src || element.dataset.bgSrc;
      if (!src) return;
      
      // Create new image to preload
      const img = new Image();
      
      // Handle different image formats
      const optimizedSrc = this.getOptimizedImageSrc(src);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = optimizedSrc;
      });
      
      // Apply the loaded image
      if (element.dataset.bgSrc) {
        element.style.backgroundImage = `url(${optimizedSrc})`;
      } else {
        element.src = optimizedSrc;
        element.removeAttribute('data-src');
      }
      
      // Update classes
      element.classList.remove(this.options.loadingClass);
      element.classList.add(this.options.loadedClass);
      
      // Remove placeholder
      this.removeLoadingPlaceholder(element);
      
      this.loadedImages.add(element);
      this.loadingImages.delete(element);
      
      // Trigger custom event
      element.dispatchEvent(new CustomEvent('lazyload:loaded', {
        detail: { src: optimizedSrc }
      }));
      
    } catch (error) {
      console.error('Failed to load image:', error);
      
      element.classList.remove(this.options.loadingClass);
      element.classList.add(this.options.errorClass);
      
      this.loadingImages.delete(element);
      
      // Show error placeholder
      this.showErrorPlaceholder(element);
      
      element.dispatchEvent(new CustomEvent('lazyload:error', {
        detail: { error }
      }));
    }
  }
  
  /**
   * Load content element
   */
  loadContent(element) {
    element.classList.add(this.options.loadedClass);
    
    // Trigger entrance animation
    if (element.dataset.lazyAnimation) {
      element.style.animationName = element.dataset.lazyAnimation;
    }
    
    element.dispatchEvent(new CustomEvent('lazyload:content-loaded'));
  }
  
  /**
   * Get optimized image source with WebP support
   */
  getOptimizedImageSrc(src) {
    // Check if browser supports WebP
    if (this.supportsWebP() && !src.includes('.webp')) {
      // Try to get WebP version
      const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      return webpSrc;
    }
    
    return src;
  }
  
  /**
   * Check if browser supports WebP
   */
  supportsWebP() {
    if (this._webpSupport !== undefined) {
      return this._webpSupport;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    this._webpSupport = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    return this._webpSupport;
  }
  
  /**
   * Add loading placeholder to element
   */
  addLoadingPlaceholder(element) {
    if (element.tagName === 'IMG') {
      // Create skeleton placeholder for images
      const placeholder = document.createElement('div');
      placeholder.className = 'lazy-placeholder skeleton';
      placeholder.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite;
        border-radius: inherit;
      `;
      
      // Make parent relative if needed
      const parent = element.parentElement;
      if (getComputedStyle(parent).position === 'static') {
        parent.style.position = 'relative';
      }
      
      parent.appendChild(placeholder);
      element.dataset.placeholderId = placeholder.className + Date.now();
    }
  }
  
  /**
   * Remove loading placeholder
   */
  removeLoadingPlaceholder(element) {
    if (element.tagName === 'IMG') {
      const parent = element.parentElement;
      const placeholder = parent.querySelector('.lazy-placeholder');
      
      if (placeholder) {
        placeholder.style.opacity = '0';
        setTimeout(() => {
          if (placeholder.parentElement) {
            placeholder.parentElement.removeChild(placeholder);
          }
        }, 300);
      }
    }
  }
  
  /**
   * Show error placeholder
   */
  showErrorPlaceholder(element) {
    if (element.tagName === 'IMG') {
      const errorPlaceholder = document.createElement('div');
      errorPlaceholder.className = 'lazy-error-placeholder';
      errorPlaceholder.innerHTML = `
        <div class="error-icon">📷</div>
        <div class="error-text">Failed to load image</div>
      `;
      errorPlaceholder.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: #f5f5f5;
        color: #666;
        font-size: 0.875rem;
        border-radius: inherit;
      `;
      
      const parent = element.parentElement;
      parent.appendChild(errorPlaceholder);
    }
  }
  
  /**
   * Load all images immediately (fallback)
   */
  loadAllImages() {
    const lazyImages = document.querySelectorAll('img[data-src], [data-bg-src]');
    
    lazyImages.forEach(element => {
      const src = element.dataset.src || element.dataset.bgSrc;
      if (src) {
        if (element.dataset.bgSrc) {
          element.style.backgroundImage = `url(${src})`;
        } else {
          element.src = src;
          element.removeAttribute('data-src');
        }
        element.classList.add(this.options.loadedClass);
      }
    });
  }
  
  /**
   * Manually observe new elements
   */
  observe(element) {
    if (this.observer) {
      this.observer.observe(element);
    }
  }
  
  /**
   * Unobserve element
   */
  unobserve(element) {
    if (this.observer) {
      this.observer.unobserve(element);
    }
  }
  
  /**
   * Refresh - observe new lazy elements
   */
  refresh() {
    this.observeImages();
    this.observeContent();
  }
  
  /**
   * Get loading statistics
   */
  getStats() {
    return {
      loaded: this.loadedImages.size,
      loading: this.loadingImages.size,
      total: this.loadedImages.size + this.loadingImages.size
    };
  }
  
  /**
   * Destroy the lazy loader
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    this.loadedImages.clear();
    this.loadingImages.clear();
  }
}

// CSS for skeleton loading animation
const skeletonCSS = `
@keyframes skeleton-loading {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.lazy-placeholder.skeleton {
  background: linear-gradient(90deg, 
    var(--skeleton-base, #f0f0f0) 25%, 
    var(--skeleton-highlight, #e0e0e0) 50%, 
    var(--skeleton-base, #f0f0f0) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

[data-theme="dark"] .lazy-placeholder.skeleton {
  background: linear-gradient(90deg, 
    var(--skeleton-base, #374151) 25%, 
    var(--skeleton-highlight, #4b5563) 50%, 
    var(--skeleton-base, #374151) 75%);
}

.lazy-loading {
  opacity: 0.7;
}

.lazy-loaded {
  opacity: 1;
  transition: opacity 0.3s ease;
}

.lazy-error {
  opacity: 0.5;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .lazy-placeholder.skeleton {
    animation: none;
    background: var(--skeleton-base, #f0f0f0);
  }
  
  .lazy-loaded {
    transition: none;
  }
}
`;

// Inject skeleton CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = skeletonCSS;
  document.head.appendChild(style);
}

// Export default instance for convenience
export const lazyLoader = new LazyLoader();