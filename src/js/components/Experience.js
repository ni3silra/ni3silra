/**
 * Experience Component
 * Interactive timeline with expandable experience cards
 */

import { EventEmitter } from '../utils/EventEmitter.js';

export class Experience extends EventEmitter {
  constructor(app) {
    super();
    
    this.app = app;
    this.experienceElement = null;
    this.timelineItems = [];
    this.activeExperience = null;
    this.animatedItems = new Set();
    
    // Experience data structure
    this.experienceData = [
      {
        id: 'senior-backend-dev',
        title: 'Senior Backend Developer',
        company: 'TechCorp Solutions',
        location: 'San Francisco, CA',
        period: '2022 - Present',
        duration: '2+ years',
        type: 'full-time',
        description: 'Lead backend development for high-traffic applications serving millions of users. Architect scalable microservices and mentor junior developers.',
        responsibilities: [
          'Designed and implemented microservices architecture handling 10M+ daily requests',
          'Led a team of 5 backend developers and established coding standards',
          'Optimized database queries reducing response times by 60%',
          'Implemented CI/CD pipelines improving deployment frequency by 300%',
          'Mentored junior developers and conducted technical interviews'
        ],
        technologies: ['Node.js', 'Python', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'AWS'],
        achievements: [
          'Reduced system downtime by 95% through improved monitoring',
          'Increased API performance by 60% through optimization',
          'Successfully migrated legacy monolith to microservices',
          'Implemented zero-downtime deployment strategy'
        ],
        projects: ['E-Commerce API', 'Real-time Chat System'],
        skills: ['System Architecture', 'Team Leadership', 'Performance Optimization']
      },
      {
        id: 'backend-developer',
        title: 'Backend Developer',
        company: 'StartupXYZ',
        location: 'Austin, TX',
        period: '2020 - 2022',
        duration: '2 years',
        type: 'full-time',
        description: 'Developed core backend services for a fast-growing fintech startup. Built secure payment processing systems and real-time analytics.',
        responsibilities: [
          'Built secure payment processing system handling $10M+ monthly volume',
          'Developed real-time analytics dashboard for business intelligence',
          'Implemented automated testing reducing bugs by 70%',
          'Collaborated with frontend team to design RESTful APIs',
          'Maintained 99.9% uptime for critical financial services'
        ],
        technologies: ['Go', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'GCP'],
        achievements: [
          'Processed over $50M in secure transactions',
          'Achieved 99.9% uptime for payment systems',
          'Reduced API response times by 40%',
          'Implemented PCI DSS compliance standards'
        ],
        projects: ['Payment Gateway', 'Analytics Dashboard'],
        skills: ['Payment Systems', 'Security', 'Real-time Processing']
      },
      {
        id: 'junior-developer',
        title: 'Junior Software Developer',
        company: 'WebDev Agency',
        location: 'Remote',
        period: '2019 - 2020',
        duration: '1 year',
        type: 'full-time',
        description: 'Started career developing web applications for various clients. Gained experience in full-stack development and agile methodologies.',
        responsibilities: [
          'Developed custom web applications for 20+ clients',
          'Collaborated in agile development teams using Scrum methodology',
          'Implemented responsive designs and optimized for mobile devices',
          'Participated in code reviews and maintained coding standards',
          'Provided technical support and bug fixes for existing applications'
        ],
        technologies: ['JavaScript', 'Node.js', 'MySQL', 'HTML/CSS', 'Git'],
        achievements: [
          'Successfully delivered 25+ client projects on time',
          'Improved website performance by 50% through optimization',
          'Learned 5 new technologies in first 6 months',
          'Received "Rising Star" award for exceptional performance'
        ],
        projects: ['Client Websites', 'E-commerce Platforms'],
        skills: ['Web Development', 'Client Communication', 'Agile Methodology']
      },
      {
        id: 'freelance-developer',
        title: 'Freelance Developer',
        company: 'Self-Employed',
        location: 'Remote',
        period: '2018 - 2019',
        duration: '1 year',
        type: 'freelance',
        description: 'Provided web development services to small businesses and startups. Built custom solutions and gained entrepreneurial experience.',
        responsibilities: [
          'Delivered end-to-end web solutions for small businesses',
          'Managed client relationships and project timelines',
          'Developed custom WordPress themes and plugins',
          'Provided ongoing maintenance and technical support',
          'Handled all aspects of project lifecycle from planning to deployment'
        ],
        technologies: ['PHP', 'WordPress', 'MySQL', 'JavaScript', 'HTML/CSS'],
        achievements: [
          'Built 15+ websites for local businesses',
          'Maintained 100% client satisfaction rate',
          'Generated $50K+ in freelance revenue',
          'Established long-term partnerships with 5 clients'
        ],
        projects: ['Business Websites', 'WordPress Plugins'],
        skills: ['Client Management', 'WordPress Development', 'Business Development']
      }
    ];
    
    // Bind methods
    this.handleTimelineClick = this.handleTimelineClick.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
  }
  
  /**
   * Initialize the experience component
   */
  init() {
    this.createExperienceContent();
    this.setupEventListeners();
    this.setupIntersectionObserver();
    
    console.log('Experience component initialized');
  }
  
  /**
   * Create the experience HTML structure
   */
  createExperienceContent() {
    const experienceSection = document.getElementById('about'); // Using about section for experience
    if (!experienceSection) {
      console.error('Experience section not found');
      return;
    }
    
    experienceSection.innerHTML = `
      <div class="experience-container">
        <header class="experience-header">
          <h2 class="experience-title">Professional Experience</h2>
          <p class="experience-subtitle">
            My journey in backend development and the experiences that shaped my expertise
          </p>
        </header>
        
        <div class="timeline-container" role="region" aria-labelledby="timeline-heading">
          <h3 id="timeline-heading" class="sr-only">Professional experience timeline</h3>
          <div class="timeline-line" aria-hidden="true"></div>
          <div class="timeline-content" role="list" aria-label="Professional experience timeline">
            ${this.generateTimelineItems()}
          </div>
        </div>
        
        <aside class="experience-summary" role="complementary" aria-labelledby="experience-stats-heading">
          <h3 id="experience-stats-heading" class="sr-only">Professional statistics and achievements</h3>
          <div class="summary-stats" role="list" aria-label="Career statistics">
            <div class="stat-card" role="listitem" aria-labelledby="stat-years">
              <div class="stat-number" aria-hidden="true">5+</div>
              <div id="stat-years" class="stat-label">5+ Years Experience</div>
            </div>
            <div class="stat-card" role="listitem" aria-labelledby="stat-projects">
              <div class="stat-number" aria-hidden="true">50+</div>
              <div id="stat-projects" class="stat-label">50+ Projects Delivered</div>
            </div>
            <div class="stat-card" role="listitem" aria-labelledby="stat-technologies">
              <div class="stat-number" aria-hidden="true">15+</div>
              <div id="stat-technologies" class="stat-label">15+ Technologies Mastered</div>
            </div>
            <div class="stat-card" role="listitem" aria-labelledby="stat-companies">
              <div class="stat-number" aria-hidden="true">4</div>
              <div id="stat-companies" class="stat-label">4 Companies</div>
            </div>
          </div>
        </aside>
      </div>
    `;
    
    // Cache DOM elements
    this.experienceElement = experienceSection;
    this.timelineItems = Array.from(experienceSection.querySelectorAll('.timeline-item'));
  }
  
  /**
   * Generate timeline items HTML
   */
  generateTimelineItems() {
    return this.experienceData.map((experience, index) => `
      <article class="timeline-item ${index === 0 ? 'active' : ''}" 
               data-experience-id="${experience.id}"
               tabindex="0"
               role="button"
               aria-expanded="${index === 0 ? 'true' : 'false'}"
               aria-labelledby="exp-${index}-title"
               aria-describedby="exp-${index}-summary">
        <div class="timeline-marker" aria-hidden="true">
          <div class="marker-dot"></div>
          <div class="marker-pulse"></div>
        </div>
        
        <div class="timeline-card">
          <header class="card-header">
            <div class="experience-meta">
              <h3 id="exp-${index}-title" class="experience-title">${experience.title}</h3>
              <div class="experience-company" aria-label="Company: ${experience.company}">${experience.company}</div>
              <div class="experience-details">
                <span class="experience-period" aria-label="Employment period: ${experience.period}">${experience.period}</span>
                <span class="experience-location" aria-label="Location: ${experience.location}">${experience.location}</span>
                <span class="experience-type type-${experience.type}" aria-label="Employment type: ${this.getTypeLabel(experience.type)}">${this.getTypeLabel(experience.type)}</span>
              </div>
              <p id="exp-${index}-summary" class="sr-only">
                ${experience.title} at ${experience.company} from ${experience.period}. ${experience.description}
              </p>
            </div>
            <div class="expand-indicator" aria-hidden="true">
              <span class="expand-icon">+</span>
            </div>
          </header>
          
          <div class="card-content ${index === 0 ? 'expanded' : ''}" 
               role="region" 
               aria-labelledby="exp-${index}-details-heading">
            <h4 id="exp-${index}-details-heading" class="sr-only">Detailed information for ${experience.title} position</h4>
            <p class="experience-description">${experience.description}</p>
            
            <section class="experience-section" aria-labelledby="exp-${index}-responsibilities-heading">
              <h5 id="exp-${index}-responsibilities-heading">Key Responsibilities</h5>
              <ul class="responsibility-list" role="list" aria-label="Key responsibilities for ${experience.title}">
                ${experience.responsibilities.map((resp, respIndex) => `
                  <li class="responsibility-item" role="listitem">${resp}</li>
                `).join('')}
              </ul>
            </section>
            
            <section class="experience-section" aria-labelledby="exp-${index}-technologies-heading">
              <h5 id="exp-${index}-technologies-heading">Technologies Used</h5>
              <div class="tech-tags" role="list" aria-label="Technologies used in ${experience.title} role">
                ${experience.technologies.map(tech => `
                  <span class="tech-tag" role="listitem" aria-label="Technology: ${tech}">${tech}</span>
                `).join('')}
              </div>
            </section>
            
            <section class="experience-section" aria-labelledby="exp-${index}-achievements-heading">
              <h5 id="exp-${index}-achievements-heading">Key Achievements</h5>
              <ul class="achievement-list" role="list" aria-label="Key achievements for ${experience.title}">
                ${experience.achievements.map((achievement, achIndex) => `
                  <li class="achievement-item" role="listitem">
                    <span class="achievement-icon" aria-hidden="true">🏆</span>
                    <span class="achievement-text">${achievement}</span>
                  </li>
                `).join('')}
              </ul>
            </section>
            
            <section class="experience-section" aria-labelledby="exp-${index}-skills-heading">
              <h5 id="exp-${index}-skills-heading">Skills Developed</h5>
              <div class="skills-tags" role="list" aria-label="Skills developed in ${experience.title} role">
                ${experience.skills.map(skill => `
                  <span class="skill-tag" role="listitem" aria-label="Skill: ${skill}">${skill}</span>
                `).join('')}
              </div>
            </section>
          </div>
        </div>
      </article>
    `).join('');
  }
  
  /**
   * Get type label for display
   */
  getTypeLabel(type) {
    const typeMap = {
      'full-time': 'Full-time',
      'part-time': 'Part-time',
      'contract': 'Contract',
      'freelance': 'Freelance',
      'internship': 'Internship'
    };
    return typeMap[type] || type;
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Timeline item clicks
    this.timelineItems.forEach(item => {
      item.addEventListener('click', this.handleTimelineClick);
      item.addEventListener('keydown', this.handleKeydown);
    });
    
    // Listen to app events
    this.app.on('section:active', this.handleSectionActive.bind(this));
  }
  
  /**
   * Set up intersection observer for animations
   */
  setupIntersectionObserver() {
    this.timelineObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const item = entry.target;
            const itemId = item.getAttribute('data-experience-id');
            
            if (!this.animatedItems.has(itemId)) {
              this.animateTimelineItem(item);
              this.animatedItems.add(itemId);
            }
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '0px 0px -10% 0px'
      }
    );
    
    // Observe all timeline items
    this.timelineItems.forEach(item => {
      this.timelineObserver.observe(item);
    });
  }
  
  /**
   * Animate timeline item entrance
   */
  animateTimelineItem(item) {
    const reducedMotion = this.app.state.getState().animations.reducedMotion;
    
    if (reducedMotion) {
      item.classList.add('animate-in');
      return;
    }
    
    // Staggered animation
    const index = Array.from(this.timelineItems).indexOf(item);
    
    setTimeout(() => {
      item.classList.add('animate-in');
      
      // Animate marker pulse
      const marker = item.querySelector('.marker-pulse');
      if (marker) {
        marker.style.animation = 'pulse 2s ease-out';
      }
    }, index * 200);
  }
  
  /**
   * Handle timeline item clicks
   */
  handleTimelineClick(event) {
    const item = event.currentTarget;
    const experienceId = item.getAttribute('data-experience-id');
    
    this.toggleExperience(item, experienceId);
  }
  
  /**
   * Handle keyboard navigation
   */
  handleKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleTimelineClick(event);
    }
  }
  
  /**
   * Toggle experience card expansion
   */
  toggleExperience(item, experienceId) {
    const isActive = item.classList.contains('active');
    const content = item.querySelector('.card-content');
    const expandIcon = item.querySelector('.expand-icon');
    
    if (isActive) {
      // Collapse current item
      this.collapseExperience(item, content, expandIcon);
      this.activeExperience = null;
    } else {
      // Collapse all other items first
      this.timelineItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          const otherContent = otherItem.querySelector('.card-content');
          const otherIcon = otherItem.querySelector('.expand-icon');
          this.collapseExperience(otherItem, otherContent, otherIcon);
        }
      });
      
      // Expand clicked item
      this.expandExperience(item, content, expandIcon);
      this.activeExperience = experienceId;
    }
    
    this.emit('experience:toggle', { experienceId, isExpanded: !isActive });
  }
  
  /**
   * Expand experience card
   */
  expandExperience(item, content, expandIcon) {
    item.classList.add('active');
    item.setAttribute('aria-expanded', 'true');
    content.classList.add('expanded');
    expandIcon.textContent = '−';
    
    // Smooth scroll to item if needed
    setTimeout(() => {
      const rect = item.getBoundingClientRect();
      const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
      
      if (!isVisible) {
        item.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 300);
  }
  
  /**
   * Collapse experience card
   */
  collapseExperience(item, content, expandIcon) {
    item.classList.remove('active');
    item.setAttribute('aria-expanded', 'false');
    content.classList.remove('expanded');
    expandIcon.textContent = '+';
  }
  
  /**
   * Handle section active changes
   */
  handleSectionActive(sectionId) {
    if (sectionId === 'about') {
      // Trigger timeline animations when experience section becomes active
      this.timelineItems.forEach(item => {
        const itemId = item.getAttribute('data-experience-id');
        if (!this.animatedItems.has(itemId)) {
          this.animateTimelineItem(item);
          this.animatedItems.add(itemId);
        }
      });
    }
  }
  
  /**
   * Get experience data by ID
   */
  getExperienceById(id) {
    return this.experienceData.find(exp => exp.id === id);
  }
  
  /**
   * Get all experience data
   */
  getExperienceData() {
    return this.experienceData;
  }
  
  /**
   * Filter experiences by criteria
   */
  filterExperiences(criteria) {
    return this.experienceData.filter(exp => {
      if (criteria.type && exp.type !== criteria.type) return false;
      if (criteria.technology && !exp.technologies.some(tech => 
        tech.toLowerCase().includes(criteria.technology.toLowerCase())
      )) return false;
      if (criteria.company && !exp.company.toLowerCase().includes(criteria.company.toLowerCase())) return false;
      return true;
    });
  }
  
  /**
   * Destroy the experience component
   */
  destroy() {
    // Remove event listeners
    this.timelineItems.forEach(item => {
      item.removeEventListener('click', this.handleTimelineClick);
      item.removeEventListener('keydown', this.handleKeydown);
    });
    
    // Disconnect observer
    if (this.timelineObserver) {
      this.timelineObserver.disconnect();
    }
    
    // Remove app event listeners
    this.app.off('section:active', this.handleSectionActive);
    
    this.emit('experience:destroyed');
  }
}