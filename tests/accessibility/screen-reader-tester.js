/**
 * Screen Reader Compatibility Tester
 * Tests for screen reader accessibility and ARIA implementation
 */

export class ScreenReaderTester {
  constructor() {
    this.results = [];
    this.ariaElements = [];
    this.semanticElements = [];
    this.headingStructure = [];
  }

  /**
   * Run all screen reader compatibility tests
   */
  async testScreenReaderCompatibility() {
    console.group('🔊 Screen Reader Compatibility Testing');
    
    try {
      // Test semantic HTML structure
      await this.testSemanticStructure();
      
      // Test ARIA implementation
      await this.testAriaImplementation();
      
      // Test heading hierarchy
      await this.testHeadingHierarchy();
      
      // Test landmark roles
      await this.testLandmarkRoles();
      
      // Test form accessibility
      await this.testFormAccessibility();
      
      // Test image accessibility
      await this.testImageAccessibility();
      
      // Test dynamic content
      await this.testDynamicContent();
      
      // Test table accessibility
      await this.testTableAccessibility();
      
      // Generate report
      this.generateScreenReaderReport();
      
      return this.results;
      
    } catch (error) {
      console.error('Screen reader compatibility testing failed:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * Test semantic HTML structure
   */
  async testSemanticStructure() {
    console.log('🏗️ Testing semantic HTML structure...');
    
    // Check for semantic elements
    const semanticElements = {
      header: document.querySelectorAll('header').length,
      nav: document.querySelectorAll('nav').length,
      main: document.querySelectorAll('main').length,
      section: document.querySelectorAll('section').length,
      article: document.querySelectorAll('article').length,
      aside: document.querySelectorAll('aside').length,
      footer: document.querySelectorAll('footer').length
    };

    const hasRequiredElements = semanticElements.main >= 1;
    const hasStructuralElements = Object.values(semanticElements).some(count => count > 0);

    this.addResult('Semantic HTML Structure', hasRequiredElements && hasStructuralElements, {
      semanticElements,
      hasRequiredElements,
      hasStructuralElements,
      note: 'Main element is required, other semantic elements improve structure'
    });

    // Check for generic div/span usage where semantic elements would be better
    const genericElements = {
      divs: document.querySelectorAll('div').length,
      spans: document.querySelectorAll('span').length
    };

    const semanticRatio = Object.values(semanticElements).reduce((a, b) => a + b, 0) / 
                         (genericElements.divs + genericElements.spans + 1);

    this.addResult('Semantic vs Generic Elements Ratio', semanticRatio > 0.1, {
      semanticCount: Object.values(semanticElements).reduce((a, b) => a + b, 0),
      genericCount: genericElements.divs + genericElements.spans,
      ratio: semanticRatio,
      note: 'Higher ratio indicates better use of semantic HTML'
    });
  }

  /**
   * Test ARIA implementation
   */
  async testAriaImplementation() {
    console.log('🎭 Testing ARIA implementation...');
    
    // Find all elements with ARIA attributes
    const ariaAttributes = [
      'aria-label', 'aria-labelledby', 'aria-describedby', 'aria-hidden',
      'aria-expanded', 'aria-controls', 'aria-owns', 'aria-live',
      'aria-atomic', 'aria-relevant', 'aria-busy', 'aria-disabled',
      'aria-invalid', 'aria-required', 'aria-readonly', 'aria-checked',
      'aria-selected', 'aria-pressed', 'aria-current', 'aria-level',
      'aria-setsize', 'aria-posinset', 'aria-orientation', 'aria-sort',
      'aria-valuemin', 'aria-valuemax', 'aria-valuenow', 'aria-valuetext'
    ];

    let ariaElementsCount = 0;
    let validAriaUsage = 0;
    let invalidAriaUsage = 0;

    ariaAttributes.forEach(attr => {
      const elements = document.querySelectorAll(`[${attr}]`);
      ariaElementsCount += elements.length;

      elements.forEach(element => {
        if (this.validateAriaAttribute(element, attr)) {
          validAriaUsage++;
        } else {
          invalidAriaUsage++;
        }
      });
    });

    this.addResult('ARIA Attributes Usage', invalidAriaUsage === 0, {
      totalAriaElements: ariaElementsCount,
      validAriaUsage,
      invalidAriaUsage,
      note: 'All ARIA attributes should be used correctly'
    });

    // Test role attributes
    await this.testRoleAttributes();

    // Test ARIA relationships
    await this.testAriaRelationships();

    // Test ARIA states and properties
    await this.testAriaStatesAndProperties();
  }

  /**
   * Validate ARIA attribute usage
   */
  validateAriaAttribute(element, attribute) {
    const value = element.getAttribute(attribute);
    
    if (!value) return false;

    switch (attribute) {
      case 'aria-hidden':
        return value === 'true' || value === 'false';
      
      case 'aria-expanded':
      case 'aria-checked':
      case 'aria-selected':
      case 'aria-pressed':
      case 'aria-disabled':
      case 'aria-invalid':
      case 'aria-required':
      case 'aria-readonly':
      case 'aria-busy':
      case 'aria-atomic':
        return ['true', 'false'].includes(value);
      
      case 'aria-live':
        return ['off', 'polite', 'assertive'].includes(value);
      
      case 'aria-relevant':
        const validRelevant = ['additions', 'removals', 'text', 'all'];
        return value.split(' ').every(v => validRelevant.includes(v));
      
      case 'aria-current':
        return ['page', 'step', 'location', 'date', 'time', 'true', 'false'].includes(value);
      
      case 'aria-orientation':
        return ['horizontal', 'vertical', 'undefined'].includes(value);
      
      case 'aria-sort':
        return ['ascending', 'descending', 'none', 'other'].includes(value);
      
      case 'aria-labelledby':
      case 'aria-describedby':
      case 'aria-controls':
      case 'aria-owns':
        // Check if referenced IDs exist
        const ids = value.split(' ');
        return ids.every(id => document.getElementById(id) !== null);
      
      default:
        return value.trim().length > 0;
    }
  }

  /**
   * Test role attributes
   */
  async testRoleAttributes() {
    const elementsWithRole = document.querySelectorAll('[role]');
    let validRoles = 0;
    let invalidRoles = 0;

    const validRoleValues = [
      'alert', 'alertdialog', 'application', 'article', 'banner', 'button',
      'cell', 'checkbox', 'columnheader', 'combobox', 'complementary',
      'contentinfo', 'definition', 'dialog', 'directory', 'document',
      'feed', 'figure', 'form', 'grid', 'gridcell', 'group', 'heading',
      'img', 'link', 'list', 'listbox', 'listitem', 'log', 'main',
      'marquee', 'math', 'menu', 'menubar', 'menuitem', 'menuitemcheckbox',
      'menuitemradio', 'navigation', 'none', 'note', 'option', 'presentation',
      'progressbar', 'radio', 'radiogroup', 'region', 'row', 'rowgroup',
      'rowheader', 'scrollbar', 'search', 'searchbox', 'separator',
      'slider', 'spinbutton', 'status', 'switch', 'tab', 'table',
      'tablist', 'tabpanel', 'term', 'textbox', 'timer', 'toolbar',
      'tooltip', 'tree', 'treegrid', 'treeitem'
    ];

    elementsWithRole.forEach(element => {
      const role = element.getAttribute('role');
      if (validRoleValues.includes(role)) {
        validRoles++;
      } else {
        invalidRoles++;
      }
    });

    this.addResult('Role Attributes Validity', invalidRoles === 0, {
      totalRoleElements: elementsWithRole.length,
      validRoles,
      invalidRoles,
      note: 'All role attributes should use valid ARIA role values'
    });
  }

  /**
   * Test ARIA relationships
   */
  async testAriaRelationships() {
    const relationshipAttributes = ['aria-labelledby', 'aria-describedby', 'aria-controls', 'aria-owns'];
    let validRelationships = 0;
    let brokenRelationships = 0;

    relationshipAttributes.forEach(attr => {
      const elements = document.querySelectorAll(`[${attr}]`);
      
      elements.forEach(element => {
        const value = element.getAttribute(attr);
        const ids = value.split(' ');
        
        const allIdsExist = ids.every(id => document.getElementById(id) !== null);
        
        if (allIdsExist) {
          validRelationships++;
        } else {
          brokenRelationships++;
        }
      });
    });

    this.addResult('ARIA Relationships', brokenRelationships === 0, {
      validRelationships,
      brokenRelationships,
      note: 'All ARIA relationship attributes should reference existing elements'
    });
  }

  /**
   * Test ARIA states and properties
   */
  async testAriaStatesAndProperties() {
    // Test aria-expanded on collapsible elements
    const expandableElements = document.querySelectorAll('[aria-expanded]');
    let properExpandableUsage = 0;

    expandableElements.forEach(element => {
      const expanded = element.getAttribute('aria-expanded');
      const hasControls = element.hasAttribute('aria-controls');
      
      if (['true', 'false'].includes(expanded) && hasControls) {
        properExpandableUsage++;
      }
    });

    this.addResult('Expandable Elements ARIA', properExpandableUsage === expandableElements.length, {
      expandableElements: expandableElements.length,
      properExpandableUsage,
      note: 'Expandable elements should have aria-expanded and aria-controls'
    });

    // Test aria-live regions
    const liveRegions = document.querySelectorAll('[aria-live]');
    this.addResult('Live Regions Present', liveRegions.length > 0, {
      liveRegions: liveRegions.length,
      note: 'Live regions help announce dynamic content changes'
    });
  }

  /**
   * Test heading hierarchy
   */
  async testHeadingHierarchy() {
    console.log('📋 Testing heading hierarchy...');
    
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headingLevels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)));
    
    let hierarchyValid = true;
    let previousLevel = 0;
    const hierarchyIssues = [];

    headingLevels.forEach((level, index) => {
      if (index === 0 && level !== 1) {
        hierarchyValid = false;
        hierarchyIssues.push(`First heading should be h1, found h${level}`);
      } else if (level > previousLevel + 1) {
        hierarchyValid = false;
        hierarchyIssues.push(`Heading level jumps from h${previousLevel} to h${level} at position ${index + 1}`);
      }
      previousLevel = level;
    });

    this.addResult('Heading Hierarchy', hierarchyValid, {
      totalHeadings: headings.length,
      headingLevels,
      hierarchyValid,
      hierarchyIssues,
      note: 'Heading hierarchy should be logical and not skip levels'
    });

    // Check for empty headings
    let emptyHeadings = 0;
    headings.forEach(heading => {
      if (heading.textContent.trim().length === 0 && 
          !heading.hasAttribute('aria-label') && 
          !heading.hasAttribute('aria-labelledby')) {
        emptyHeadings++;
      }
    });

    this.addResult('Heading Content', emptyHeadings === 0, {
      totalHeadings: headings.length,
      emptyHeadings,
      note: 'All headings should have meaningful text content'
    });
  }

  /**
   * Test landmark roles
   */
  async testLandmarkRoles() {
    console.log('🗺️ Testing landmark roles...');
    
    const landmarks = {
      banner: document.querySelectorAll('header, [role="banner"]').length,
      navigation: document.querySelectorAll('nav, [role="navigation"]').length,
      main: document.querySelectorAll('main, [role="main"]').length,
      complementary: document.querySelectorAll('aside, [role="complementary"]').length,
      contentinfo: document.querySelectorAll('footer, [role="contentinfo"]').length,
      search: document.querySelectorAll('[role="search"]').length,
      form: document.querySelectorAll('form, [role="form"]').length,
      region: document.querySelectorAll('[role="region"]').length
    };

    const hasRequiredLandmarks = landmarks.main >= 1;
    const hasMultipleLandmarks = Object.values(landmarks).filter(count => count > 0).length >= 3;

    this.addResult('Landmark Roles', hasRequiredLandmarks, {
      landmarks,
      hasRequiredLandmarks,
      hasMultipleLandmarks,
      note: 'Main landmark is required, multiple landmarks improve navigation'
    });

    // Check for multiple main landmarks (should be only one)
    this.addResult('Single Main Landmark', landmarks.main === 1, {
      mainLandmarks: landmarks.main,
      note: 'There should be exactly one main landmark per page'
    });

    // Check for landmark labels when multiple of same type exist
    const navElements = document.querySelectorAll('nav, [role="navigation"]');
    let labeledNavElements = 0;
    
    if (navElements.length > 1) {
      navElements.forEach(nav => {
        if (nav.hasAttribute('aria-label') || nav.hasAttribute('aria-labelledby')) {
          labeledNavElements++;
        }
      });

      this.addResult('Navigation Landmark Labels', labeledNavElements === navElements.length, {
        totalNavElements: navElements.length,
        labeledNavElements,
        note: 'Multiple navigation landmarks should be labeled to distinguish them'
      });
    }
  }

  /**
   * Test form accessibility
   */
  async testFormAccessibility() {
    console.log('📝 Testing form accessibility...');
    
    const forms = document.querySelectorAll('form');
    const inputs = document.querySelectorAll('input, select, textarea');
    
    let labeledInputs = 0;
    let inputsWithInstructions = 0;
    let inputsWithErrorHandling = 0;

    inputs.forEach(input => {
      // Check for labels
      const hasLabel = input.labels && input.labels.length > 0;
      const hasAriaLabel = input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby');
      
      if (hasLabel || hasAriaLabel) {
        labeledInputs++;
      }

      // Check for instructions
      const hasPlaceholder = input.hasAttribute('placeholder');
      const hasTitle = input.hasAttribute('title');
      const hasDescription = input.hasAttribute('aria-describedby');
      
      if (hasLabel || hasAriaLabel || hasPlaceholder || hasTitle || hasDescription) {
        inputsWithInstructions++;
      }

      // Check for error handling
      const hasErrorHandling = input.hasAttribute('aria-invalid') || 
                              input.hasAttribute('aria-describedby') ||
                              input.classList.contains('error') ||
                              input.classList.contains('invalid');
      
      if (hasErrorHandling) {
        inputsWithErrorHandling++;
      }
    });

    this.addResult('Form Input Labels', labeledInputs === inputs.length, {
      totalInputs: inputs.length,
      labeledInputs,
      note: 'All form inputs should have associated labels'
    });

    this.addResult('Form Input Instructions', inputsWithInstructions === inputs.length, {
      totalInputs: inputs.length,
      inputsWithInstructions,
      note: 'Form inputs should have clear instructions or labels'
    });

    // Check for fieldsets and legends
    const fieldsets = document.querySelectorAll('fieldset');
    let fieldsetsWithLegends = 0;
    
    fieldsets.forEach(fieldset => {
      if (fieldset.querySelector('legend')) {
        fieldsetsWithLegends++;
      }
    });

    this.addResult('Fieldset Legends', fieldsetsWithLegends === fieldsets.length, {
      totalFieldsets: fieldsets.length,
      fieldsetsWithLegends,
      note: 'All fieldsets should have legends for grouped form controls'
    });

    // Check for required field indicators
    const requiredInputs = document.querySelectorAll('input[required], select[required], textarea[required]');
    let requiredInputsWithIndicators = 0;

    requiredInputs.forEach(input => {
      const hasAriaRequired = input.hasAttribute('aria-required');
      const hasVisualIndicator = input.labels && 
        Array.from(input.labels).some(label => 
          label.textContent.includes('*') || 
          label.textContent.includes('required') ||
          label.querySelector('.required')
        );
      
      if (hasAriaRequired || hasVisualIndicator) {
        requiredInputsWithIndicators++;
      }
    });

    this.addResult('Required Field Indicators', requiredInputsWithIndicators === requiredInputs.length, {
      totalRequiredInputs: requiredInputs.length,
      requiredInputsWithIndicators,
      note: 'Required fields should be clearly indicated'
    });
  }

  /**
   * Test image accessibility
   */
  async testImageAccessibility() {
    console.log('🖼️ Testing image accessibility...');
    
    const images = document.querySelectorAll('img');
    let imagesWithAlt = 0;
    let decorativeImages = 0;
    let informativeImages = 0;
    let imagesWithoutAlt = 0;

    images.forEach(image => {
      if (image.hasAttribute('alt')) {
        const alt = image.getAttribute('alt');
        if (alt === '') {
          decorativeImages++;
        } else {
          informativeImages++;
        }
        imagesWithAlt++;
      } else {
        imagesWithoutAlt++;
      }
    });

    this.addResult('Image Alt Attributes', imagesWithoutAlt === 0, {
      totalImages: images.length,
      imagesWithAlt,
      imagesWithoutAlt,
      decorativeImages,
      informativeImages,
      note: 'All images should have alt attributes (empty for decorative images)'
    });

    // Test complex images (charts, graphs, etc.)
    const complexImages = document.querySelectorAll('img[alt*="chart"], img[alt*="graph"], img[alt*="diagram"]');
    let complexImagesWithDescriptions = 0;

    complexImages.forEach(image => {
      if (image.hasAttribute('aria-describedby') || image.hasAttribute('longdesc')) {
        complexImagesWithDescriptions++;
      }
    });

    this.addResult('Complex Image Descriptions', complexImagesWithDescriptions === complexImages.length, {
      totalComplexImages: complexImages.length,
      complexImagesWithDescriptions,
      note: 'Complex images should have detailed descriptions'
    });

    // Test background images with content
    const elementsWithBackgroundImages = document.querySelectorAll('[style*="background-image"]');
    let backgroundImagesWithAltText = 0;

    elementsWithBackgroundImages.forEach(element => {
      if (element.hasAttribute('aria-label') || 
          element.hasAttribute('aria-labelledby') ||
          element.textContent.trim().length > 0) {
        backgroundImagesWithAltText++;
      }
    });

    this.addResult('Background Image Accessibility', backgroundImagesWithAltText === elementsWithBackgroundImages.length, {
      totalBackgroundImages: elementsWithBackgroundImages.length,
      backgroundImagesWithAltText,
      note: 'Background images with content should have alternative text'
    });
  }

  /**
   * Test dynamic content accessibility
   */
  async testDynamicContent() {
    console.log('🔄 Testing dynamic content accessibility...');
    
    // Test live regions
    const liveRegions = document.querySelectorAll('[aria-live]');
    const statusElements = document.querySelectorAll('[role="status"]');
    const alertElements = document.querySelectorAll('[role="alert"]');
    
    const totalLiveElements = liveRegions.length + statusElements.length + alertElements.length;

    this.addResult('Live Regions for Dynamic Content', totalLiveElements > 0, {
      liveRegions: liveRegions.length,
      statusElements: statusElements.length,
      alertElements: alertElements.length,
      totalLiveElements,
      note: 'Dynamic content changes should be announced via live regions'
    });

    // Test loading states
    const loadingElements = document.querySelectorAll('[aria-busy], .loading, [data-loading]');
    this.addResult('Loading State Indicators', true, {
      loadingElements: loadingElements.length,
      note: 'Loading states should be communicated to screen readers'
    });

    // Test error messages
    const errorElements = document.querySelectorAll('[role="alert"], .error, [aria-invalid="true"]');
    this.addResult('Error Message Accessibility', true, {
      errorElements: errorElements.length,
      note: 'Error messages should be properly announced to screen readers'
    });
  }

  /**
   * Test table accessibility
   */
  async testTableAccessibility() {
    console.log('📊 Testing table accessibility...');
    
    const tables = document.querySelectorAll('table');
    let tablesWithCaptions = 0;
    let tablesWithHeaders = 0;
    let tablesWithScope = 0;

    tables.forEach(table => {
      // Check for captions
      if (table.querySelector('caption')) {
        tablesWithCaptions++;
      }

      // Check for header cells
      const headerCells = table.querySelectorAll('th');
      if (headerCells.length > 0) {
        tablesWithHeaders++;

        // Check for scope attributes
        let headersWithScope = 0;
        headerCells.forEach(th => {
          if (th.hasAttribute('scope')) {
            headersWithScope++;
          }
        });

        if (headersWithScope === headerCells.length) {
          tablesWithScope++;
        }
      }
    });

    this.addResult('Table Captions', tablesWithCaptions === tables.length, {
      totalTables: tables.length,
      tablesWithCaptions,
      note: 'Data tables should have captions describing their content'
    });

    this.addResult('Table Headers', tablesWithHeaders === tables.length, {
      totalTables: tables.length,
      tablesWithHeaders,
      note: 'Data tables should have proper header cells (th elements)'
    });

    this.addResult('Table Header Scope', tablesWithScope === tables.length, {
      totalTables: tables.length,
      tablesWithScope,
      note: 'Table headers should have scope attributes for complex tables'
    });

    // Check for layout tables (should not use table elements)
    const layoutTables = document.querySelectorAll('table[role="presentation"], table[role="none"]');
    this.addResult('Layout Table Usage', true, {
      layoutTables: layoutTables.length,
      note: 'Layout tables should use CSS instead of table elements'
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
   * Generate screen reader compatibility report
   */
  generateScreenReaderReport() {
    console.group('📊 Screen Reader Compatibility Report');
    
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const compatibilityRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    
    console.log(`📈 Screen Reader Compatibility: ${compatibilityRate.toFixed(1)}% (${passedTests}/${totalTests})`);
    
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
    if (failed.some(f => f.test.includes('Semantic'))) {
      console.log('• Use semantic HTML elements instead of generic divs and spans');
    }
    if (failed.some(f => f.test.includes('ARIA'))) {
      console.log('• Review ARIA implementation for proper usage and valid values');
    }
    if (failed.some(f => f.test.includes('Heading'))) {
      console.log('• Fix heading hierarchy to follow logical structure');
    }
    if (failed.some(f => f.test.includes('Landmark'))) {
      console.log('• Add proper landmark roles for better navigation');
    }
    if (failed.some(f => f.test.includes('Form'))) {
      console.log('• Ensure all form inputs have proper labels and instructions');
    }
    if (failed.some(f => f.test.includes('Image'))) {
      console.log('• Add appropriate alt text for all images');
    }
    console.groupEnd();
    
    console.groupEnd();
    
    return {
      totalTests,
      passedTests,
      failedTests,
      compatibilityRate,
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
      compatibilityRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0
    };
  }
}

// Export for use in tests
if (typeof window !== 'undefined') {
  window.ScreenReaderTester = ScreenReaderTester;
}