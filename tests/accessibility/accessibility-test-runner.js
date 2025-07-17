/**
 * Accessibility Test Runner
 * Comprehensive accessibility testing suite that runs WCAG 2.1, keyboard navigation, and screen reader tests
 */

import { WCAGValidator } from './wcag-validator.js';
import { KeyboardTester } from './keyboard-tester.js';
import { ScreenReaderTester } from './screen-reader-tester.js';

export class AccessibilityTestRunner {
  constructor() {
    this.wcagValidator = new WCAGValidator();
    this.keyboardTester = new KeyboardTester();
    this.screenReaderTester = new ScreenReaderTester();
    this.results = {
      wcag: [],
      keyboard: [],
      screenReader: [],
      summary: {}
    };
    this.startTime = null;
    this.endTime = null;
  }

  /**
   * Run all accessibility tests
   */
  async runAllTests() {
    console.group('🚀 Starting Comprehensive Accessibility Testing');
    this.startTime = Date.now();
    
    try {
      console.log('🔍 Testing WCAG 2.1 compliance, keyboard navigation, and screen reader compatibility...');
      
      // Run WCAG 2.1 compliance tests
      console.log('\n1️⃣ Running WCAG 2.1 Compliance Tests...');
      this.results.wcag = await this.wcagValidator.validateCompliance();
      
      // Run keyboard navigation tests
      console.log('\n2️⃣ Running Keyboard Navigation Tests...');
      this.results.keyboard = await this.keyboardTester.testKeyboardNavigation();
      
      // Run screen reader compatibility tests
      console.log('\n3️⃣ Running Screen Reader Compatibility Tests...');
      this.results.screenReader = await this.screenReaderTester.testScreenReaderCompatibility();
      
      // Generate comprehensive report
      this.generateComprehensiveReport();
      
      return this.results;
      
    } catch (error) {
      console.error('❌ Accessibility testing failed:', error);
      throw error;
    } finally {
      this.endTime = Date.now();
      console.groupEnd();
    }
  }

  /**
   * Run individual test suite
   */
  async runTestSuite(suite) {
    console.group(`🧪 Running ${suite} Tests`);
    
    try {
      switch (suite.toLowerCase()) {
        case 'wcag':
          this.results.wcag = await this.wcagValidator.validateCompliance();
          return this.results.wcag;
        
        case 'keyboard':
          this.results.keyboard = await this.keyboardTester.testKeyboardNavigation();
          return this.results.keyboard;
        
        case 'screenreader':
        case 'screen-reader':
          this.results.screenReader = await this.screenReaderTester.testScreenReaderCompatibility();
          return this.results.screenReader;
        
        default:
          throw new Error(`Unknown test suite: ${suite}`);
      }
    } catch (error) {
      console.error(`❌ ${suite} testing failed:`, error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * Generate comprehensive accessibility report
   */
  generateComprehensiveReport() {
    console.group('📊 Comprehensive Accessibility Report');
    
    const duration = this.endTime - this.startTime;
    
    // Calculate overall statistics
    const wcagSummary = this.wcagValidator.getComplianceSummary();
    const keyboardSummary = this.keyboardTester.getSummary();
    const screenReaderSummary = this.screenReaderTester.getSummary();
    
    const totalTests = wcagSummary.totalTests + keyboardSummary.totalTests + screenReaderSummary.totalTests;
    const totalPassed = wcagSummary.passedTests + keyboardSummary.passedTests + screenReaderSummary.passedTests;
    const totalFailed = totalTests - totalPassed;
    const overallScore = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;
    
    // Store summary
    this.results.summary = {
      overallScore,
      totalTests,
      totalPassed,
      totalFailed,
      duration,
      wcagSummary,
      keyboardSummary,
      screenReaderSummary,
      complianceLevel: this.determineOverallComplianceLevel(overallScore),
      timestamp: new Date().toISOString()
    };
    
    // Display results
    console.log(`⏱️ Test Duration: ${duration}ms`);
    console.log(`📈 Overall Accessibility Score: ${overallScore.toFixed(1)}% (${totalPassed}/${totalTests})`);
    console.log(`🏆 Compliance Level: ${this.results.summary.complianceLevel}`);
    
    console.group('📋 Test Suite Breakdown:');
    console.log(`♿ WCAG 2.1 Compliance: ${wcagSummary.complianceRate.toFixed(1)}% (${wcagSummary.passedTests}/${wcagSummary.totalTests})`);
    console.log(`⌨️ Keyboard Navigation: ${keyboardSummary.successRate.toFixed(1)}% (${keyboardSummary.passedTests}/${keyboardSummary.totalTests})`);
    console.log(`🔊 Screen Reader Compatibility: ${screenReaderSummary.compatibilityRate.toFixed(1)}% (${screenReaderSummary.passedTests}/${screenReaderSummary.totalTests})`);
    console.groupEnd();
    
    // Show critical issues
    this.showCriticalIssues();
    
    // Show recommendations
    this.showRecommendations();
    
    // Show compliance checklist
    this.showComplianceChecklist();
    
    console.groupEnd();
    
    return this.results.summary;
  }

  /**
   * Show critical accessibility issues
   */
  showCriticalIssues() {
    console.group('🚨 Critical Issues:');
    
    const criticalIssues = [];
    
    // Check for critical WCAG failures
    const wcagResults = this.wcagValidator.getResults();
    const criticalWCAG = wcagResults.filter(r => 
      !r.passed && (
        r.guideline.includes('1.1.1') || // Images without alt text
        r.guideline.includes('2.1.1') || // Keyboard accessibility
        r.guideline.includes('2.4.2') || // Page titles
        r.guideline.includes('3.1.1') || // Language of page
        r.guideline.includes('4.1.1')    // Parsing errors
      )
    );
    
    criticalWCAG.forEach(issue => {
      criticalIssues.push(`WCAG: ${issue.guideline}`);
    });
    
    // Check for critical keyboard issues
    const keyboardResults = this.keyboardTester.getResults();
    const criticalKeyboard = keyboardResults.filter(r => 
      !r.passed && (
        r.test.includes('Focus Indicators') ||
        r.test.includes('Keyboard Navigation') ||
        r.test.includes('Skip Links')
      )
    );
    
    criticalKeyboard.forEach(issue => {
      criticalIssues.push(`Keyboard: ${issue.test}`);
    });
    
    // Check for critical screen reader issues
    const screenReaderResults = this.screenReaderTester.getResults();
    const criticalScreenReader = screenReaderResults.filter(r => 
      !r.passed && (
        r.test.includes('Semantic HTML') ||
        r.test.includes('Heading Hierarchy') ||
        r.test.includes('Form Input Labels') ||
        r.test.includes('Image Alt Attributes')
      )
    );
    
    criticalScreenReader.forEach(issue => {
      criticalIssues.push(`Screen Reader: ${issue.test}`);
    });
    
    if (criticalIssues.length === 0) {
      console.log('✅ No critical accessibility issues found!');
    } else {
      criticalIssues.forEach(issue => {
        console.log(`❌ ${issue}`);
      });
    }
    
    console.groupEnd();
  }

  /**
   * Show accessibility recommendations
   */
  showRecommendations() {
    console.group('💡 Accessibility Recommendations:');
    
    const recommendations = [];
    const { wcagSummary, keyboardSummary, screenReaderSummary } = this.results.summary;
    
    // WCAG recommendations
    if (wcagSummary.complianceRate < 90) {
      recommendations.push('🎯 Focus on WCAG 2.1 compliance - aim for 90%+ compliance rate');
    }
    
    // Keyboard recommendations
    if (keyboardSummary.successRate < 90) {
      recommendations.push('⌨️ Improve keyboard navigation - ensure all interactive elements are keyboard accessible');
    }
    
    if (keyboardSummary.focusableElements === 0) {
      recommendations.push('🎯 Add focusable elements for keyboard navigation');
    }
    
    // Screen reader recommendations
    if (screenReaderSummary.compatibilityRate < 90) {
      recommendations.push('🔊 Enhance screen reader compatibility with better semantic HTML and ARIA');
    }
    
    // General recommendations based on score
    if (this.results.summary.overallScore < 70) {
      recommendations.push('🚨 Critical: Address fundamental accessibility issues immediately');
    } else if (this.results.summary.overallScore < 85) {
      recommendations.push('⚠️ Important: Improve accessibility to meet AA standards');
    } else if (this.results.summary.overallScore < 95) {
      recommendations.push('✨ Good: Fine-tune accessibility for AAA compliance');
    } else {
      recommendations.push('🏆 Excellent: Maintain high accessibility standards');
    }
    
    recommendations.forEach(rec => {
      console.log(rec);
    });
    
    console.groupEnd();
  }

  /**
   * Show compliance checklist
   */
  showComplianceChecklist() {
    console.group('📋 Accessibility Compliance Checklist:');
    
    const checklist = [
      { item: 'All images have appropriate alt text', status: this.checkImageAltText() },
      { item: 'Page has proper heading hierarchy', status: this.checkHeadingHierarchy() },
      { item: 'All interactive elements are keyboard accessible', status: this.checkKeyboardAccess() },
      { item: 'Focus indicators are visible', status: this.checkFocusIndicators() },
      { item: 'Form inputs have proper labels', status: this.checkFormLabels() },
      { item: 'Page has semantic HTML structure', status: this.checkSemanticHTML() },
      { item: 'Color contrast meets WCAG standards', status: this.checkColorContrast() },
      { item: 'Page has proper landmark roles', status: this.checkLandmarkRoles() },
      { item: 'Dynamic content is announced to screen readers', status: this.checkLiveRegions() },
      { item: 'Page is responsive and works at 320px width', status: this.checkResponsiveness() }
    ];
    
    checklist.forEach(item => {
      const icon = item.status ? '✅' : '❌';
      console.log(`${icon} ${item.item}`);
    });
    
    const passedItems = checklist.filter(item => item.status).length;
    const checklistScore = (passedItems / checklist.length) * 100;
    
    console.log(`\n📊 Checklist Score: ${checklistScore.toFixed(1)}% (${passedItems}/${checklist.length})`);
    
    console.groupEnd();
  }

  /**
   * Helper methods for checklist validation
   */
  checkImageAltText() {
    const wcagResults = this.wcagValidator.getResults();
    const altTextResult = wcagResults.find(r => r.guideline.includes('1.1.1'));
    return altTextResult ? altTextResult.passed : false;
  }

  checkHeadingHierarchy() {
    const screenReaderResults = this.screenReaderTester.getResults();
    const headingResult = screenReaderResults.find(r => r.test.includes('Heading Hierarchy'));
    return headingResult ? headingResult.passed : false;
  }

  checkKeyboardAccess() {
    const keyboardResults = this.keyboardTester.getResults();
    const accessResult = keyboardResults.find(r => r.test.includes('Keyboard Navigation'));
    return accessResult ? accessResult.passed : false;
  }

  checkFocusIndicators() {
    const keyboardResults = this.keyboardTester.getResults();
    const focusResult = keyboardResults.find(r => r.test.includes('Focus Indicators'));
    return focusResult ? focusResult.passed : false;
  }

  checkFormLabels() {
    const screenReaderResults = this.screenReaderTester.getResults();
    const labelResult = screenReaderResults.find(r => r.test.includes('Form Input Labels'));
    return labelResult ? labelResult.passed : false;
  }

  checkSemanticHTML() {
    const screenReaderResults = this.screenReaderTester.getResults();
    const semanticResult = screenReaderResults.find(r => r.test.includes('Semantic HTML'));
    return semanticResult ? semanticResult.passed : false;
  }

  checkColorContrast() {
    const wcagResults = this.wcagValidator.getResults();
    const contrastResult = wcagResults.find(r => r.guideline.includes('1.4.3'));
    return contrastResult ? contrastResult.passed : false;
  }

  checkLandmarkRoles() {
    const screenReaderResults = this.screenReaderTester.getResults();
    const landmarkResult = screenReaderResults.find(r => r.test.includes('Landmark Roles'));
    return landmarkResult ? landmarkResult.passed : false;
  }

  checkLiveRegions() {
    const screenReaderResults = this.screenReaderTester.getResults();
    const liveResult = screenReaderResults.find(r => r.test.includes('Live Regions'));
    return liveResult ? liveResult.passed : false;
  }

  checkResponsiveness() {
    const wcagResults = this.wcagValidator.getResults();
    const reflowResult = wcagResults.find(r => r.guideline.includes('1.4.10'));
    return reflowResult ? reflowResult.passed : false;
  }

  /**
   * Determine overall compliance level
   */
  determineOverallComplianceLevel(score) {
    if (score >= 95) return 'AAA (Excellent)';
    if (score >= 85) return 'AA (Good)';
    if (score >= 70) return 'A (Basic)';
    return 'Non-compliant (Needs Work)';
  }

  /**
   * Export results to JSON
   */
  exportResults() {
    return {
      ...this.results,
      exportedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
  }

  /**
   * Get results summary
   */
  getResultsSummary() {
    return this.results.summary;
  }

  /**
   * Get all results
   */
  getAllResults() {
    return this.results;
  }

  /**
   * Reset all test results
   */
  reset() {
    this.results = {
      wcag: [],
      keyboard: [],
      screenReader: [],
      summary: {}
    };
    this.startTime = null;
    this.endTime = null;
  }
}

// Export for use in tests
if (typeof window !== 'undefined') {
  window.AccessibilityTestRunner = AccessibilityTestRunner;
}

// Auto-run tests if this script is loaded directly
if (typeof window !== 'undefined' && window.location.search.includes('run-accessibility-tests')) {
  document.addEventListener('DOMContentLoaded', async () => {
    const runner = new AccessibilityTestRunner();
    try {
      await runner.runAllTests();
      console.log('✅ Accessibility testing completed successfully');
    } catch (error) {
      console.error('❌ Accessibility testing failed:', error);
    }
  });
}