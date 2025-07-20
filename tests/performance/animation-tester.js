/**
 * Animation Performance Tester
 * Tests animation performance to ensure 60fps target
 */

export class AnimationTester {
  constructor() {
    this.targetFPS = 60;
    this.testDuration = 2000; // 2 seconds
    this.frameData = [];
    this.isRunning = false;
  }

  /**
   * Test animation performance
   */
  async testAnimationPerformance() {
    console.group('🎬 Animation Performance Testing');

    try {
      // Test different types of animations
      const results = {
        cssTransforms: await this.testCSSTransforms(),
        cssAnimations: await this.testCSSAnimations(),
        scrollAnimations: await this.testScrollAnimations(),
        jsAnimations: await this.testJSAnimations()
      };

      this.generateAnimationReport(results);
      return results;

    } catch (error) {
      console.error('Animation testing failed:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * Test CSS Transform performance
   */
  async testCSSTransforms() {
    console.log('🔄 Testing CSS Transform performance...');

    // Create test element
    const testElement = this.createTestElement('transform-test');
    testElement.style.cssText = `
      width: 100px;
      height: 100px;
      background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      transition: transform 0.3s ease;
      z-index: 9999;
    `;

    // Start performance measurement
    const frameData = await this.measureFrameRate(() => {
      // Trigger transform animation
      testElement.style.transform = 'translate(-50%, -50%) scale(1.5) rotate(360deg)';

      setTimeout(() => {
        testElement.style.transform = 'translate(-50%, -50%) scale(1) rotate(0deg)';
      }, this.testDuration / 2);
    });

    // Cleanup
    testElement.remove();

    return this.analyzeFrameData(frameData, 'CSS Transforms');
  }

  /**
   * Test CSS Animation performance
   */
  async testCSSAnimations() {
    console.log('✨ Testing CSS Animation performance...');

    // Create test element with CSS animation
    const testElement = this.createTestElement('animation-test');

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes performanceTest {
        0% { transform: translateX(0) rotate(0deg) scale(1); }
        25% { transform: translateX(100px) rotate(90deg) scale(1.2); }
        50% { transform: translateX(100px) translateY(100px) rotate(180deg) scale(1); }
        75% { transform: translateX(0) translateY(100px) rotate(270deg) scale(0.8); }
        100% { transform: translateX(0) translateY(0) rotate(360deg) scale(1); }
      }
      
      .animation-test {
        width: 50px;
        height: 50px;
        background: linear-gradient(45deg, #667eea, #764ba2);
        position: fixed;
        top: 20px;
        left: 20px;
        animation: performanceTest 2s ease-in-out infinite;
        z-index: 9999;
      }
    `;

    document.head.appendChild(style);
    testElement.className = 'animation-test';

    // Measure frame rate
    const frameData = await this.measureFrameRate(() => {
      // Animation runs automatically via CSS
    });

    // Cleanup
    testElement.remove();
    style.remove();

    return this.analyzeFrameData(frameData, 'CSS Animations');
  }

  /**
   * Test scroll-triggered animations
   */
  async testScrollAnimations() {
    console.log('📜 Testing scroll animation performance...');

    // Create scrollable content
    const scrollContainer = this.createScrollableContent();
    const animatedElements = scrollContainer.querySelectorAll('.scroll-animate');

    // Measure frame rate during scroll
    const frameData = await this.measureFrameRate(() => {
      // Simulate scroll events
      this.simulateScroll(scrollContainer);
    });

    // Cleanup
    scrollContainer.remove();

    return this.analyzeFrameData(frameData, 'Scroll Animations');
  }

  /**
   * Test JavaScript-driven animations
   */
  async testJSAnimations() {
    console.log('⚡ Testing JavaScript animation performance...');

    const testElement = this.createTestElement('js-animation-test');
    testElement.style.cssText = `
      width: 80px;
      height: 80px;
      background: linear-gradient(45deg, #f093fb, #f5576c);
      position: fixed;
      top: 100px;
      left: 100px;
      z-index: 9999;
    `;

    let animationId;
    let startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = (elapsed % 2000) / 2000; // 2 second cycle

      // Complex animation calculations
      const x = Math.sin(progress * Math.PI * 2) * 100;
      const y = Math.cos(progress * Math.PI * 2) * 100;
      const rotation = progress * 360;
      const scale = 1 + Math.sin(progress * Math.PI * 4) * 0.3;

      testElement.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale})`;

      if (elapsed < this.testDuration) {
        animationId = requestAnimationFrame(animate);
      }
    };

    // Measure frame rate
    const frameData = await this.measureFrameRate(() => {
      animationId = requestAnimationFrame(animate);
    });

    // Cleanup
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    testElement.remove();

    return this.analyzeFrameData(frameData, 'JavaScript Animations');
  }

  /**
   * Measure frame rate during animation
   */
  async measureFrameRate(animationCallback) {
    return new Promise((resolve) => {
      const frameData = [];
      let startTime = performance.now();
      let lastFrameTime = startTime;
      let frameCount = 0;

      const measureFrame = (currentTime) => {
        const frameTime = currentTime - lastFrameTime;
        frameData.push({
          frameTime,
          timestamp: currentTime,
          frameNumber: frameCount++
        });

        lastFrameTime = currentTime;

        if (currentTime - startTime < this.testDuration) {
          requestAnimationFrame(measureFrame);
        } else {
          resolve(frameData);
        }
      };

      // Start animation
      animationCallback();

      // Start measuring
      requestAnimationFrame(measureFrame);
    });
  }

  /**
   * Analyze frame data for performance metrics
   */
  analyzeFrameData(frameData, testName) {
    if (frameData.length === 0) {
      return {
        testName,
        status: 'FAILED',
        error: 'No frame data collected'
      };
    }

    const totalTime = this.testDuration;
    const frameCount = frameData.length;
    const averageFPS = (frameCount / totalTime) * 1000;

    // Calculate frame time statistics
    const frameTimes = frameData.map(f => f.frameTime);
    const averageFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    const maxFrameTime = Math.max(...frameTimes);
    const minFrameTime = Math.min(...frameTimes);

    // Calculate jank (frames over 16.67ms for 60fps)
    const jankFrames = frameTimes.filter(time => time > 16.67).length;
    const jankPercentage = (jankFrames / frameCount) * 100;

    // Performance thresholds
    const fpsTarget = this.targetFPS;
    const fpsThreshold = fpsTarget * 0.9; // Allow 10% tolerance
    const jankThreshold = 5; // Max 5% jank frames

    const fpsPassed = averageFPS >= fpsThreshold;
    const jankPassed = jankPercentage <= jankThreshold;
    const overallPassed = fpsPassed && jankPassed;

    const result = {
      testName,
      status: overallPassed ? 'PASSED' : 'FAILED',
      metrics: {
        averageFPS: parseFloat(averageFPS.toFixed(2)),
        targetFPS: fpsTarget,
        frameCount,
        averageFrameTime: parseFloat(averageFrameTime.toFixed(2)),
        maxFrameTime: parseFloat(maxFrameTime.toFixed(2)),
        minFrameTime: parseFloat(minFrameTime.toFixed(2)),
        jankFrames,
        jankPercentage: parseFloat(jankPercentage.toFixed(2))
      },
      passed: {
        fps: fpsPassed,
        jank: jankPassed,
        overall: overallPassed
      }
    };

    console.log(`${overallPassed ? '✅' : '❌'} ${testName}:`);
    console.log(`  📊 Average FPS: ${averageFPS.toFixed(2)} (target: ${fpsTarget})`);
    console.log(`  ⏱️ Average Frame Time: ${averageFrameTime.toFixed(2)}ms`);
    console.log(`  🚫 Jank Frames: ${jankFrames} (${jankPercentage.toFixed(2)}%)`);

    return result;
  }

  /**
   * Create test element
   */
  createTestElement(className) {
    const element = document.createElement('div');
    element.className = className;
    document.body.appendChild(element);
    return element;
  }

  /**
   * Create scrollable content for scroll animation testing
   */
  createScrollableContent() {
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 300px;
      height: 200px;
      overflow-y: scroll;
      background: rgba(255, 255, 255, 0.9);
      z-index: 10000;
      border: 2px solid #ccc;
    `;

    // Add content with animated elements
    for (let i = 0; i < 20; i++) {
      const item = document.createElement('div');
      item.className = 'scroll-animate';
      item.style.cssText = `
        height: 60px;
        margin: 10px;
        background: linear-gradient(45deg, hsl(${i * 18}, 70%, 60%), hsl(${i * 18 + 60}, 70%, 60%));
        transform: translateX(-100px);
        opacity: 0;
        transition: transform 0.3s ease, opacity 0.3s ease;
      `;
      item.textContent = `Animated Item ${i + 1}`;
      container.appendChild(item);
    }

    document.body.appendChild(container);
    return container;
  }

  /**
   * Simulate scroll events for testing
   */
  simulateScroll(container) {
    const items = container.querySelectorAll('.scroll-animate');
    let scrollPosition = 0;
    const maxScroll = container.scrollHeight - container.clientHeight;
    const scrollStep = maxScroll / 100;

    const scrollInterval = setInterval(() => {
      scrollPosition += scrollStep;
      container.scrollTop = scrollPosition;

      // Animate visible items
      items.forEach((item, index) => {
        const itemTop = item.offsetTop;
        const itemVisible = itemTop >= container.scrollTop &&
          itemTop <= container.scrollTop + container.clientHeight;

        if (itemVisible) {
          item.style.transform = 'translateX(0)';
          item.style.opacity = '1';
        }
      });

      if (scrollPosition >= maxScroll) {
        clearInterval(scrollInterval);
      }
    }, 16); // ~60fps scroll simulation
  }

  /**
   * Generate comprehensive animation report
   */
  generateAnimationReport(results) {
    console.group('📊 Animation Performance Report');

    const allTests = Object.values(results);
    const passedTests = allTests.filter(test => test.status === 'PASSED').length;
    const failedTests = allTests.filter(test => test.status === 'FAILED').length;

    console.log(`✅ Passed: ${passedTests}/${allTests.length}`);
    console.log(`❌ Failed: ${failedTests}/${allTests.length}`);

    // Overall performance summary
    const avgFPS = allTests
      .filter(test => test.metrics)
      .reduce((sum, test) => sum + test.metrics.averageFPS, 0) /
      allTests.filter(test => test.metrics).length;

    console.log(`📈 Overall Average FPS: ${avgFPS.toFixed(2)}`);

    // Show failed tests details
    const failed = allTests.filter(test => test.status === 'FAILED');
    if (failed.length > 0) {
      console.group('❌ Failed Tests:');
      failed.forEach(test => {
        console.log(`• ${test.testName}: ${test.error || 'Performance below threshold'}`);
        if (test.metrics) {
          console.log(`  FPS: ${test.metrics.averageFPS} (target: ${test.metrics.targetFPS})`);
          console.log(`  Jank: ${test.metrics.jankPercentage}%`);
        }
      });
      console.groupEnd();
    }

    console.groupEnd();
  }

  /**
   * Test specific animation element
   */
  async testElementAnimation(element, duration = 1000) {
    if (!element) {
      throw new Error('Element not found for animation testing');
    }

    console.log(`🎯 Testing animation on element: ${element.tagName}.${element.className}`);

    // Trigger any existing animations
    element.style.animation = 'none';
    element.offsetHeight; // Force reflow
    element.style.animation = null;

    const frameData = await this.measureFrameRate(() => {
      // Element should have its own animations
    });

    return this.analyzeFrameData(frameData, `Element Animation (${element.tagName})`);
  }
}

// Export for use in tests
if (typeof window !== 'undefined') {
  window.AnimationTester = AnimationTester;
}