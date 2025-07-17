/**
 * Keyboard Navigation Tester
 * Tests keyboard accessibility and navigation patterns
 */

export class KeyboardTester {
  constructor() {
    this.results = [];
    this.focusableElements = [];
    this.currentFocusIndex = -1;
    this.keyboardTraps = [];
    this.isTestingActive = false;
    this.keyboardEvents = [];
  }

  /**
   * Run all keyboard navigation tests
   */
  async testKeyboardNavigation() {
    console.group('⌨️ Keyboard Navigation Testing');
    
    try {
      // Discover focusable elements
      this.discoverFocusableElements();
      
      // Test tab navigation
      await this.testTabNavigation();
      
      // Test keyboard shortcuts
      await this.testKeyboardShortcuts();
      
      // Test focus management
      await this.testFocusManagement();
      
      // Test keyboard traps
      await this.testKeyboardTraps();
      
      // Test skip links
      await this.testSkipLinks();
      
      // Generate report
      this.generateKeyboardReport();
      
      return this.results;
      
    } catch (error) {
      console.error('Keyboard navigation testing failed:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * Discover all focusable elements on the page
   */
  discoverFocusableElements() {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
      'audio[controls]',
      'video[controls]',
      'details summary',
      '[role="button"]:not([disabled])',
      '[role="link"]',
      '[role="menuitem"]',
      '[role="tab"]'
    ];

    this.focusableElements = Array.from(
      document.querySelectorAll(focusableSelectors.join(', '))
    ).filter(element => {
      // Filter out hidden elements
      const style = window.getComputedStyle(element);
      return style.display !== 'none' && 
             style.visibility !== 'hidden' && 
             element.offsetWidth > 0 && 
             element.offsetHeight > 0;
    });

    this.addResult('Focusable Elements Discovery', true, {
      totalElements: this.focusableElements.length,
      elementTypes: this.getFocusableElementTypes()
    });

    console.log(`🔍 Found ${this.focusableElements.length} focusable elements`);
  }

  /**
   * Get types of focusable elements
   */
  getFocusableElementTypes() {
    const types = {};
    this.focusableElements.forEach(element => {
      const type = element.tagName.toLowerCase();
      types[type] = (types[type] || 0) + 1;
    });
    return types;
  }

  /**
   * Test tab navigation order
   */
  async testTabNavigation() {
    console.log('🔄 Testing tab navigation order...');
    
    let tabOrderValid = true;
    let previousTabIndex = -1;
    let customTabIndexElements = 0;
    let logicalOrder = true;

    this.focusableElements.forEach((element, index) => {
      const tabIndex = parseInt(element.getAttribute('tabindex')) || 0;
      
      if (tabIndex > 0) {
        customTabIndexElements++;
        if (tabIndex < previousTabIndex) {
          tabOrderValid = false;
        }
        previousTabIndex = tabIndex;
      }

      // Check if element is logically positioned
      const rect = element.getBoundingClientRect();
      if (index > 0) {
        const prevRect = this.focusableElements[index - 1].getBoundingClientRect();
        
        // Simple heuristic: if element is significantly above previous element, order might be wrong
        if (rect.top < prevRect.top - 50 && rect.left < prevRect.left - 50) {
          logicalOrder = false;
        }
      }
    });

    this.addResult('Tab Order Validity', tabOrderValid, {
      customTabIndexElements,
      logicalOrder,
      note: tabOrderValid ? 'Tab order follows logical sequence' : 'Tab order may be confusing'
    });

    // Test for positive tabindex values (generally not recommended)
    const positiveTabIndexElements = this.focusableElements.filter(
      el => parseInt(el.getAttribute('tabindex')) > 0
    );

    this.addResult('Positive TabIndex Usage', positiveTabIndexElements.length === 0, {
      positiveTabIndexCount: positiveTabIndexElements.length,
      note: positiveTabIndexElements.length > 0 ? 
        'Positive tabindex values found - consider using 0 or -1 instead' : 
        'No positive tabindex values found'
    });
  }

  /**
   * Test keyboard shortcuts and access keys
   */
  async testKeyboardShortcuts() {
    console.log('⌨️ Testing keyboard shortcuts...');
    
    const elementsWithAccessKey = document.querySelectorAll('[accesskey]');
    const elementsWithShortcuts = document.querySelectorAll('[data-shortcut], [title*="Ctrl"], [title*="Alt"]');
    
    // Check for conflicting access keys
    const accessKeys = {};
    let conflictingAccessKeys = 0;
    
    elementsWithAccessKey.forEach(element => {
      const key = element.getAttribute('accesskey').toLowerCase();
      if (accessKeys[key]) {
        conflictingAccessKeys++;
      } else {
        accessKeys[key] = element;
      }
    });

    this.addResult('Access Key Conflicts', conflictingAccessKeys === 0, {
      totalAccessKeys: elementsWithAccessKey.length,
      conflictingAccessKeys,
      uniqueAccessKeys: Object.keys(accessKeys).length
    });

    // Test common keyboard shortcuts
    await this.testCommonShortcuts();

    this.addResult('Keyboard Shortcuts Available', elementsWithShortcuts.length > 0, {
      elementsWithShortcuts: elementsWithShortcuts.length,
      accessKeyElements: elementsWithAccessKey.length
    });
  }

  /**
   * Test common keyboard shortcuts
   */
  async testCommonShortcuts() {
    const commonShortcuts = [
      { key: 'Escape', description: 'Close modals/menus' },
      { key: 'Enter', description: 'Activate buttons/links' },
      { key: 'Space', description: 'Activate buttons' },
      { key: 'ArrowUp', description: 'Navigate up in lists' },
      { key: 'ArrowDown', description: 'Navigate down in lists' },
      { key: 'Home', description: 'Go to beginning' },
      { key: 'End', description: 'Go to end' }
    ];

    let supportedShortcuts = 0;
    
    // This is a simplified test - in practice, you'd simulate key events
    commonShortcuts.forEach(shortcut => {
      // Check if elements have event listeners for these keys
      const elementsWithKeyHandlers = document.querySelectorAll(
        `[onkeydown*="${shortcut.key}"], [onkeyup*="${shortcut.key}"]`
      );
      
      if (elementsWithKeyHandlers.length > 0) {
        supportedShortcuts++;
      }
    });

    this.addResult('Common Shortcuts Support', supportedShortcuts > 0, {
      supportedShortcuts,
      totalCommonShortcuts: commonShortcuts.length,
      note: 'Manual testing required to verify shortcut functionality'
    });
  }

  /**
   * Test focus management
   */
  async testFocusManagement() {
    console.log('🎯 Testing focus management...');
    
    // Test focus indicators
    let elementsWithFocusIndicators = 0;
    let elementsWithoutFocusIndicators = 0;

    this.focusableElements.forEach(element => {
      // Check if element has custom focus styles
      const computedStyle = window.getComputedStyle(element, ':focus');
      const hasFocusOutline = computedStyle.outline !== 'none' && computedStyle.outline !== '0px';
      const hasFocusBoxShadow = computedStyle.boxShadow !== 'none';
      const hasFocusBorder = computedStyle.borderColor !== computedStyle.borderColor; // This is a simplified check
      
      if (hasFocusOutline || hasFocusBoxShadow || hasFocusBorder) {
        elementsWithFocusIndicators++;
      } else {
        elementsWithoutFocusIndicators++;
      }
    });

    this.addResult('Focus Indicators', elementsWithoutFocusIndicators === 0, {
      elementsWithFocusIndicators,
      elementsWithoutFocusIndicators,
      totalFocusableElements: this.focusableElements.length
    });

    // Test focus restoration
    const modals = document.querySelectorAll('[role="dialog"], .modal, [aria-modal="true"]');
    this.addResult('Modal Focus Management', true, {
      modalsFound: modals.length,
      note: 'Manual testing required to verify focus is trapped in modals and restored when closed'
    });

    // Test skip to content functionality
    await this.testSkipToContent();
  }

  /**
   * Test skip to content functionality
   */
  async testSkipToContent() {
    const skipLinks = document.querySelectorAll('a[href^="#"], .skip-link, [class*="skip"]');
    let functionalSkipLinks = 0;

    skipLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          functionalSkipLinks++;
        }
      }
    });

    this.addResult('Skip Links Functionality', functionalSkipLinks > 0, {
      totalSkipLinks: skipLinks.length,
      functionalSkipLinks,
      note: 'Skip links help users navigate quickly to main content'
    });
  }

  /**
   * Test for keyboard traps
   */
  async testKeyboardTraps() {
    console.log('🔒 Testing for keyboard traps...');
    
    // Look for elements that might trap focus
    const potentialTraps = document.querySelectorAll(
      '[role="dialog"], .modal, [aria-modal="true"], .dropdown-menu, [role="menu"]'
    );

    let properlyManagedTraps = 0;
    let problematicTraps = 0;

    potentialTraps.forEach(element => {
      // Check if trap has proper escape mechanism
      const hasEscapeHandler = element.hasAttribute('onkeydown') || 
                              element.querySelector('[data-dismiss], .close, [aria-label*="close"]');
      
      if (hasEscapeHandler) {
        properlyManagedTraps++;
      } else {
        problematicTraps++;
      }
    });

    this.addResult('Keyboard Trap Management', problematicTraps === 0, {
      potentialTraps: potentialTraps.length,
      properlyManagedTraps,
      problematicTraps,
      note: 'All focus traps should have escape mechanisms (Escape key, close button)'
    });
  }

  /**
   * Test skip links
   */
  async testSkipLinks() {
    console.log('⏭️ Testing skip links...');
    
    const skipLinks = document.querySelectorAll(
      'a[href^="#main"], a[href^="#content"], .skip-link, [class*="skip-to"]'
    );

    let workingSkipLinks = 0;
    const skipLinkDetails = [];

    skipLinks.forEach((link, index) => {
      const href = link.getAttribute('href');
      const target = href ? document.querySelector(href) : null;
      const isVisible = this.isElementVisible(link);
      const isFocusable = link.tabIndex !== -1;

      const details = {
        index: index + 1,
        text: link.textContent.trim(),
        href,
        hasTarget: !!target,
        isVisible,
        isFocusable
      };

      skipLinkDetails.push(details);

      if (target && isFocusable) {
        workingSkipLinks++;
      }
    });

    this.addResult('Skip Links Implementation', workingSkipLinks > 0, {
      totalSkipLinks: skipLinks.length,
      workingSkipLinks,
      skipLinkDetails,
      note: 'Skip links should be the first focusable elements and lead to main content'
    });
  }

  /**
   * Check if element is visible
   */
  isElementVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0' &&
           element.offsetWidth > 0 && 
           element.offsetHeight > 0;
  }

  /**
   * Simulate keyboard navigation (for automated testing)
   */
  async simulateKeyboardNavigation() {
    console.log('🤖 Simulating keyboard navigation...');
    
    if (this.focusableElements.length === 0) {
      this.addResult('Keyboard Navigation Simulation', false, {
        error: 'No focusable elements found'
      });
      return;
    }

    let navigationSuccessful = true;
    let focusedElements = 0;

    try {
      // Simulate tabbing through elements
      for (let i = 0; i < Math.min(this.focusableElements.length, 10); i++) {
        const element = this.focusableElements[i];
        
        // Try to focus the element
        element.focus();
        
        // Check if element actually received focus
        if (document.activeElement === element) {
          focusedElements++;
        }
        
        // Small delay to simulate real user interaction
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } catch (error) {
      navigationSuccessful = false;
      console.error('Navigation simulation error:', error);
    }

    this.addResult('Keyboard Navigation Simulation', navigationSuccessful && focusedElements > 0, {
      elementsAttempted: Math.min(this.focusableElements.length, 10),
      elementsFocused: focusedElements,
      successRate: focusedElements / Math.min(this.focusableElements.length, 10) * 100
    });
  }

  /**
   * Add test result
   */
  addResult(test, passed, details = {}) {
    const result = {
      test,
      passed,
      details,
      timestamp: new Date().toISOString()
    };
    
    this.results.push(result);
    console.log(`${passed ? '✅' : '❌'} ${test}`);
    
    if (details.note) {
      console.log(`  ℹ️ ${details.note}`);
    }
  }

  /**
   * Generate keyboard navigation report
   */
  generateKeyboardReport() {
    console.group('📊 Keyboard Navigation Report');
    
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    
    console.log(`📈 Keyboard Accessibility: ${successRate.toFixed(1)}% (${passedTests}/${totalTests})`);
    console.log(`🎯 Focusable Elements: ${this.focusableElements.length}`);
    
    // Show failed tests
    const failed = this.results.filter(r => !r.passed);
    if (failed.length > 0) {
      console.group('❌ Failed Tests:');
      failed.forEach(test => {
        console.log(`• ${test.test}`);
        if (test.details.note) {
          console.log(`  ${test.details.note}`);
        }
      });
      console.groupEnd();
    }
    
    // Recommendations
    console.group('💡 Recommendations:');
    if (this.focusableElements.length === 0) {
      console.log('• Add focusable elements for keyboard navigation');
    }
    if (failed.some(f => f.test.includes('Focus Indicators'))) {
      console.log('• Ensure all focusable elements have visible focus indicators');
    }
    if (failed.some(f => f.test.includes('Skip Links'))) {
      console.log('• Add skip links to help users navigate quickly to main content');
    }
    if (failed.some(f => f.test.includes('Tab Order'))) {
      console.log('• Review tab order to ensure logical navigation flow');
    }
    console.groupEnd();
    
    console.groupEnd();
    
    return {
      totalTests,
      passedTests,
      failedTests,
      successRate,
      focusableElements: this.focusableElements.length,
      failedTests: failed
    };
  }

  /**
   * Get test results
   */
  getResults() {
    return this.results;
  }

  /**
   * Get summary
   */
  getSummary() {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    
    return {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      successRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
      focusableElements: this.focusableElements.length
    };
  }
}

// Export for use in tests
if (typeof window !== 'undefined') {
  window.KeyboardTester = KeyboardTester;
}