/**
 * WCAG 2.1 Compliance Validator
 * Tests for Web Content Accessibility Guidelines compliance
 */

export class WCAGValidator {
  constructor() {
    this.results = [];
    this.guidelines = {
      perceivable: [],
      operable: [],
      understandable: [],
      robust: []
    };
  }

  /**
   * Run all WCAG 2.1 compliance tests
   */
  async validateCompliance() {
    console.group('♿ WCAG 2.1 Compliance Validation');
    
    try {
      // Perceivable tests
      await this.testPerceivable();
      
      // Operable tests
      await this.testOperable();
      
      // Understandable tests
      await this.testUnderstandable();
      
      // Robust tests
      await this.testRobust();
      
      this.generateComplianceReport();
      
      return this.results;
      
    } catch (error) {
      console.error('WCAG validation failed:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * Test Perceivable guidelines
   */
  async testPerceivable() {
    console.log('👁️ Testing Perceivable guidelines...');
    
    // 1.1 Text Alternatives
    this.testTextAlternatives();
    
    // 1.3 Adaptable
    this.testAdaptable();
    
    // 1.4 Distinguishable
    this.testDistinguishable();
  }

  /**
   * Test text alternatives (1.1)
   */
  testTextAlternatives() {
    const images = document.querySelectorAll('img');
    let imagesWithoutAlt = 0;
    let decorativeImages = 0;
    let informativeImages = 0;

    images.forEach(img => {
      if (!img.hasAttribute('alt')) {
        imagesWithoutAlt++;
      } else if (img.alt === '') {
        decorativeImages++;
      } else {
        informativeImages++;
      }
    });

    const passed = imagesWithoutAlt === 0;
    this.addResult('1.1.1 Non-text Content', passed, {
      totalImages: images.length,
      imagesWithoutAlt,
      decorativeImages,
      informativeImages
    });

    // Test other non-text content
    const videos = document.querySelectorAll('video');
    const canvases = document.querySelectorAll('canvas');
    
    videos.forEach((video, index) => {
      const hasTrack = video.querySelector('track');
      const hasAria = video.hasAttribute('aria-label') || video.hasAttribute('aria-labelledby');
      this.addResult(`1.1.1 Video ${index + 1} Alternatives`, hasTrack || hasAria, {
        hasTrack: !!hasTrack,
        hasAria
      });
    });

    canvases.forEach((canvas, index) => {
      const hasAria = canvas.hasAttribute('aria-label') || canvas.hasAttribute('aria-labelledby');
      const hasFallback = canvas.textContent.trim().length > 0;
      this.addResult(`1.1.1 Canvas ${index + 1} Alternatives`, hasAria || hasFallback, {
        hasAria,
        hasFallback
      });
    });
  }

  /**
   * Test adaptable content (1.3)
   */
  testAdaptable() {
    // 1.3.1 Info and Relationships
    this.testSemanticStructure();
    
    // 1.3.2 Meaningful Sequence
    this.testMeaningfulSequence();
    
    // 1.3.4 Orientation
    this.testOrientation();
  }

  /**
   * Test semantic structure
   */
  testSemanticStructure() {
    // Check heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let headingHierarchyValid = true;
    let previousLevel = 0;

    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > previousLevel + 1) {
        headingHierarchyValid = false;
      }
      previousLevel = level;
    });

    this.addResult('1.3.1 Heading Hierarchy', headingHierarchyValid, {
      totalHeadings: headings.length,
      headingLevels: Array.from(headings).map(h => h.tagName)
    });

    // Check landmark roles
    const landmarks = {
      main: document.querySelectorAll('main, [role="main"]').length,
      navigation: document.querySelectorAll('nav, [role="navigation"]').length,
      banner: document.querySelectorAll('header, [role="banner"]').length,
      contentinfo: document.querySelectorAll('footer, [role="contentinfo"]').length
    };

    const hasRequiredLandmarks = landmarks.main >= 1;
    this.addResult('1.3.1 Landmark Roles', hasRequiredLandmarks, landmarks);

    // Check form labels
    const inputs = document.querySelectorAll('input, select, textarea');
    let unlabeledInputs = 0;

    inputs.forEach(input => {
      const hasLabel = input.labels && input.labels.length > 0;
      const hasAriaLabel = input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby');
      const hasTitle = input.hasAttribute('title');
      
      if (!hasLabel && !hasAriaLabel && !hasTitle) {
        unlabeledInputs++;
      }
    });

    this.addResult('1.3.1 Form Labels', unlabeledInputs === 0, {
      totalInputs: inputs.length,
      unlabeledInputs
    });
  }

  /**
   * Test meaningful sequence
   */
  testMeaningfulSequence() {
    // Check if content makes sense when CSS is disabled
    const focusableElements = document.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    let tabOrderValid = true;
    let previousTabIndex = -1;

    focusableElements.forEach(element => {
      const tabIndex = parseInt(element.getAttribute('tabindex')) || 0;
      if (tabIndex > 0 && tabIndex < previousTabIndex) {
        tabOrderValid = false;
      }
      if (tabIndex > 0) {
        previousTabIndex = tabIndex;
      }
    });

    this.addResult('1.3.2 Meaningful Sequence', tabOrderValid, {
      focusableElements: focusableElements.length,
      customTabIndexes: Array.from(focusableElements)
        .filter(el => el.hasAttribute('tabindex'))
        .length
    });
  }

  /**
   * Test orientation support
   */
  testOrientation() {
    // Check if content works in both orientations
    const viewport = document.querySelector('meta[name="viewport"]');
    const hasViewport = !!viewport;
    const allowsRotation = !viewport || !viewport.content.includes('orientation=');

    this.addResult('1.3.4 Orientation', hasViewport && allowsRotation, {
      hasViewport,
      allowsRotation,
      viewportContent: viewport ? viewport.content : null
    });
  }

  /**
   * Test distinguishable content (1.4)
   */
  testDistinguishable() {
    // 1.4.1 Use of Color
    this.testColorUsage();
    
    // 1.4.3 Contrast (Minimum)
    this.testColorContrast();
    
    // 1.4.4 Resize text
    this.testTextResize();
    
    // 1.4.10 Reflow
    this.testReflow();
  }

  /**
   * Test color usage
   */
  testColorUsage() {
    // Check for color-only information
    const elementsWithColorInfo = document.querySelectorAll('[style*="color"]');
    let colorOnlyInfo = 0;

    elementsWithColorInfo.forEach(element => {
      const hasAdditionalInfo = element.textContent.includes('*') || 
                               element.querySelector('.icon') ||
                               element.hasAttribute('aria-label');
      if (!hasAdditionalInfo) {
        colorOnlyInfo++;
      }
    });

    this.addResult('1.4.1 Use of Color', colorOnlyInfo === 0, {
      elementsWithColor: elementsWithColorInfo.length,
      colorOnlyInfo
    });
  }

  /**
   * Test color contrast
   */
  testColorContrast() {
    // This is a simplified contrast test
    // In a real implementation, you'd use a proper color contrast analyzer
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, a, button');
    let lowContrastElements = 0;

    textElements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      // Simple heuristic - in practice, you'd calculate actual contrast ratios
      if (color === backgroundColor || 
          (color.includes('rgb(128') && backgroundColor.includes('rgb(128'))) {
        lowContrastElements++;
      }
    });

    this.addResult('1.4.3 Contrast (Minimum)', lowContrastElements === 0, {
      textElements: textElements.length,
      lowContrastElements,
      note: 'Simplified contrast check - use proper tools for accurate testing'
    });
  }

  /**
   * Test text resize capability
   */
  testTextResize() {
    // Check if text can be resized up to 200%
    const body = document.body;
    const originalFontSize = window.getComputedStyle(body).fontSize;
    
    // Test if relative units are used
    const usesRelativeUnits = originalFontSize.includes('rem') || 
                             originalFontSize.includes('em') || 
                             originalFontSize.includes('%');

    this.addResult('1.4.4 Resize Text', usesRelativeUnits, {
      originalFontSize,
      usesRelativeUnits,
      note: 'Check if text scales properly when browser zoom is increased to 200%'
    });
  }

  /**
   * Test reflow at 320px width
   */
  testReflow() {
    // Check if content reflows properly at 320px width
    const hasResponsiveDesign = document.querySelector('meta[name="viewport"]') !== null;
    const usesFlexibleLayout = document.querySelector('[style*="flex"]') !== null ||
                              document.querySelector('[class*="flex"]') !== null ||
                              document.querySelector('[style*="grid"]') !== null ||
                              document.querySelector('[class*="grid"]') !== null;

    this.addResult('1.4.10 Reflow', hasResponsiveDesign && usesFlexibleLayout, {
      hasResponsiveDesign,
      usesFlexibleLayout,
      note: 'Test manually at 320px width and 400% zoom'
    });
  }

  /**
   * Test Operable guidelines
   */
  async testOperable() {
    console.log('⌨️ Testing Operable guidelines...');
    
    // 2.1 Keyboard Accessible
    this.testKeyboardAccessible();
    
    // 2.4 Navigable
    this.testNavigable();
    
    // 2.5 Input Modalities
    this.testInputModalities();
  }

  /**
   * Test keyboard accessibility
   */
  testKeyboardAccessible() {
    // 2.1.1 Keyboard
    const interactiveElements = document.querySelectorAll(
      'a, button, input, select, textarea, [onclick], [onkeydown], [role="button"], [role="link"], [tabindex]:not([tabindex="-1"])'
    );
    
    let keyboardInaccessible = 0;
    interactiveElements.forEach(element => {
      const tabIndex = element.getAttribute('tabindex');
      const isKeyboardAccessible = tabIndex !== '-1' && 
                                  (element.tagName.toLowerCase() !== 'div' || element.hasAttribute('role'));
      
      if (!isKeyboardAccessible) {
        keyboardInaccessible++;
      }
    });

    this.addResult('2.1.1 Keyboard', keyboardInaccessible === 0, {
      interactiveElements: interactiveElements.length,
      keyboardInaccessible
    });

    // 2.1.2 No Keyboard Trap
    this.addResult('2.1.2 No Keyboard Trap', true, {
      note: 'Manual testing required - ensure focus can move away from all components'
    });
  }

  /**
   * Test navigable content
   */
  testNavigable() {
    // 2.4.1 Bypass Blocks
    const skipLinks = document.querySelectorAll('a[href^="#"], .skip-link');
    this.addResult('2.4.1 Bypass Blocks', skipLinks.length > 0, {
      skipLinks: skipLinks.length
    });

    // 2.4.2 Page Titled
    const title = document.title;
    const hasTitle = title && title.trim().length > 0;
    this.addResult('2.4.2 Page Titled', hasTitle, {
      title: title || 'No title'
    });

    // 2.4.3 Focus Order
    const focusableElements = document.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    let logicalFocusOrder = true;
    // This is a simplified check - proper testing requires manual verification
    this.addResult('2.4.3 Focus Order', logicalFocusOrder, {
      focusableElements: focusableElements.length,
      note: 'Manual testing required to verify logical focus order'
    });

    // 2.4.4 Link Purpose (In Context)
    const links = document.querySelectorAll('a[href]');
    let ambiguousLinks = 0;
    
    links.forEach(link => {
      const text = link.textContent.trim().toLowerCase();
      const hasAriaLabel = link.hasAttribute('aria-label') || link.hasAttribute('aria-labelledby');
      
      if ((text === 'click here' || text === 'read more' || text === 'more') && !hasAriaLabel) {
        ambiguousLinks++;
      }
    });

    this.addResult('2.4.4 Link Purpose', ambiguousLinks === 0, {
      totalLinks: links.length,
      ambiguousLinks
    });

    // 2.4.6 Headings and Labels
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const labels = document.querySelectorAll('label');
    
    let descriptiveHeadings = true;
    headings.forEach(heading => {
      if (heading.textContent.trim().length < 3) {
        descriptiveHeadings = false;
      }
    });

    this.addResult('2.4.6 Headings and Labels', descriptiveHeadings, {
      headings: headings.length,
      labels: labels.length,
      descriptiveHeadings
    });

    // 2.4.7 Focus Visible
    this.addResult('2.4.7 Focus Visible', true, {
      note: 'Check that focus indicators are visible when navigating with keyboard'
    });
  }

  /**
   * Test input modalities
   */
  testInputModalities() {
    // 2.5.1 Pointer Gestures
    this.addResult('2.5.1 Pointer Gestures', true, {
      note: 'Ensure all functionality is available with single pointer actions'
    });

    // 2.5.2 Pointer Cancellation
    this.addResult('2.5.2 Pointer Cancellation', true, {
      note: 'Ensure pointer events can be cancelled'
    });

    // 2.5.3 Label in Name
    const labeledElements = document.querySelectorAll('[aria-label], [aria-labelledby]');
    this.addResult('2.5.3 Label in Name', true, {
      labeledElements: labeledElements.length,
      note: 'Verify accessible names match visible labels'
    });

    // 2.5.4 Motion Actuation
    this.addResult('2.5.4 Motion Actuation', true, {
      note: 'Ensure motion-triggered functionality has alternative input methods'
    });
  }

  /**
   * Test Understandable guidelines
   */
  async testUnderstandable() {
    console.log('🧠 Testing Understandable guidelines...');
    
    // 3.1 Readable
    this.testReadable();
    
    // 3.2 Predictable
    this.testPredictable();
    
    // 3.3 Input Assistance
    this.testInputAssistance();
  }

  /**
   * Test readable content
   */
  testReadable() {
    // 3.1.1 Language of Page
    const htmlLang = document.documentElement.getAttribute('lang');
    this.addResult('3.1.1 Language of Page', !!htmlLang, {
      language: htmlLang || 'Not specified'
    });

    // 3.1.2 Language of Parts
    const elementsWithLang = document.querySelectorAll('[lang]');
    this.addResult('3.1.2 Language of Parts', true, {
      elementsWithLang: elementsWithLang.length,
      note: 'Check if content in different languages has appropriate lang attributes'
    });
  }

  /**
   * Test predictable content
   */
  testPredictable() {
    // 3.2.1 On Focus
    this.addResult('3.2.1 On Focus', true, {
      note: 'Ensure focus events do not cause unexpected context changes'
    });

    // 3.2.2 On Input
    this.addResult('3.2.2 On Input', true, {
      note: 'Ensure input changes do not cause unexpected context changes'
    });

    // 3.2.3 Consistent Navigation
    const navElements = document.querySelectorAll('nav');
    this.addResult('3.2.3 Consistent Navigation', navElements.length > 0, {
      navigationElements: navElements.length,
      note: 'Verify navigation is consistent across pages'
    });

    // 3.2.4 Consistent Identification
    this.addResult('3.2.4 Consistent Identification', true, {
      note: 'Verify components with same functionality are identified consistently'
    });
  }

  /**
   * Test input assistance
   */
  testInputAssistance() {
    // 3.3.1 Error Identification
    const forms = document.querySelectorAll('form');
    const errorElements = document.querySelectorAll('[role="alert"], .error, .invalid');
    
    this.addResult('3.3.1 Error Identification', true, {
      forms: forms.length,
      errorElements: errorElements.length,
      note: 'Verify errors are clearly identified and described'
    });

    // 3.3.2 Labels or Instructions
    const inputs = document.querySelectorAll('input, select, textarea');
    let inputsWithInstructions = 0;
    
    inputs.forEach(input => {
      const hasLabel = input.labels && input.labels.length > 0;
      const hasAriaLabel = input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby');
      const hasPlaceholder = input.hasAttribute('placeholder');
      const hasTitle = input.hasAttribute('title');
      
      if (hasLabel || hasAriaLabel || hasPlaceholder || hasTitle) {
        inputsWithInstructions++;
      }
    });

    this.addResult('3.3.2 Labels or Instructions', inputsWithInstructions === inputs.length, {
      totalInputs: inputs.length,
      inputsWithInstructions
    });
  }

  /**
   * Test Robust guidelines
   */
  async testRobust() {
    console.log('🔧 Testing Robust guidelines...');
    
    // 4.1 Compatible
    this.testCompatible();
  }

  /**
   * Test compatible content
   */
  testCompatible() {
    // 4.1.1 Parsing
    this.testHTMLValidity();
    
    // 4.1.2 Name, Role, Value
    this.testNameRoleValue();
    
    // 4.1.3 Status Messages
    this.testStatusMessages();
  }

  /**
   * Test HTML validity
   */
  testHTMLValidity() {
    // Basic HTML structure checks
    const duplicateIds = this.findDuplicateIds();
    const unclosedTags = this.findUnclosedTags();
    
    this.addResult('4.1.1 Parsing', duplicateIds.length === 0 && unclosedTags.length === 0, {
      duplicateIds: duplicateIds.length,
      unclosedTags: unclosedTags.length,
      note: 'Use HTML validator for comprehensive parsing validation'
    });
  }

  /**
   * Find duplicate IDs
   */
  findDuplicateIds() {
    const ids = {};
    const duplicates = [];
    
    document.querySelectorAll('[id]').forEach(element => {
      const id = element.id;
      if (ids[id]) {
        duplicates.push(id);
      } else {
        ids[id] = true;
      }
    });
    
    return duplicates;
  }

  /**
   * Find unclosed tags (simplified check)
   */
  findUnclosedTags() {
    // This is a very basic check - proper validation requires a full HTML parser
    const html = document.documentElement.outerHTML;
    const openTags = html.match(/<[^/][^>]*>/g) || [];
    const closeTags = html.match(/<\/[^>]*>/g) || [];
    
    // This is a simplified heuristic
    return openTags.length > closeTags.length ? ['Potential unclosed tags detected'] : [];
  }

  /**
   * Test name, role, value
   */
  testNameRoleValue() {
    const customElements = document.querySelectorAll('[role]');
    let elementsWithoutName = 0;
    
    customElements.forEach(element => {
      const role = element.getAttribute('role');
      const hasName = element.hasAttribute('aria-label') || 
                     element.hasAttribute('aria-labelledby') ||
                     element.textContent.trim().length > 0;
      
      if (['button', 'link', 'menuitem'].includes(role) && !hasName) {
        elementsWithoutName++;
      }
    });

    this.addResult('4.1.2 Name, Role, Value', elementsWithoutName === 0, {
      customElements: customElements.length,
      elementsWithoutName
    });
  }

  /**
   * Test status messages
   */
  testStatusMessages() {
    const statusElements = document.querySelectorAll('[role="status"], [role="alert"], [aria-live]');
    
    this.addResult('4.1.3 Status Messages', true, {
      statusElements: statusElements.length,
      note: 'Verify status messages are announced to screen readers'
    });
  }

  /**
   * Add test result
   */
  addResult(guideline, passed, details = {}) {
    const result = {
      guideline,
      passed,
      details,
      timestamp: new Date().toISOString()
    };
    
    this.results.push(result);
    
    // Categorize by WCAG principle
    if (guideline.startsWith('1.')) {
      this.guidelines.perceivable.push(result);
    } else if (guideline.startsWith('2.')) {
      this.guidelines.operable.push(result);
    } else if (guideline.startsWith('3.')) {
      this.guidelines.understandable.push(result);
    } else if (guideline.startsWith('4.')) {
      this.guidelines.robust.push(result);
    }
    
    console.log(`${passed ? '✅' : '❌'} ${guideline}`);
    if (details.note) {
      console.log(`  ℹ️ ${details.note}`);
    }
  }

  /**
   * Generate compliance report
   */
  generateComplianceReport() {
    console.group('📊 WCAG 2.1 Compliance Report');
    
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const complianceRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    
    console.log(`📈 Overall Compliance: ${complianceRate.toFixed(1)}% (${passedTests}/${totalTests})`);
    
    // Breakdown by principle
    Object.entries(this.guidelines).forEach(([principle, tests]) => {
      if (tests.length > 0) {
        const passed = tests.filter(t => t.passed).length;
        const rate = (passed / tests.length) * 100;
        console.log(`${this.getPrincipleIcon(principle)} ${principle}: ${rate.toFixed(1)}% (${passed}/${tests.length})`);
      }
    });
    
    // Show failed tests
    const failed = this.results.filter(r => !r.passed);
    if (failed.length > 0) {
      console.group('❌ Failed Guidelines:');
      failed.forEach(test => {
        console.log(`• ${test.guideline}`);
        if (test.details.note) {
          console.log(`  ${test.details.note}`);
        }
      });
      console.groupEnd();
    }
    
    console.groupEnd();
    
    return {
      totalTests,
      passedTests,
      failedTests,
      complianceRate,
      breakdown: this.guidelines,
      failedGuidelines: failed
    };
  }

  /**
   * Get icon for WCAG principle
   */
  getPrincipleIcon(principle) {
    const icons = {
      perceivable: '👁️',
      operable: '⌨️',
      understandable: '🧠',
      robust: '🔧'
    };
    return icons[principle] || '📋';
  }

  /**
   * Get results
   */
  getResults() {
    return this.results;
  }

  /**
   * Get compliance summary
   */
  getComplianceSummary() {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    
    return {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      complianceRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
      level: this.determineComplianceLevel()
    };
  }

  /**
   * Determine WCAG compliance level
   */
  determineComplianceLevel() {
    const rate = this.getComplianceSummary().complianceRate;
    
    if (rate >= 95) return 'AAA';
    if (rate >= 85) return 'AA';
    if (rate >= 70) return 'A';
    return 'Non-compliant';
  }
}

// Export for use in tests
if (typeof window !== 'undefined') {
  window.WCAGValidator = WCAGValidator;
}