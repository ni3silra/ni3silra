/**
 * Bundle Size Analyzer
 * Monitors and validates bundle size requirements
 */

export class BundleAnalyzer {
  constructor() {
    this.sizeLimit = 100 * 1024; // 100KB limit
    this.resources = new Map();
    this.analysis = {
      total: 0,
      javascript: 0,
      css: 0,
      images: 0,
      fonts: 0,
      other: 0
    };
  }

  /**
   * Analyze current bundle size
   */
  async analyze() {
    console.group('📦 Bundle Size Analysis');
    
    try {
      await this.collectResourceData();
      this.categorizeResources();
      this.generateReport();
      
      return this.analysis;
    } catch (error) {
      console.error('Bundle analysis failed:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * Collect resource data from Performance API
   */
  async collectResourceData() {
    if (!performance.getEntriesByType) {
      throw new Error('Performance API not supported');
    }

    const resources = performance.getEntriesByType('resource');
    
    resources.forEach(resource => {
      const resourceData = {
        name: resource.name,
        size: resource.transferSize || resource.encodedBodySize || 0,
        decodedSize: resource.decodedBodySize || 0,
        type: this.getResourceType(resource.name),
        cached: resource.transferSize === 0 && resource.decodedBodySize > 0,
        compressed: resource.encodedBodySize < resource.decodedBodySize
      };
      
      this.resources.set(resource.name, resourceData);
    });

    // Also check for inline resources
    await this.analyzeInlineResources();
  }

  /**
   * Analyze inline CSS and JavaScript
   */
  async analyzeInlineResources() {
    // Analyze inline CSS
    const styleElements = document.querySelectorAll('style');
    let inlineCSSSize = 0;
    
    styleElements.forEach(style => {
      inlineCSSSize += style.textContent.length;
    });

    if (inlineCSSSize > 0) {
      this.resources.set('inline-css', {
        name: 'inline-css',
        size: inlineCSSSize,
        decodedSize: inlineCSSSize,
        type: 'css',
        cached: false,
        compressed: false
      });
    }

    // Analyze inline JavaScript
    const scriptElements = document.querySelectorAll('script:not([src])');
    let inlineJSSize = 0;
    
    scriptElements.forEach(script => {
      inlineJSSize += script.textContent.length;
    });

    if (inlineJSSize > 0) {
      this.resources.set('inline-js', {
        name: 'inline-js',
        size: inlineJSSize,
        decodedSize: inlineJSSize,
        type: 'javascript',
        cached: false,
        compressed: false
      });
    }
  }

  /**
   * Categorize resources by type
   */
  categorizeResources() {
    this.resources.forEach(resource => {
      this.analysis.total += resource.size;
      
      switch (resource.type) {
        case 'javascript':
          this.analysis.javascript += resource.size;
          break;
        case 'css':
          this.analysis.css += resource.size;
          break;
        case 'image':
          this.analysis.images += resource.size;
          break;
        case 'font':
          this.analysis.fonts += resource.size;
          break;
        default:
          this.analysis.other += resource.size;
      }
    });
  }

  /**
   * Get resource type from URL or name
   */
  getResourceType(url) {
    if (url.includes('inline-css') || url.includes('.css')) return 'css';
    if (url.includes('inline-js') || url.includes('.js')) return 'javascript';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|otf|eot)$/i)) return 'font';
    if (url.match(/\.(html|htm)$/i)) return 'html';
    return 'other';
  }

  /**
   * Generate detailed report
   */
  generateReport() {
    const totalKB = (this.analysis.total / 1024).toFixed(2);
    const limitKB = (this.sizeLimit / 1024).toFixed(2);
    const withinLimit = this.analysis.total <= this.sizeLimit;
    
    console.log(`📊 Total Bundle Size: ${totalKB}KB / ${limitKB}KB`);
    console.log(`${withinLimit ? '✅' : '❌'} Within Size Limit: ${withinLimit}`);
    
    // Breakdown by type
    console.group('📋 Size Breakdown:');
    console.log(`🟨 JavaScript: ${(this.analysis.javascript / 1024).toFixed(2)}KB (${this.getPercentage(this.analysis.javascript)}%)`);
    console.log(`🟦 CSS: ${(this.analysis.css / 1024).toFixed(2)}KB (${this.getPercentage(this.analysis.css)}%)`);
    console.log(`🟩 Images: ${(this.analysis.images / 1024).toFixed(2)}KB (${this.getPercentage(this.analysis.images)}%)`);
    console.log(`🟪 Fonts: ${(this.analysis.fonts / 1024).toFixed(2)}KB (${this.getPercentage(this.analysis.fonts)}%)`);
    console.log(`⬜ Other: ${(this.analysis.other / 1024).toFixed(2)}KB (${this.getPercentage(this.analysis.other)}%)`);
    console.groupEnd();

    // Largest resources
    const sortedResources = Array.from(this.resources.values())
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);

    if (sortedResources.length > 0) {
      console.group('📈 Largest Resources:');
      sortedResources.forEach((resource, index) => {
        const sizeKB = (resource.size / 1024).toFixed(2);
        const name = resource.name.split('/').pop() || resource.name;
        console.log(`${index + 1}. ${name}: ${sizeKB}KB (${resource.type})`);
      });
      console.groupEnd();
    }

    // Optimization suggestions
    this.generateOptimizationSuggestions();
  }

  /**
   * Generate optimization suggestions
   */
  generateOptimizationSuggestions() {
    const suggestions = [];
    
    // Check if over limit
    if (this.analysis.total > this.sizeLimit) {
      const excess = ((this.analysis.total - this.sizeLimit) / 1024).toFixed(2);
      suggestions.push(`Bundle is ${excess}KB over the limit`);
    }

    // Check JavaScript size
    if (this.analysis.javascript > 50 * 1024) { // 50KB threshold
      suggestions.push('JavaScript bundle is large - consider code splitting');
    }

    // Check image optimization
    const unoptimizedImages = Array.from(this.resources.values())
      .filter(r => r.type === 'image' && !r.name.includes('.webp') && !r.name.includes('.svg'))
      .length;
    
    if (unoptimizedImages > 0) {
      suggestions.push(`${unoptimizedImages} images could be optimized (use WebP format)`);
    }

    // Check compression
    const uncompressedResources = Array.from(this.resources.values())
      .filter(r => r.size > 1024 && !r.compressed) // Resources > 1KB that aren't compressed
      .length;
    
    if (uncompressedResources > 0) {
      suggestions.push(`${uncompressedResources} resources could benefit from compression`);
    }

    if (suggestions.length > 0) {
      console.group('💡 Optimization Suggestions:');
      suggestions.forEach((suggestion, index) => {
        console.log(`${index + 1}. ${suggestion}`);
      });
      console.groupEnd();
    } else {
      console.log('✨ Bundle is well optimized!');
    }
  }

  /**
   * Get percentage of total
   */
  getPercentage(size) {
    if (this.analysis.total === 0) return 0;
    return ((size / this.analysis.total) * 100).toFixed(1);
  }

  /**
   * Check if bundle meets requirements
   */
  meetsRequirements() {
    return {
      withinSizeLimit: this.analysis.total <= this.sizeLimit,
      totalSize: this.analysis.total,
      sizeLimit: this.sizeLimit,
      breakdown: this.analysis,
      largestResources: Array.from(this.resources.values())
        .sort((a, b) => b.size - a.size)
        .slice(0, 5)
    };
  }

  /**
   * Monitor bundle size continuously
   */
  startMonitoring(interval = 30000) { // Check every 30 seconds
    const monitor = setInterval(async () => {
      try {
        await this.analyze();
        const status = this.meetsRequirements();
        
        if (!status.withinSizeLimit) {
          console.warn('⚠️ Bundle size exceeded limit!', status);
        }
      } catch (error) {
        console.error('Bundle monitoring error:', error);
      }
    }, interval);

    return monitor;
  }
}

// Export for use in tests and monitoring
if (typeof window !== 'undefined') {
  window.BundleAnalyzer = BundleAnalyzer;
}