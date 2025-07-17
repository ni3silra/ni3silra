/**
 * Performance Test Runner
 * Orchestrates all performance tests and generates comprehensive reports
 */

import { PerformanceTestSuite } from './performance.test.js';
import { BundleAnalyzer } from './bundle-analyzer.js';
import { AnimationTester } from './animation-tester.js';

export class PerformanceRunner {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      overall: {
        passed: 0,
        failed: 0,
        skipped: 0,
        total: 0
      },
      tests: {
        loadTime: null,
        bundleSize: null,
        animations: null,
        webVitals: null
      },
      recommendations: []
    };
  }

  /**
   * Run all performance tests
   */
  async runAllTests() {
    console.group('🚀 Starting Comprehensive Performance Testing');
    console.log(`📅 Test Run: ${this.results.timestamp}`);
    
    try {
      // Run load time and web vitals tests
      await this.runLoadTimeTests();
      
      // Run bundle size analysis
      await this.runBundleSizeTests();
      
      // Run animation performance tests
      await this.runAnimationTests();
      
      // Generate final report
      this.generateFinalReport();
      
      return this.results;
      
    } catch (error) {
      console.error('❌ Performance testing failed:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * Run load time and web vitals tests
   */
  async runLoadTimeTests() {
    console.log('⏱️ Running load time tests...');
    
    try {
      const testSuite = new PerformanceTestSuite();
      const results = await testSuite.runAllTests();
      
      this.results.tests.loadTime = {
        status: 'COMPLETED',
        results: results,
        summary: this.summarizeResults(results)
      };
      
      this.updateOverallStats(results);
      
    } catch (error) {
      console.error('Load time tests failed:', error);
      this.results.tests.loadTime = {
        status: 'FAILED',
        error: error.message
      };
    }
  }

  /**
   * Run bundle size analysis
   */
  async runBundleSizeTests() {
    console.log('📦 Running bundle size analysis...');
    
    try {
      const analyzer = new BundleAnalyzer();
      const analysis = await analyzer.analyze();
      const requirements = analyzer.meetsRequirements();
      
      this.results.tests.bundleSize = {
        status: 'COMPLETED',
        analysis: analysis,
        requirements: requirements,
        passed: requirements.withinSizeLimit
      };
      
      // Update overall stats
      this.results.overall.total += 1;
      if (requirements.withinSizeLimit) {
        this.results.overall.passed += 1;
      } else {
        this.results.overall.failed += 1;
        this.results.recommendations.push(
          `Bundle size (${(requirements.totalSize / 1024).toFixed(2)}KB) exceeds limit (${(requirements.sizeLimit / 1024).toFixed(2)}KB)`
        );
      }
      
    } catch (error) {
      console.error('Bundle size analysis failed:', error);
      this.results.tests.bundleSize = {
        status: 'FAILED',
        error: error.message
      };
      this.results.overall.failed += 1;
      this.results.overall.total += 1;
    }
  }

  /**
   * Run animation performance tests
   */
  async runAnimationTests() {
    console.log('🎬 Running animation performance tests...');
    
    try {
      const tester = new AnimationTester();
      const results = await tester.testAnimationPerformance();
      
      this.results.tests.animations = {
        status: 'COMPLETED',
        results: results,
        summary: this.summarizeAnimationResults(results)
      };
      
      this.updateOverallStatsFromAnimations(results);
      
    } catch (error) {
      console.error('Animation tests failed:', error);
      this.results.tests.animations = {
        status: 'FAILED',
        error: error.message
      };
      this.results.overall.failed += 1;
      this.results.overall.total += 1;
    }
  }

  /**
   * Summarize test results
   */
  summarizeResults(results) {
    const passed = results.filter(r => r.status === 'PASSED').length;
    const failed = results.filter(r => r.status === 'FAILED').length;
    const skipped = results.filter(r => r.status === 'SKIPPED').length;
    
    return {
      total: results.length,
      passed,
      failed,
      skipped,
      successRate: results.length > 0 ? (passed / (passed + failed)) * 100 : 0
    };
  }

  /**
   * Summarize animation test results
   */
  summarizeAnimationResults(results) {
    const tests = Object.values(results);
    const passed = tests.filter(t => t.status === 'PASSED').length;
    const failed = tests.filter(t => t.status === 'FAILED').length;
    
    const avgFPS = tests
      .filter(t => t.metrics && t.metrics.averageFPS)
      .reduce((sum, t) => sum + t.metrics.averageFPS, 0) / 
      tests.filter(t => t.metrics && t.metrics.averageFPS).length;
    
    return {
      total: tests.length,
      passed,
      failed,
      averageFPS: avgFPS || 0,
      successRate: tests.length > 0 ? (passed / tests.length) * 100 : 0
    };
  }

  /**
   * Update overall statistics
   */
  updateOverallStats(results) {
    const summary = this.summarizeResults(results);
    this.results.overall.total += summary.total;
    this.results.overall.passed += summary.passed;
    this.results.overall.failed += summary.failed;
    this.results.overall.skipped += summary.skipped;
  }

  /**
   * Update overall stats from animation results
   */
  updateOverallStatsFromAnimations(results) {
    const tests = Object.values(results);
    this.results.overall.total += tests.length;
    
    tests.forEach(test => {
      if (test.status === 'PASSED') {
        this.results.overall.passed += 1;
      } else if (test.status === 'FAILED') {
        this.results.overall.failed += 1;
        this.results.recommendations.push(`${test.testName} performance below 60fps target`);
      }
    });
  }

  /**
   * Generate final comprehensive report
   */
  generateFinalReport() {
    console.group('📊 Final Performance Report');
    
    const { overall } = this.results;
    const successRate = overall.total > 0 ? 
      ((overall.passed / (overall.passed + overall.failed)) * 100).toFixed(1) : 0;
    
    console.log(`📈 Overall Results:`);
    console.log(`  ✅ Passed: ${overall.passed}`);
    console.log(`  ❌ Failed: ${overall.failed}`);
    console.log(`  ⏭️ Skipped: ${overall.skipped}`);
    console.log(`  📊 Success Rate: ${successRate}%`);
    
    // Detailed test results
    this.logTestDetails();
    
    // Performance recommendations
    if (this.results.recommendations.length > 0) {
      console.group('💡 Performance Recommendations:');
      this.results.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
      console.groupEnd();
    }
    
    // Requirements compliance
    this.checkRequirementsCompliance();
    
    console.groupEnd();
  }

  /**
   * Log detailed test results
   */
  logTestDetails() {
    console.group('📋 Detailed Test Results:');
    
    // Load Time Tests
    if (this.results.tests.loadTime) {
      const lt = this.results.tests.loadTime;
      if (lt.status === 'COMPLETED') {
        console.log(`⏱️ Load Time: ${lt.summary.passed}/${lt.summary.total} passed (${lt.summary.successRate.toFixed(1)}%)`);
      } else {
        console.log(`⏱️ Load Time: FAILED - ${lt.error}`);
      }
    }
    
    // Bundle Size
    if (this.results.tests.bundleSize) {
      const bs = this.results.tests.bundleSize;
      if (bs.status === 'COMPLETED') {
        const sizeKB = (bs.requirements.totalSize / 1024).toFixed(2);
        console.log(`📦 Bundle Size: ${sizeKB}KB ${bs.passed ? '✅' : '❌'}`);
      } else {
        console.log(`📦 Bundle Size: FAILED - ${bs.error}`);
      }
    }
    
    // Animation Performance
    if (this.results.tests.animations) {
      const anim = this.results.tests.animations;
      if (anim.status === 'COMPLETED') {
        console.log(`🎬 Animations: ${anim.summary.passed}/${anim.summary.total} passed (${anim.summary.averageFPS.toFixed(1)} avg FPS)`);
      } else {
        console.log(`🎬 Animations: FAILED - ${anim.error}`);
      }
    }
    
    console.groupEnd();
  }

  /**
   * Check compliance with project requirements
   */
  checkRequirementsCompliance() {
    console.group('✅ Requirements Compliance Check:');
    
    const compliance = {
      subSecondLoad: false,
      bundleUnder100KB: false,
      animationsAt60FPS: false
    };
    
    // Check sub-second load time (Requirement 5.2)
    if (this.results.tests.loadTime && this.results.tests.loadTime.status === 'COMPLETED') {
      const loadResults = this.results.tests.loadTime.results;
      const loadTimePassed = loadResults.some(r => 
        r.test.includes('Load') && r.status === 'PASSED' && parseFloat(r.value) < 1000
      );
      compliance.subSecondLoad = loadTimePassed;
    }
    
    // Check bundle size under 100KB (Requirement 7.1)
    if (this.results.tests.bundleSize && this.results.tests.bundleSize.status === 'COMPLETED') {
      compliance.bundleUnder100KB = this.results.tests.bundleSize.passed;
    }
    
    // Check 60fps animations (Requirement 7.6)
    if (this.results.tests.animations && this.results.tests.animations.status === 'COMPLETED') {
      const animResults = Object.values(this.results.tests.animations.results);
      compliance.animationsAt60FPS = animResults.every(r => r.status === 'PASSED');
    }
    
    console.log(`📊 Sub-second load times: ${compliance.subSecondLoad ? '✅' : '❌'} (Req 5.2)`);
    console.log(`📦 Bundle under 100KB: ${compliance.bundleUnder100KB ? '✅' : '❌'} (Req 7.1)`);
    console.log(`🎬 60fps animations: ${compliance.animationsAt60FPS ? '✅' : '❌'} (Req 7.6)`);
    
    const allCompliant = Object.values(compliance).every(c => c);
    console.log(`🎯 Overall Compliance: ${allCompliant ? '✅ PASSED' : '❌ NEEDS WORK'}`);
    
    console.groupEnd();
    
    return compliance;
  }

  /**
   * Export results to JSON
   */
  exportResults() {
    return JSON.stringify(this.results, null, 2);
  }

  /**
   * Save results to localStorage for persistence
   */
  saveResults() {
    try {
      localStorage.setItem('performance-test-results', this.exportResults());
      console.log('💾 Performance results saved to localStorage');
    } catch (error) {
      console.warn('Failed to save results to localStorage:', error);
    }
  }

  /**
   * Load previous results from localStorage
   */
  static loadPreviousResults() {
    try {
      const saved = localStorage.getItem('performance-test-results');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn('Failed to load previous results:', error);
      return null;
    }
  }

  /**
   * Compare with previous test run
   */
  compareWithPrevious() {
    const previous = PerformanceRunner.loadPreviousResults();
    if (!previous) {
      console.log('📊 No previous results to compare with');
      return null;
    }

    console.group('📈 Performance Comparison');
    
    // Compare success rates
    const currentRate = (this.results.overall.passed / (this.results.overall.passed + this.results.overall.failed)) * 100;
    const previousRate = (previous.overall.passed / (previous.overall.passed + previous.overall.failed)) * 100;
    const rateDiff = currentRate - previousRate;
    
    console.log(`Success Rate: ${currentRate.toFixed(1)}% (${rateDiff >= 0 ? '+' : ''}${rateDiff.toFixed(1)}%)`);
    
    // Compare bundle sizes
    if (this.results.tests.bundleSize && previous.tests.bundleSize) {
      const currentSize = this.results.tests.bundleSize.requirements.totalSize;
      const previousSize = previous.tests.bundleSize.requirements.totalSize;
      const sizeDiff = currentSize - previousSize;
      
      console.log(`Bundle Size: ${(currentSize / 1024).toFixed(2)}KB (${sizeDiff >= 0 ? '+' : ''}${(sizeDiff / 1024).toFixed(2)}KB)`);
    }
    
    console.groupEnd();
    
    return {
      current: this.results,
      previous,
      improvements: rateDiff > 0,
      sizeDelta: this.results.tests.bundleSize && previous.tests.bundleSize ? 
        this.results.tests.bundleSize.requirements.totalSize - previous.tests.bundleSize.requirements.totalSize : 0
    };
  }
}

// Auto-run when loaded in browser
if (typeof window !== 'undefined') {
  window.PerformanceRunner = PerformanceRunner;
  
  // Expose global function to run tests
  window.runPerformanceTests = async () => {
    const runner = new PerformanceRunner();
    const results = await runner.runAllTests();
    runner.saveResults();
    runner.compareWithPrevious();
    return results;
  };
}