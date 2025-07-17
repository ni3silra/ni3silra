/**
 * Skills Component
 * Categorized skills display with animated progress bars and filtering
 */

import { EventEmitter } from '../utils/EventEmitter.js';

export class Skills extends EventEmitter {
  constructor(app) {
    super();
    
    this.app = app;
    this.skillsElement = null;
    this.filterButtons = [];
    this.skillCards = [];
    this.activeFilter = 'all';
    this.animatedBars = new Set();
    
    // Skills data structure
    this.skillsData = {
      backend: {
        title: 'Backend Development',
        icon: '⚙️',
        skills: [
          { name: 'Node.js', level: 90, experience: '4+ years' },
          { name: 'Python', level: 85, experience: '3+ years' },
          { name: 'Go', level: 75, experience: '2+ years' },
          { name: 'Java', level: 80, experience: '3+ years' },
          { name: 'C#', level: 70, experience: '2+ years' }
        ]
      },
      database: {
        title: 'Database & Storage',
        icon: '🗄️',
        skills: [
          { name: 'PostgreSQL', level: 90, experience: '4+ years' },
          { name: 'MongoDB', level: 85, experience: '3+ years' },
          { name: 'Redis', level: 80, experience: '3+ years' },
          { name: 'MySQL', level: 75, experience: '2+ years' },
          { name: 'Elasticsearch', level: 70, experience: '2+ years' }
        ]
      },
      cloud: {
        title: 'Cloud & DevOps',
        icon: '☁️',
        skills: [
          { name: 'AWS', level: 85, experience: '3+ years' },
          { name: 'Docker', level: 90, experience: '4+ years' },
          { name: 'Kubernetes', level: 75, experience: '2+ years' },
          { name: 'Terraform', level: 70, experience: '2+ years' },
          { name: 'CI/CD', level: 80, experience: '3+ years' }
        ]
      },
      tools: {
        title: 'Tools & Frameworks',
        icon: '🛠️',
        skills: [
          { name: 'Express.js', level: 90, experience: '4+ years' },
          { name: 'FastAPI', level: 85, experience: '3+ years' },
          { name: 'GraphQL', level: 80, experience: '2+ years' },
          { name: 'REST APIs', level: 95, experience: '5+ years' },
          { name: 'Microservices', level: 85, experience: '3+ years' }
        ]
      }
    };
    
    // Bind methods
    this.handleFilterClick = this.handleFilterClick.bind(this);
    this.handleSkillHover = this.handleSkillHover.bind(this);
    this.animateProgressBars = this.animateProgressBars.bind(this);
  }
  
  /**
   * Initialize the skills component
   */
  init() {
    this.createSkillsContent();
    this.setupEventListeners();
    this.setupIntersectionObserver();
    
    console.log('Skills component initialized');
  }
  
  /**
   * Create the skills HTML structure
   */
  createSkillsContent() {
    const skillsSection = document.getElementById('skills');
    if (!skillsSection) {
      console.error('Skills section not found');
      return;
    }
    
    skillsSection.innerHTML = `
      <div class="skills-container">
        <header class="skills-header">
          <h2 class="skills-title">Technical Skills</h2>
          <p class="skills-subtitle">
            Technologies and tools I use to build robust, scalable applications
          </p>
          
          <nav class="skills-filters" role="tablist" aria-label="Filter skills by category">
            <button class="filter-btn active" 
                    data-filter="all" 
                    role="tab" 
                    aria-selected="true" 
                    aria-controls="skills-grid"
                    aria-describedby="filter-all-desc">
              <span class="filter-icon" aria-hidden="true">🎯</span>
              <span class="filter-text">All Skills</span>
              <span id="filter-all-desc" class="sr-only">Show all technical skills across all categories</span>
            </button>
            <button class="filter-btn" 
                    data-filter="backend" 
                    role="tab" 
                    aria-selected="false" 
                    aria-controls="skills-grid"
                    aria-describedby="filter-backend-desc">
              <span class="filter-icon" aria-hidden="true">⚙️</span>
              <span class="filter-text">Backend</span>
              <span id="filter-backend-desc" class="sr-only">Show backend development technologies and frameworks</span>
            </button>
            <button class="filter-btn" 
                    data-filter="database" 
                    role="tab" 
                    aria-selected="false" 
                    aria-controls="skills-grid"
                    aria-describedby="filter-database-desc">
              <span class="filter-icon" aria-hidden="true">🗄️</span>
              <span class="filter-text">Database</span>
              <span id="filter-database-desc" class="sr-only">Show database and data storage technologies</span>
            </button>
            <button class="filter-btn" 
                    data-filter="cloud" 
                    role="tab" 
                    aria-selected="false" 
                    aria-controls="skills-grid"
                    aria-describedby="filter-cloud-desc">
              <span class="filter-icon" aria-hidden="true">☁️</span>
              <span class="filter-text">Cloud</span>
              <span id="filter-cloud-desc" class="sr-only">Show cloud computing and DevOps technologies</span>
            </button>
            <button class="filter-btn" 
                    data-filter="tools" 
                    role="tab" 
                    aria-selected="false" 
                    aria-controls="skills-grid"
                    aria-describedby="filter-tools-desc">
              <span class="filter-icon" aria-hidden="true">🛠️</span>
              <span class="filter-text">Tools</span>
              <span id="filter-tools-desc" class="sr-only">Show development tools and frameworks</span>
            </button>
          </nav>
        </header>
        
        <div id="skills-grid" class="skills-grid" role="tabpanel" aria-live="polite" aria-label="Skills content">
          ${this.generateSkillCards()}
        </div>
        
        <aside class="skills-summary" aria-labelledby="skills-summary-heading">
          <h3 id="skills-summary-heading" class="sr-only">Skills summary and experience overview</h3>
          <div class="summary-card" role="region" aria-labelledby="experience-overview-heading">
            <div class="summary-icon" aria-hidden="true">📊</div>
            <div class="summary-content">
              <h4 id="experience-overview-heading">Experience Overview</h4>
              <p>5+ years of backend development experience with a focus on scalable architectures, API design, and cloud-native solutions.</p>
            </div>
          </div>
          
          <div class="summary-card" role="region" aria-labelledby="continuous-learning-heading">
            <div class="summary-icon" aria-hidden="true">🚀</div>
            <div class="summary-content">
              <h4 id="continuous-learning-heading">Continuous Learning</h4>
              <p>Always exploring new technologies and best practices to stay current with industry trends and deliver cutting-edge solutions.</p>
            </div>
          </div>
        </aside>
      </div>
    `;
    
    // Cache DOM elements
    this.skillsElement = skillsSection;
    this.filterButtons = Array.from(skillsSection.querySelectorAll('.filter-btn'));
    this.skillCards = Array.from(skillsSection.querySelectorAll('.skill-category'));
  }
  
  /**
   * Generate skill cards HTML
   */
  generateSkillCards() {
    return Object.entries(this.skillsData).map(([category, data]) => `
      <article class="skill-category" 
               data-category="${category}" 
               role="region" 
               aria-labelledby="category-${category}-title"
               aria-describedby="category-${category}-desc">
        <header class="skill-category-header">
          <div class="category-icon" aria-hidden="true">${data.icon}</div>
          <h3 id="category-${category}-title" class="category-title">${data.title}</h3>
          <div class="category-count" aria-label="${data.skills.length} skills in ${data.title} category">
            <span aria-hidden="true">${data.skills.length} skills</span>
          </div>
          <p id="category-${category}-desc" class="sr-only">
            ${data.title} category containing ${data.skills.length} technical skills with proficiency levels and experience details
          </p>
        </header>
        
        <div class="skills-list" role="list" aria-label="${data.title} skills">
          ${data.skills.map((skill, index) => `
            <div class="skill-item" 
                 data-skill="${skill.name.toLowerCase()}"
                 role="listitem"
                 aria-labelledby="skill-${category}-${index}-name"
                 aria-describedby="skill-${category}-${index}-details">
              <div class="skill-info">
                <h4 id="skill-${category}-${index}-name" class="skill-name">${skill.name}</h4>
                <div class="skill-experience" aria-label="Experience: ${skill.experience}">${skill.experience}</div>
              </div>
              
              <div class="skill-progress" 
                   role="img" 
                   aria-labelledby="skill-${category}-${index}-progress"
                   aria-describedby="skill-${category}-${index}-progress-desc">
                <div class="progress-bar" 
                     role="progressbar" 
                     aria-valuenow="${skill.level}" 
                     aria-valuemin="0" 
                     aria-valuemax="100"
                     aria-labelledby="skill-${category}-${index}-name">
                  <div class="progress-fill" 
                       data-level="${skill.level}"
                       style="width: 0%"
                       aria-hidden="true">
                  </div>
                </div>
                <div id="skill-${category}-${index}-progress" class="skill-level" aria-label="Proficiency level: ${skill.level} percent">
                  <span aria-hidden="true">${skill.level}%</span>
                </div>
                <p id="skill-${category}-${index}-progress-desc" class="sr-only">
                  ${skill.name} proficiency level is ${skill.level} out of 100 percent with ${skill.experience} of experience
                </p>
              </div>
              
              <div class="skill-details" 
                   id="skill-${category}-${index}-details"
                   role="tooltip"
                   aria-hidden="true">
                <div class="skill-description">
                  ${this.getSkillDescription(skill.name)}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </article>
    `).join('');
  }
  
  /**
   * Get skill description
   */
  getSkillDescription(skillName) {
    const descriptions = {
      'Node.js': 'Server-side JavaScript runtime for building scalable network applications',
      'Python': 'Versatile programming language for web development, data analysis, and automation',
      'Go': 'Fast, statically typed language perfect for microservices and concurrent programming',
      'Java': 'Enterprise-grade language for building robust, platform-independent applications',
      'C#': 'Microsoft\'s object-oriented language for .NET framework development',
      'PostgreSQL': 'Advanced open-source relational database with excellent performance',
      'MongoDB': 'NoSQL document database for flexible, scalable data storage',
      'Redis': 'In-memory data structure store used for caching and real-time applications',
      'MySQL': 'Popular relational database management system for web applications',
      'Elasticsearch': 'Distributed search and analytics engine for complex data queries',
      'AWS': 'Amazon\'s comprehensive cloud computing platform and services',
      'Docker': 'Containerization platform for consistent application deployment',
      'Kubernetes': 'Container orchestration system for automated deployment and scaling',
      'Terraform': 'Infrastructure as Code tool for cloud resource management',
      'CI/CD': 'Continuous Integration and Deployment practices for automated software delivery',
      'Express.js': 'Fast, minimalist web framework for Node.js applications',
      'FastAPI': 'Modern, fast Python web framework for building APIs',
      'GraphQL': 'Query language and runtime for APIs with flexible data fetching',
      'REST APIs': 'Architectural style for designing networked applications',
      'Microservices': 'Architectural pattern for building distributed, scalable systems'
    };
    
    return descriptions[skillName] || 'Professional experience with this technology';
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Filter button clicks
    this.filterButtons.forEach(button => {
      button.addEventListener('click', this.handleFilterClick);
    });
    
    // Skill item hover effects
    const skillItems = this.skillsElement.querySelectorAll('.skill-item');
    skillItems.forEach(item => {
      item.addEventListener('mouseenter', this.handleSkillHover);
      item.addEventListener('mouseleave', this.handleSkillLeave.bind(this));
    });
    
    // Listen to app events
    this.app.on('section:active', this.handleSectionActive.bind(this));
  }
  
  /**
   * Set up intersection observer for animations
   */
  setupIntersectionObserver() {
    this.progressObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const skillCategory = entry.target;
            this.animateProgressBars(skillCategory);
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '0px 0px -10% 0px'
      }
    );
    
    // Observe all skill categories
    this.skillCards.forEach(card => {
      this.progressObserver.observe(card);
    });
  }
  
  /**
   * Handle filter button clicks
   */
  handleFilterClick(event) {
    const button = event.currentTarget;
    const filter = button.getAttribute('data-filter');
    
    if (filter === this.activeFilter) return;
    
    // Update active filter
    this.activeFilter = filter;
    this.app.state.setState({ selectedSkillCategory: filter });
    
    // Update button states and ARIA attributes
    this.filterButtons.forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    });
    button.classList.add('active');
    button.setAttribute('aria-selected', 'true');
    
    // Announce filter change to screen readers
    this.announceFilterChange(filter);
    
    // Filter skill cards
    this.filterSkills(filter);
    
    this.emit('skills:filter-change', filter);
  }
  
  /**
   * Announce filter change to screen readers
   */
  announceFilterChange(filter) {
    const filterName = filter === 'all' ? 'all skills' : filter;
    const announcement = `Showing ${filterName} skills`;
    
    // Use the global ARIA live region for announcements
    const ariaAnnouncements = document.getElementById('aria-announcements');
    if (ariaAnnouncements) {
      ariaAnnouncements.textContent = announcement;
    }
  }
  
  /**
   * Filter skills based on category
   */
  filterSkills(filter) {
    const reducedMotion = this.app.state.getState().animations.reducedMotion;
    
    this.skillCards.forEach((card, index) => {
      const category = card.getAttribute('data-category');
      const shouldShow = filter === 'all' || category === filter;
      
      if (reducedMotion) {
        // Instant show/hide for reduced motion
        card.style.display = shouldShow ? 'block' : 'none';
      } else {
        // Animated show/hide
        if (shouldShow) {
          card.style.display = 'block';
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          
          setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, index * 100);
        } else {
          card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          card.style.opacity = '0';
          card.style.transform = 'translateY(-20px)';
          
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      }
    });
  }
  
  /**
   * Animate progress bars for a skill category
   */
  animateProgressBars(categoryElement) {
    const categoryId = categoryElement.getAttribute('data-category');
    
    // Skip if already animated
    if (this.animatedBars.has(categoryId)) return;
    this.animatedBars.add(categoryId);
    
    const progressBars = categoryElement.querySelectorAll('.progress-fill');
    const reducedMotion = this.app.state.getState().animations.reducedMotion;
    
    progressBars.forEach((bar, index) => {
      const targetLevel = parseInt(bar.getAttribute('data-level'));
      
      if (reducedMotion) {
        // Instant fill for reduced motion
        bar.style.width = `${targetLevel}%`;
      } else {
        // Animated fill
        setTimeout(() => {
          bar.style.transition = 'width 1.5s ease-out';
          bar.style.width = `${targetLevel}%`;
          
          // Add pulse effect at completion
          setTimeout(() => {
            bar.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.5)';
            setTimeout(() => {
              bar.style.boxShadow = 'none';
            }, 500);
          }, 1500);
        }, index * 200);
      }
    });
  }
  
  /**
   * Handle skill item hover
   */
  handleSkillHover(event) {
    const skillItem = event.currentTarget;
    const details = skillItem.querySelector('.skill-details');
    
    if (details) {
      details.style.opacity = '1';
      details.style.transform = 'translateY(0)';
      details.style.visibility = 'visible';
    }
    
    // Add glow effect to progress bar
    const progressBar = skillItem.querySelector('.progress-fill');
    if (progressBar) {
      progressBar.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.6)';
    }
  }
  
  /**
   * Handle skill item mouse leave
   */
  handleSkillLeave(event) {
    const skillItem = event.currentTarget;
    const details = skillItem.querySelector('.skill-details');
    
    if (details) {
      details.style.opacity = '0';
      details.style.transform = 'translateY(10px)';
      details.style.visibility = 'hidden';
    }
    
    // Remove glow effect
    const progressBar = skillItem.querySelector('.progress-fill');
    if (progressBar) {
      progressBar.style.boxShadow = 'none';
    }
  }
  
  /**
   * Handle section active changes
   */
  handleSectionActive(sectionId) {
    if (sectionId === 'skills') {
      // Trigger animations when skills section becomes active
      this.skillCards.forEach(card => {
        if (card.style.display !== 'none') {
          this.animateProgressBars(card);
        }
      });
    }
  }
  
  /**
   * Get skills data for external use
   */
  getSkillsData() {
    return this.skillsData;
  }
  
  /**
   * Get skills by category
   */
  getSkillsByCategory(category) {
    return this.skillsData[category] || null;
  }
  
  /**
   * Search skills by name
   */
  searchSkills(query) {
    const results = [];
    const searchTerm = query.toLowerCase();
    
    Object.entries(this.skillsData).forEach(([category, data]) => {
      data.skills.forEach(skill => {
        if (skill.name.toLowerCase().includes(searchTerm)) {
          results.push({
            ...skill,
            category: category,
            categoryTitle: data.title
          });
        }
      });
    });
    
    return results;
  }
  
  /**
   * Destroy the skills component
   */
  destroy() {
    // Remove event listeners
    this.filterButtons.forEach(button => {
      button.removeEventListener('click', this.handleFilterClick);
    });
    
    // Disconnect observer
    if (this.progressObserver) {
      this.progressObserver.disconnect();
    }
    
    // Remove app event listeners
    this.app.off('section:active', this.handleSectionActive);
    
    this.emit('skills:destroyed');
  }
}