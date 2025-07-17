/**
 * Performance Monitor Utility
 * Tracks and reports application performance metrics
 */

export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.startTime = performance.now();
  }
  
  /**
   * Start performance monitoring
   */
  start() {
    this.recordMetric('app_start', performance.now());
    
    // Monitor page load performance
    this.monitorPageLoad();
    
    // Monitor resource loading
    this.monitorResources();
    
    // Monitor long tasks (if supported)
    this.monitorLongTasks();
  }
  
  /**
   * Record a performance metric
   * @param {string} name - Metric name
   * @param {number} value - Metric value
   * @param {Object} [metadata] - Additional metadata
   */
  recordMetric(name, value, metadata = {}) {
    this.metrics.set(name, {
      value,
      timestamp: performance.now(),
      metadata
    });
  }
  
  /**
   * Start timing a operation
   * @param {string} name - Operation name
   */
  startTiming(name) {
    this.recordMetric(`${name}_start`, performance.now());
  }
  
  /**
   * End timing a operation
   * @param {string} name - Operation name
   */
  endTiming(name) {
    const startMetric = this.metrics.get(`${name}_start`);
    if (startMetric) {
      const duration = performance.now() - startMetric.value;
      this.recordMetric(`${name}_duration`, duration);
    }
  }
  
  /**
   * Monitor page load performance
   */
  monitorPageLoad() {
    if (document.readyState === 'complete') {
      this.recordPageLoadMetrics();
    } else {
      window.addEventListener('load', () => {
        this.recordPageLoadMetrics();
      });
    }
  }
  
  /**
   * Record page load metrics using modern Performance API
   */
  recordPageLoadMetrics() {
    // Use modern Navigation Timing API
    if (performance.getEntriesByType) {
      const navigationEntries = performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0];
        
        // Core timing metrics
        this.recordMetric('dns_lookup', nav.domainLookupEnd - nav.domainLookupStart);
        this.recordMetric('tcp_connect', nav.connectEnd - nav.connectStart);
        this.recordMetric('request_response', nav.responseEnd - nav.requestStart);
        this.recordMetric('dom_processing', nav.domComplete - nav.domLoading);
        this.recordMetric('page_load', nav.loadEventEnd - nav.fetchStart);
        
        // Navigation type
        this.recordMetric('navigation_type', 0, {
          type: nav.type || 'navigate'
        });
      }
    }
    
    // Fallback to deprecated API if modern one isn't available
    else if (performance.timing) {
      const timing = performance.timing;
      const navigation = performance.navigation;
      
      this.recordMetric('dns_lookup', timing.domainLookupEnd - timing.domainLookupStart);
      this.recordMetric('tcp_connect', timing.connectEnd - timing.connectStart);
      this.recordMetric('request_response', timing.responseEnd - timing.requestStart);
      this.recordMetric('dom_processing', timing.domComplete - timing.domLoading);
      this.recordMetric('page_load', timing.loadEventEnd - timing.navigationStart);
      
      const navTypes = ['navigate', 'reload', 'back_forward', 'prerender'];
      this.recordMetric('navigation_type', navigation.type, {
        type: navTypes[navigation.type] || 'unknown'
      });
    }
  }
  
  /**
   * Monitor resource loading
   */
  monitorResources() {
    if (!performance.getEntriesByType) return;
    
    const resources = performance.getEntriesByType('resource');
    let totalSize = 0;
    const resourceTypes = {};
    
    resources.forEach(resource => {
      const type = this.getResourceType(resource.name);
      resourceTypes[type] = (resourceTypes[type] || 0) + 1;
      
      if (resource.transferSize) {
        totalSize += resource.transferSize;
      }
    });
    
    this.recordMetric('total_resources', resources.length);
    this.recordMetric('total_transfer_size', totalSize);
    this.recordMetric('resource_types', 0, resourceTypes);
  }
  
  /**
   * Monitor long tasks (performance bottlenecks)
   */
  monitorLongTasks() {
    if (!window.PerformanceObserver) return;
    
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          this.recordMetric('long_task', entry.duration, {
            startTime: entry.startTime,
            name: entry.name
          });
        });
      });
      
      observer.observe({ entryTypes: ['longtask'] });
      this.observers.set('longtask', observer);
    } catch (error) {
      console.warn('Long task monitoring not supported:', error);
    }
  }
  
  /**
   * Get resource type from URL
   * @param {string} url - Resource URL
   * @returns {string} Resource type
   */
  getResourceType(url) {
    if (url.includes('.css')) return 'css';
    if (url.includes('.js')) return 'javascript';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|otf)$/i)) return 'font';
    return 'other';
  }
  
  /**
   * Get all recorded metrics
   * @returns {Object} All metrics
   */
  getMetrics() {
    const result = {};
    this.metrics.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }
  
  /**
   * Get specific metric
   * @param {string} name - Metric name
   * @returns {Object|null} Metric data
   */
  getMetric(name) {
    return this.metrics.get(name) || null;
  }
  
  /**
   * Log performance summary to console
   */
  logMetrics() {
    const metrics = this.getMetrics();
    
    console.group('🚀 Performance Metrics');
    
    // Page load metrics
    if (metrics.page_load) {
      console.log(`📊 Page Load: ${metrics.page_load.value.toFixed(2)}ms`);
    }
    
    // Resource metrics
    if (metrics.total_resources) {
      console.log(`📦 Resources: ${metrics.total_resources.value}`);
    }
    
    if (metrics.total_transfer_size) {
      const sizeKB = (metrics.total_transfer_size.value / 1024).toFixed(2);
      console.log(`💾 Transfer Size: ${sizeKB}KB`);
    }
    
    // Long tasks
    const longTasks = Array.from(this.metrics.entries())
      .filter(([key]) => key === 'long_task');
    
    if (longTasks.length > 0) {
      console.warn(`⚠️ Long Tasks: ${longTasks.length} detected`);
    }
    
    console.groupEnd();
  }
  
  /**
   * Check if performance is within acceptable thresholds
   * @returns {Object} Performance status
   */
  checkPerformance() {
    const metrics = this.getMetrics();
    const issues = [];
    
    // Check page load time (should be < 3000ms)
    if (metrics.page_load && metrics.page_load.value > 3000) {
      issues.push('Page load time exceeds 3 seconds');
    }
    
    // Check bundle size (should be < 100KB for this project)
    if (metrics.total_transfer_size && metrics.total_transfer_size.value > 100 * 1024) {
      issues.push('Bundle size exceeds 100KB');
    }
    
    // Check for long tasks
    const longTaskCount = Array.from(this.metrics.keys())
      .filter(key => key === 'long_task').length;
    
    if (longTaskCount > 0) {
      issues.push(`${longTaskCount} long tasks detected`);
    }
    
    return {
      isGood: issues.length === 0,
      issues,
      metrics
    };
  }
  
  /**
   * Clean up observers
   */
  destroy() {
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();
  }
}