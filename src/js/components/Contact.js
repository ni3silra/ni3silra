/**
 * Contact Component
 * Animated contact form with real-time validation and social media integration
 */

import { EventEmitter } from '../utils/EventEmitter.js';

export class Contact extends EventEmitter {
  constructor(app) {
    super();
    
    this.app = app;
    this.contactElement = null;
    this.form = null;
    this.formFields = {};
    this.validationRules = {};
    this.isSubmitting = false;
    
    // Form validation state
    this.formState = {
      name: { value: '', isValid: false, error: '' },
      email: { value: '', isValid: false, error: '' },
      subject: { value: '', isValid: false, error: '' },
      message: { value: '', isValid: false, error: '' }
    };
    
    // Social media links
    this.socialLinks = [
      {
        name: 'GitHub',
        url: 'https://github.com/username',
        icon: '📁',
        description: 'View my code repositories'
      },
      {
        name: 'LinkedIn',
        url: 'https://linkedin.com/in/username',
        icon: '💼',
        description: 'Connect professionally'
      },
      {
        name: 'Twitter',
        url: 'https://twitter.com/username',
        icon: '🐦',
        description: 'Follow for tech updates'
      },
      {
        name: 'Email',
        url: 'mailto:contact@example.com',
        icon: '✉️',
        description: 'Send me an email'
      }
    ];
    
    // Bind methods
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleFieldInput = this.handleFieldInput.bind(this);
    this.handleFieldFocus = this.handleFieldFocus.bind(this);
    this.handleFieldBlur = this.handleFieldBlur.bind(this);
  }
  
  /**
   * Initialize the contact component
   */
  init() {
    this.setupValidationRules();
    this.createContactContent();
    this.setupEventListeners();
    this.setupIntersectionObserver();
    
    console.log('Contact component initialized');
  }
  
  /**
   * Set up form validation rules
   */
  setupValidationRules() {
    this.validationRules = {
      name: {
        required: true,
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-Z\s'-]+$/,
        message: 'Please enter a valid name (2-50 characters, letters only)'
      },
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
      },
      subject: {
        required: true,
        minLength: 5,
        maxLength: 100,
        message: 'Subject must be between 5-100 characters'
      },
      message: {
        required: true,
        minLength: 10,
        maxLength: 1000,
        message: 'Message must be between 10-1000 characters'
      }
    };
  }
  
  /**
   * Create the contact HTML structure
   */
  createContactContent() {
    const contactSection = document.getElementById('contact');
    if (!contactSection) {
      console.error('Contact section not found');
      return;
    }
    
    contactSection.innerHTML = `
      <div class="contact-container">
        <header class="contact-header">
          <h2 class="contact-title">Get In Touch</h2>
          <p class="contact-subtitle">
            Ready to discuss your next project? I'd love to hear from you. 
            Let's build something amazing together.
          </p>
        </header>
        
        <div class="contact-content">
          <aside class="contact-info" role="complementary" aria-labelledby="contact-info-heading">
            <h3 id="contact-info-heading" class="sr-only">Contact information and details</h3>
            
            <div class="info-card" role="region" aria-labelledby="lets-talk-heading">
              <div class="info-icon" aria-hidden="true">💬</div>
              <div class="info-content">
                <h4 id="lets-talk-heading">Let's Talk</h4>
                <p>I'm always interested in new opportunities and exciting projects. Whether you have a question or just want to say hi, I'll try my best to get back to you!</p>
              </div>
            </div>
            
            <div class="info-card" role="region" aria-labelledby="quick-response-heading">
              <div class="info-icon" aria-hidden="true">⚡</div>
              <div class="info-content">
                <h4 id="quick-response-heading">Quick Response</h4>
                <p>I typically respond to messages within 24 hours. For urgent inquiries, feel free to reach out via LinkedIn or email directly.</p>
              </div>
            </div>
            
            <div class="info-card" role="region" aria-labelledby="remote-friendly-heading">
              <div class="info-icon" aria-hidden="true">🌍</div>
              <div class="info-content">
                <h4 id="remote-friendly-heading">Remote Friendly</h4>
                <p>I work with clients and teams worldwide. Time zones are never a problem - we'll find a way to make it work!</p>
              </div>
            </div>
            
            <nav class="social-links" aria-labelledby="social-links-heading">
              <h4 id="social-links-heading">Connect With Me</h4>
              <div class="social-grid" role="list" aria-label="Social media and contact links">
                ${this.generateSocialLinks()}
              </div>
            </nav>
          </aside>
          
          <div class="contact-form-container">
            <form class="contact-form" 
                  id="contact-form" 
                  novalidate
                  aria-labelledby="contact-form-heading"
                  aria-describedby="contact-form-description">
              <h3 id="contact-form-heading" class="sr-only">Contact form</h3>
              <p id="contact-form-description" class="sr-only">
                Fill out this form to send me a message. All fields marked with an asterisk are required.
              </p>
              
              <div class="form-group">
                <label for="name" class="form-label">
                  Name <span class="required" aria-label="required">*</span>
                </label>
                <div class="input-container">
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    class="form-input" 
                    required
                    autocomplete="name"
                    placeholder="Your full name"
                    aria-describedby="name-error name-help"
                    aria-invalid="false"
                  >
                  <div class="input-border" aria-hidden="true"></div>
                  <div class="field-icon" aria-hidden="true">👤</div>
                  <div id="name-help" class="sr-only">Enter your full name for contact purposes</div>
                </div>
                <div class="field-error" id="name-error" role="alert" aria-live="polite"></div>
              </div>
              
              <div class="form-group">
                <label for="email" class="form-label">
                  Email <span class="required" aria-label="required">*</span>
                </label>
                <div class="input-container">
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    class="form-input" 
                    required
                    autocomplete="email"
                    placeholder="your.email@example.com"
                    aria-describedby="email-error email-help"
                    aria-invalid="false"
                  >
                  <div class="input-border" aria-hidden="true"></div>
                  <div class="field-icon" aria-hidden="true">✉️</div>
                  <div id="email-help" class="sr-only">Enter a valid email address where I can respond to you</div>
                </div>
                <div class="field-error" id="email-error" role="alert" aria-live="polite"></div>
              </div>
              
              <div class="form-group">
                <label for="subject" class="form-label">
                  Subject <span class="required" aria-label="required">*</span>
                </label>
                <div class="input-container">
                  <input 
                    type="text" 
                    id="subject" 
                    name="subject" 
                    class="form-input" 
                    required
                    placeholder="What's this about?"
                    aria-describedby="subject-error subject-help"
                    aria-invalid="false"
                  >
                  <div class="input-border" aria-hidden="true"></div>
                  <div class="field-icon" aria-hidden="true">💭</div>
                  <div id="subject-help" class="sr-only">Brief subject line describing your message</div>
                </div>
                <div class="field-error" id="subject-error" role="alert" aria-live="polite"></div>
              </div>
              
              <div class="form-group">
                <label for="message" class="form-label">
                  Message <span class="required" aria-label="required">*</span>
                </label>
                <div class="input-container">
                  <textarea 
                    id="message" 
                    name="message" 
                    class="form-input form-textarea" 
                    required
                    rows="5"
                    placeholder="Tell me about your project or just say hello..."
                    aria-describedby="message-error message-help character-count"
                    aria-invalid="false"
                  ></textarea>
                  <div class="input-border" aria-hidden="true"></div>
                  <div class="field-icon" aria-hidden="true">📝</div>
                  <div id="character-count" class="character-count" aria-live="polite">
                    <span class="current-count">0</span>/<span class="max-count">1000</span>
                    <span class="sr-only">characters used out of 1000 maximum</span>
                  </div>
                  <div id="message-help" class="sr-only">Detailed message about your project, question, or inquiry</div>
                </div>
                <div class="field-error" id="message-error" role="alert" aria-live="polite"></div>
              </div>
              
              <div class="form-actions">
                <button type="submit" 
                        class="submit-btn" 
                        id="submit-btn"
                        aria-describedby="submit-help">
                  <span class="btn-text">Send Message</span>
                  <span class="btn-icon" aria-hidden="true">🚀</span>
                  <div class="btn-loading" aria-hidden="true">
                    <div class="loading-spinner"></div>
                  </div>
                  <span id="submit-help" class="sr-only">Submit the contact form to send your message</span>
                </button>
                
                <div class="form-status" 
                     id="form-status" 
                     role="status" 
                     aria-live="polite" 
                     aria-atomic="true"></div>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
    
    // Cache DOM elements
    this.contactElement = contactSection;
    this.form = document.getElementById('contact-form');
    this.formFields = {
      name: document.getElementById('name'),
      email: document.getElementById('email'),
      subject: document.getElementById('subject'),
      message: document.getElementById('message')
    };
    this.submitBtn = document.getElementById('submit-btn');
    this.formStatus = document.getElementById('form-status');
  }
  
  /**
   * Generate social links HTML
   */
  generateSocialLinks() {
    return this.socialLinks.map((link, index) => `
      <a href="${link.url}" 
         class="social-link" 
         target="_blank" 
         rel="noopener noreferrer"
         role="listitem"
         aria-label="${link.name}: ${link.description}"
         aria-describedby="social-${index}-desc">
        <div class="social-icon" aria-hidden="true">${link.icon}</div>
        <div class="social-name">${link.name}</div>
        <span id="social-${index}-desc" class="sr-only">${link.description}</span>
      </a>
    `).join('');
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Form submission
    if (this.form) {
      this.form.addEventListener('submit', this.handleFormSubmit);
    }
    
    // Field event listeners
    Object.entries(this.formFields).forEach(([fieldName, field]) => {
      if (field) {
        field.addEventListener('input', this.handleFieldInput);
        field.addEventListener('focus', this.handleFieldFocus);
        field.addEventListener('blur', this.handleFieldBlur);
      }
    });
    
    // Character counter for message field
    if (this.formFields.message) {
      this.formFields.message.addEventListener('input', this.updateCharacterCount.bind(this));
    }
    
    // Listen to app events
    this.app.on('section:active', this.handleSectionActive.bind(this));
  }
  
  /**
   * Set up intersection observer for animations
   */
  setupIntersectionObserver() {
    this.contactObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -10% 0px'
      }
    );
    
    // Observe contact elements
    const animatedElements = this.contactElement.querySelectorAll('.info-card, .contact-form, .social-link');
    animatedElements.forEach(element => {
      this.contactObserver.observe(element);
    });
  }
  
  /**
   * Handle form submission
   */
  async handleFormSubmit(event) {
    event.preventDefault();
    
    if (this.isSubmitting) return;
    
    // Validate all fields
    const isFormValid = this.validateAllFields();
    
    if (!isFormValid) {
      this.showFormStatus('Please fix the errors above', 'error');
      return;
    }
    
    this.isSubmitting = true;
    this.updateSubmitButton('loading');
    
    try {
      // Simulate form submission (replace with actual API call)
      await this.submitForm();
      
      this.showFormStatus('Message sent successfully! I\'ll get back to you soon.', 'success');
      this.resetForm();
      
    } catch (error) {
      console.error('Form submission error:', error);
      this.showFormStatus('Sorry, there was an error sending your message. Please try again.', 'error');
    } finally {
      this.isSubmitting = false;
      this.updateSubmitButton('default');
    }
  }
  
  /**
   * Submit form data (placeholder implementation)
   */
  async submitForm() {
    const formData = {
      name: this.formState.name.value,
      email: this.formState.email.value,
      subject: this.formState.subject.value,
      message: this.formState.message.value,
      timestamp: new Date().toISOString()
    };
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real implementation, you would send this to your backend
    console.log('Form submitted:', formData);
    
    this.emit('contact:form-submit', formData);
  }
  
  /**
   * Handle field input events
   */
  handleFieldInput(event) {
    const field = event.target;
    const fieldName = field.name;
    const value = field.value;
    
    // Update form state
    this.formState[fieldName].value = value;
    
    // Real-time validation
    this.validateField(fieldName, value);
    
    // Update field appearance
    this.updateFieldAppearance(field, this.formState[fieldName].isValid);
  }
  
  /**
   * Handle field focus events
   */
  handleFieldFocus(event) {
    const field = event.target;
    const container = field.closest('.input-container');
    
    if (container) {
      container.classList.add('focused');
    }
    
    // Clear error state on focus
    this.clearFieldError(field.name);
  }
  
  /**
   * Handle field blur events
   */
  handleFieldBlur(event) {
    const field = event.target;
    const container = field.closest('.input-container');
    
    if (container) {
      container.classList.remove('focused');
    }
    
    // Validate field on blur
    this.validateField(field.name, field.value);
  }
  
  /**
   * Validate a single field
   */
  validateField(fieldName, value) {
    const rules = this.validationRules[fieldName];
    if (!rules) return true;
    
    let isValid = true;
    let error = '';
    
    // Required validation
    if (rules.required && !value.trim()) {
      isValid = false;
      error = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    
    // Length validation
    else if (rules.minLength && value.length < rules.minLength) {
      isValid = false;
      error = rules.message;
    }
    else if (rules.maxLength && value.length > rules.maxLength) {
      isValid = false;
      error = rules.message;
    }
    
    // Pattern validation
    else if (rules.pattern && !rules.pattern.test(value)) {
      isValid = false;
      error = rules.message;
    }
    
    // Update form state
    this.formState[fieldName].isValid = isValid;
    this.formState[fieldName].error = error;
    
    // Show/hide error
    if (isValid) {
      this.clearFieldError(fieldName);
    } else {
      this.showFieldError(fieldName, error);
    }
    
    return isValid;
  }
  
  /**
   * Validate all form fields
   */
  validateAllFields() {
    let isFormValid = true;
    
    Object.entries(this.formFields).forEach(([fieldName, field]) => {
      if (field) {
        const isFieldValid = this.validateField(fieldName, field.value);
        if (!isFieldValid) {
          isFormValid = false;
        }
      }
    });
    
    return isFormValid;
  }
  
  /**
   * Show field error
   */
  showFieldError(fieldName, error) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    const field = this.formFields[fieldName];
    const container = field?.closest('.input-container');
    
    if (errorElement) {
      errorElement.textContent = error;
      errorElement.style.display = 'block';
    }
    
    if (field) {
      field.setAttribute('aria-invalid', 'true');
    }
    
    if (container) {
      container.classList.add('error');
    }
    
    // Announce error to screen readers
    this.announceFieldError(fieldName, error);
  }
  
  /**
   * Clear field error
   */
  clearFieldError(fieldName) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    const field = this.formFields[fieldName];
    const container = field?.closest('.input-container');
    
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
    
    if (field) {
      field.setAttribute('aria-invalid', 'false');
    }
    
    if (container) {
      container.classList.remove('error');
    }
  }
  
  /**
   * Announce field error to screen readers
   */
  announceFieldError(fieldName, error) {
    const fieldLabel = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
    const announcement = `${fieldLabel} field error: ${error}`;
    
    // Use the global ARIA live region for announcements
    const ariaAnnouncements = document.getElementById('aria-announcements');
    if (ariaAnnouncements) {
      ariaAnnouncements.textContent = announcement;
    }
  }
  
  /**
   * Update field appearance based on validation
   */
  updateFieldAppearance(field, isValid) {
    const container = field.closest('.input-container');
    if (!container) return;
    
    if (field.value.trim()) {
      container.classList.add('has-value');
      
      if (isValid) {
        container.classList.add('valid');
        container.classList.remove('error');
      }
    } else {
      container.classList.remove('has-value', 'valid');
    }
  }
  
  /**
   * Update character count for message field
   */
  updateCharacterCount() {
    const messageField = this.formFields.message;
    const currentCount = messageField.value.length;
    const maxCount = this.validationRules.message.maxLength;
    
    const currentCountElement = this.contactElement.querySelector('.current-count');
    const characterCountContainer = this.contactElement.querySelector('.character-count');
    
    if (currentCountElement) {
      currentCountElement.textContent = currentCount;
    }
    
    if (characterCountContainer) {
      if (currentCount > maxCount * 0.9) {
        characterCountContainer.classList.add('warning');
      } else {
        characterCountContainer.classList.remove('warning');
      }
      
      if (currentCount > maxCount) {
        characterCountContainer.classList.add('error');
      } else {
        characterCountContainer.classList.remove('error');
      }
    }
  }
  
  /**
   * Update submit button state
   */
  updateSubmitButton(state) {
    if (!this.submitBtn) return;
    
    const btnText = this.submitBtn.querySelector('.btn-text');
    const btnIcon = this.submitBtn.querySelector('.btn-icon');
    const btnLoading = this.submitBtn.querySelector('.btn-loading');
    
    this.submitBtn.className = `submit-btn ${state}`;
    
    switch (state) {
      case 'loading':
        this.submitBtn.disabled = true;
        if (btnText) btnText.textContent = 'Sending...';
        if (btnIcon) btnIcon.style.display = 'none';
        if (btnLoading) btnLoading.style.display = 'block';
        break;
        
      case 'success':
        this.submitBtn.disabled = false;
        if (btnText) btnText.textContent = 'Message Sent!';
        if (btnIcon) {
          btnIcon.textContent = '✅';
          btnIcon.style.display = 'inline';
        }
        if (btnLoading) btnLoading.style.display = 'none';
        break;
        
      default:
        this.submitBtn.disabled = false;
        if (btnText) btnText.textContent = 'Send Message';
        if (btnIcon) {
          btnIcon.textContent = '🚀';
          btnIcon.style.display = 'inline';
        }
        if (btnLoading) btnLoading.style.display = 'none';
        break;
    }
  }
  
  /**
   * Show form status message
   */
  showFormStatus(message, type) {
    if (!this.formStatus) return;
    
    this.formStatus.textContent = message;
    this.formStatus.className = `form-status ${type}`;
    this.formStatus.style.display = 'block';
    
    // Auto-hide success messages
    if (type === 'success') {
      setTimeout(() => {
        this.formStatus.style.display = 'none';
      }, 5000);
    }
  }
  
  /**
   * Reset form to initial state
   */
  resetForm() {
    if (!this.form) return;
    
    this.form.reset();
    
    // Reset form state
    Object.keys(this.formState).forEach(fieldName => {
      this.formState[fieldName] = { value: '', isValid: false, error: '' };
      this.clearFieldError(fieldName);
    });
    
    // Reset field appearances
    const containers = this.contactElement.querySelectorAll('.input-container');
    containers.forEach(container => {
      container.classList.remove('has-value', 'valid', 'error', 'focused');
    });
    
    // Reset character count
    this.updateCharacterCount();
    
    // Reset submit button after delay
    setTimeout(() => {
      this.updateSubmitButton('default');
    }, 3000);
  }
  
  /**
   * Handle section active changes
   */
  handleSectionActive(sectionId) {
    if (sectionId === 'contact') {
      // Trigger animations when contact section becomes active
      const animatedElements = this.contactElement.querySelectorAll('.info-card, .social-link');
      animatedElements.forEach((element, index) => {
        setTimeout(() => {
          element.classList.add('animate-in');
        }, index * 100);
      });
    }
  }
  
  /**
   * Get form data
   */
  getFormData() {
    return {
      name: this.formState.name.value,
      email: this.formState.email.value,
      subject: this.formState.subject.value,
      message: this.formState.message.value
    };
  }
  
  /**
   * Check if form is valid
   */
  isFormValid() {
    return Object.values(this.formState).every(field => field.isValid);
  }
  
  /**
   * Destroy the contact component
   */
  destroy() {
    // Remove event listeners
    if (this.form) {
      this.form.removeEventListener('submit', this.handleFormSubmit);
    }
    
    Object.values(this.formFields).forEach(field => {
      if (field) {
        field.removeEventListener('input', this.handleFieldInput);
        field.removeEventListener('focus', this.handleFieldFocus);
        field.removeEventListener('blur', this.handleFieldBlur);
      }
    });
    
    // Disconnect observer
    if (this.contactObserver) {
      this.contactObserver.disconnect();
    }
    
    // Remove app event listeners
    this.app.off('section:active', this.handleSectionActive);
    
    this.emit('contact:destroyed');
  }
}