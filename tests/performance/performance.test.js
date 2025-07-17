/**
 * Performance Testing Suite
 * Tests for load times, bundle size, and animation performance
 */

import { PerformanceMonitor } from '../../src/js/utils/PerformanceMonitor.js';

/**
 * Performance Test Suite
 */
export class PerformanceTestSuite {
  constructor() {
    this.results = [];
    this.thresholds = {
      loadTime: 1000, // Sub-second load time requirement
      bundleSize: 100 * 1024, // 100KB bundle size limit
      animationFPS: 60, // 60fps animation requirement
      firstContentfulPaint: 1500, // FCP should be under 1.5s
      largestContentfulPaint: 2500, // LCP should be under 2.5s
      cumulativeLayoutShift: 0.1, // CLS should be under 0.1
      firstInputDelay: 100 // FID should be under 100ms
    };
  }

  /**
   * Run all performance tests
   */
  async runAllTests() {
    console.group('🚀 Running Performance Tests');
    
    try {
      await this.testLoadTime();
      await this.testBundleSize();
      await this.testAnimationPerformance();
      await this.testWebVitals();
      await this.testResourceOptimization();
      
      this.generateReport();
      
    } catch (error) {
      console.error('Performance testing failed:', error);
      this.results.push({
        test: 'Performance Test Suite',
        status: 'FAILED',
        error: error.message
      });
    }
    
    console.groupEnd();
    return this.results;
  }

  /**
   * Test sub-second load times
   */
  async testLoadTime() {
    console.log('📊 Testing load time performance...');
    
    return new Promise((resolve) => {
      const startTime = performance.now();
      
      // Test DOM content loaded time
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          const domLoadTime = performance.now() - startTime;
          this.validateLoadTime('DOM Content Loaded', domLoadTime);
        });
      } else {
        this.validateLoadTime('DOM Content Loaded', 0); // Already loaded
      }
      
      // Test full page load time
      if (document.readyState !== 'complete') {
        window.addEventListener('load', () => {
          const fullLoadTime = performance.now() - startTime;
          this.validateLoadTime('Full Page Load', fullLoadTime);
          resolve();
        });
      } else {
        // Page already loaded, check navigation timing
        this.checkNavigationTiming();
        resolve();
      }
    });
  }

  /**
   * Validate load time against threshold
   */
  validateLoadTime(testName, loadTime) {
    const passed = loadTime <= this.thresholds.loadTime;
    
    this.results.push({
      test: testName,
      status: passed ? 'PASSED' : 'FAILED',
      value: `${loadTime.toFixed(2)}ms`,
      threshold: `${this.thresholds.loadTime}ms`,
      passed
    });
    
    console.log(`${passed ? '✅' : '❌'} ${testName}: ${loadTime.toFixed(2)}ms (threshold: ${this.thresholds.loadTime}ms)`);
  }

  /**
   * Check navigation timing for load performance
   */
  checkNavigationTiming() {
    if (!performance.getEntriesByType) return;
    
    const navigationEntries = performance.getEntriesByType('navigation');
    if (navigationEntries.length > 0) {
      const nav = navigationEntries[0];
      const loadTime = nav.loadEventEnd - nav.fetchStart;
      this.validateLoadTime('Navigation Timing Load', loadTime);
    }
  }

  /**
   * Test bundle size monitoring
   */
  async testBundleSize() {
    console.log('📦 Testing bundle size...');
    
    if (!performance.getEntriesByType) {
      this.results.push({
        test: 'Bundle Size',
        status: 'SKIPPED',
        reason: 'Performance API not supported'
      });
      return;
    }
    
    const resources = performance.getEntriesByType('resource');
    let totalJSSize = 0;
    let totalCSSSize = 0;
    let totalSize = 0;
    
    resources.forEach(resource => {
      if (resource.transferSize) {
        totalSize += resource.transferSize;
        
        if (resource.name.includes('.js')) {
          totalJSSize += resource.transferSize;
        } else if (resource.name.includes('.css')) {
          totalCSSSize += resource.transferSize;
        }
      }
    });
    
    // Test total bundle size
    const bundlePassed = totalSize <= this.thresholds.bundleSize;
    this.results.push({
      test: 'Total Bundle Size',
      status: bundlePassed ? 'PASSED' : 'FAILED',
      value: `${(totalSize / 1024).toFixed(2)}KB`,
      threshold: `${(this.thresholds.bundleSize / 1024).toFixed(2)}KB`,
      passed: bundlePassed
    });
    
    console.log(`${bundlePassed ? '✅' : '❌'} Total Bundle Size: ${(totalSize / 1024).toFixed(2)}KB`);
    console.log(`  📄 JavaScript: ${(totalJSSize / 1024).toFixed(2)}KB`);
    console.log(`  🎨 CSS: ${(totalCSSSize / 1024).toFixed(2)}KB`);
  }

  /**
   * Test animation performance for 60fps
   */
  async testAnimationPerformance() {
    console.log('🎬 Testing animation performance...');
    
    return new Promise((resolve) => {
      let frameCount = 0;
      let startTime = performance.now();
      let lastFrameTime = startTime;
      const frameTimes = [];
      const testDuration = 1000; // Test for 1 second
      
      function measureFrame() {
        const currentTime = performance.now();
        const frameTime = currentTime - lastFrameTime;
        frameTimes.push(frameTime);
        frameCount++;
        lastFrameTime = currentTime;
        
        if (currentTime - startTime < testDuration) {
          requestAnimationFrame(measureFrame);
        } else {
          // Calculate FPS and frame consistency
          const actualFPS = frameCount / (testDuration / 1000);
          const averageFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
          const maxFrameTime = Math.max(...frameTimes);
          
          // Check if we're hitting 60fps consistently
          const fpsTarget = this.thresholds.animationFPS;
          const fpsPassed = actualFPS >= fpsTarget * 0.9; // Allow 10% tolerance
          const consistencyPassed = maxFrameTime < 20; // No frame should take more than 20ms
          
          this.results.push({
            test: 'Animation FPS',
            status: fpsPassed ? 'PASSED' : 'FAILED',
            value: `${actualFPS.toFixed(1)} FPS`,
            threshold: `${fpsTarget} FPS`,
            passed: fpsPassed
          });
          
          this.results.push({
            test: 'Frame Consistency',
            status: consistencyPassed ? 'PASSED' : 'FAILED',
            value: `${maxFrameTime.toFixed(2)}ms max frame time`,
            threshold: '20ms max frame time',
            passed: consistencyPassed
          });
          
          console.log(`${fpsPassed ? '✅' : '❌'} Animation FPS: ${actualFPS.toFixed(1)} (target: ${fpsTarget})`);
          console.log(`${consistencyPassed ? '✅' : '❌'} Frame Consistency: ${maxFrameTime.toFixed(2)}ms max`);
          
          resolve();
        }
      }
      
      requestAnimationFrame(measureFrame);
    });
  }

  /**
   * Test Core Web Vitals
   */
  async testWebVitals() {
    console.log('📈 Testing Core Web Vitals...');
    
    if (!window.PerformanceObserver) {
      this.results.push({
        test: 'Core Web Vitals',
        status: 'SKIPPED',
        reason: 'PerformanceObserver not supported'
      });
      return;
    }
    
    // Test Largest Contentful Paint (LCP)
    this.observeLCP();
    
    // Test First Input Delay (FID)
    this.observeFID();
    
    // Test Cumulative Layout Shift (CLS)
    this.observeCLS();
    
    // Test First Contentful Paint (FCP)
    this.observeFCP();
  }

  /**
   * Observe Largest Contentful Paint
   */
  observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        const lcp = lastEntry.startTime;
        
        const passed = lcp <= this.thresholds.largestContentfulPaint;
        this.results.push({
          test: 'Largest Contentful Paint (LCP)',
          status: passed ? 'PASSED' : 'FAILED',
          value: `${lcp.toFixed(2)}ms`,
          threshold: `${this.thresholds.largestContentfulPaint}ms`,
          passed
        });
        
        console.log(`${passed ? '✅' : '❌'} LCP: ${lcp.toFixed(2)}ms`);
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.warn('LCP observation not supported:', error);
    }
  }

  /**
   * Observe First Input Delay
   */
  observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          const fid = entry.processingStart - entry.startTime;
          
          const passed = fid <= this.thresholds.firstInputDelay;
          this.results.push({
            test: 'First Input Delay (FID)',
            status: passed ? 'PASSED' : 'FAILED',
            value: `${fid.toFixed(2)}ms`,
            threshold: `${this.thresholds.firstInputDelay}ms`,
            passed
          });
          
          console.log(`${passed ? '✅' : '❌'} FID: ${fid.toFixed(2)}ms`);
        });
      });
      
      observer.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.warn('FID observation not supported:', error);
    }
  }

  /**
   * Observe Cumulative Layout Shift
   */
  observeCLS() {
    try {
      let clsValue = 0;
      
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        const passed = clsValue <= this.thresholds.cumulativeLayoutShift;
        this.results.push({
          test: 'Cumulative Layout Shift (CLS)',
          status: passed ? 'PASSED' : 'FAILED',
          value: clsValue.toFixed(3),
          threshold: this.thresholds.cumulativeLayoutShift.toFixed(3),
          passed
        });
        
        console.log(`${passed ? '✅' : '❌'} CLS: ${clsValue.toFixed(3)}`);
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('CLS observation not supported:', error);
    }
  }

  /**
   * Observe First Contentful Paint
   */
  observeFCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            const fcp = entry.startTime;
            
            const passed = fcp <= this.thresholds.firstContentfulPaint;
            this.results.push({
              test: 'First Contentful Paint (FCP)',
              status: passed ? 'PASSED' : 'FAILED',
              value: `${fcp.toFixed(2)}ms`,
              threshold: `${this.thresholds.firstContentfulPaint}ms`,
              passed
            });
            
            console.log(`${passed ? '✅' : '❌'} FCP: ${fcp.toFixed(2)}ms`);
          }
        });
      });
      
      observer.observe({ entryTypes: ['paint'] });
    } catch (error) {
      console.warn('FCP observation not supported:', error);
    }
  }

  /**
   * Test resource optimization
   */
  async testResourceOptimization() {
    console.log('🔧 Testing resource optimization...');
    
    if (!performance.getEntriesByType) return;
    
    const resources = performance.getEntriesByType('resource');
    let optimizedImages = 0;
    let totalImages = 0;
    let compressedResources = 0;
    let cachedResources = 0;
    
    resources.forEach(resource => {
      // Check image optimization
      if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        totalImages++;
        if (resource.name.includes('.webp') || resource.name.includes('.svg')) {
          optimizedImages++;
        }
      }
      
      // Check compression
      if (resource.encodedBodySize && resource.decodedBodySize) {
        if (resource.encodedBodySize < resource.decodedBodySize) {
          compressedResources++;
        }
      }
      
      // Check caching
      if (resource.transferSize === 0 && resource.decodedBodySize > 0) {
        cachedResources++;
      }
    });
    
    // Image optimization test
    const imageOptPassed = totalImages === 0 || (optimizedImages / totalImages) >= 0.8;
    this.results.push({
      test: 'Image Optimization',
      status: imageOptPassed ? 'PASSED' : 'FAILED',
      value: `${optimizedImages}/${totalImages} optimized`,
      threshold: '80% optimized images',
      passed: imageOptPassed
    });
    
    console.log(`${imageOptPassed ? '✅' : '❌'} Image Optimization: ${optimizedImages}/${totalImages}`);
    console.log(`📦 Compressed Resources: ${compressedResources}`);
    console.log(`💾 Cached Resources: ${cachedResources}`);
  }

  /**
   * Generate performance test report
   */
  generateReport() {
    console.group('📊 Performance Test Report');
    
    const passed = this.results.filter(r => r.status === 'PASSED').length;
    const failed = this.results.filter(r => r.status === 'FAILED').length;
    const skipped = this.results.filter(r => r.status === 'SKIPPED').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️ Skipped: ${skipped}`);
    console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    
    // Show failed tests
    const failedTests = this.results.filter(r => r.status === 'FAILED');
    if (failedTests.length > 0) {
      console.group('❌ Failed Tests:');
      failedTests.forEach(test => {
        console.log(`• ${test.test}: ${test.value} (threshold: ${test.threshold})`);
      });
      console.groupEnd();
    }
    
    console.groupEnd();
    
    return {
      total: this.results.length,
      passed,
      failed,
      skipped,
      successRate: (passed / (passed + failed)) * 100,
      results: this.results
    };
  }

  /**
   * Get test results
   */
  getResults() {
    return this.results;
  }
}

// Auto-run tests when loaded in browser
if (typeof window !== 'undefined') {
  window.PerformanceTestSuite = PerformanceTestSuite;
  
  // Run tests after page load
  window.addEventListener('load', async () => {
    const testSuite = new PerformanceTestSuite();
    await testSuite.runAllTests();
  });
}