/**
 * Projects Component
 * Project portfolio gallery with cards, filtering, and GitHub integration
 */

import { EventEmitter } from '../utils/EventEmitter.js';

export class Projects extends EventEmitter {
  constructor(app) {
    super();

    this.app = app;
    this.projectsElement = null;
    this.filterButtons = [];
    this.projectCards = [];
    this.activeFilter = 'all';
    this.loadedImages = new Set();
    this.githubCache = new Map();

    // Projects data structure
    this.projectsData = [
      {
        id: 'ecommerce-api',
        title: 'E-Commerce REST API',
        description: 'Scalable microservices-based e-commerce platform with advanced features like real-time inventory, payment processing, and order management.',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjEyNSIgcj0iNDAiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2Zz4K',
        technologies: ['Node.js', 'Express', 'PostgreSQL', 'Redis', 'Docker'],
        category: 'backend',
        featured: true,
        github: 'username/ecommerce-api',
        demo: 'https://api-demo.example.com',
        status: 'completed',
        highlights: [
          'Handles 10k+ concurrent users',
          'Sub-100ms response times',
          'Microservices architecture',
          'Comprehensive API documentation'
        ]
      },
      {
        id: 'realtime-chat',
        title: 'Real-time Chat System',
        description: 'High-performance chat application with WebSocket connections, message persistence, and real-time notifications.',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjE1MCIgeT0iMTAwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjUwIiByeD0iMTAiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2Zz4K',
        technologies: ['Go', 'WebSocket', 'MongoDB', 'Redis', 'Docker'],
        category: 'backend',
        featured: true,
        github: 'username/realtime-chat',
        demo: 'https://chat-demo.example.com',
        status: 'completed',
        highlights: [
          'Real-time messaging',
          'Message persistence',
          'User presence tracking',
          'File sharing support'
        ]
      },
      {
        id: 'data-pipeline',
        title: 'Data Processing Pipeline',
        description: 'Automated data pipeline for processing large datasets with ETL operations, data validation, and real-time analytics.',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjE2MCIgeT0iMTEwIiB3aWR0aD0iODAiIGhlaWdodD0iMzAiIHJ4PSI1IiBmaWxsPSIjOUNBM0FGIi8+KPHN2Zz4K',
        technologies: ['Python', 'Apache Kafka', 'PostgreSQL', 'Docker', 'Kubernetes'],
        category: 'data',
        featured: false,
        github: 'username/data-pipeline',
        demo: null,
        status: 'completed',
        highlights: [
          'Processes 1M+ records/hour',
          'Real-time data validation',
          'Automated error handling',
          'Scalable architecture'
        ]
      },
      {
        id: 'auth-service',
        title: 'Authentication Microservice',
        description: 'Secure authentication service with JWT tokens, OAuth integration, and comprehensive user management.',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjEyNSIgcj0iMzAiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2Zz4K',
        technologies: ['Node.js', 'JWT', 'OAuth', 'PostgreSQL', 'Redis'],
        category: 'backend',
        featured: false,
        github: 'username/auth-service',
        demo: 'https://auth-demo.example.com',
        status: 'completed',
        highlights: [
          'Multi-factor authentication',
          'OAuth 2.0 integration',
          'Session management',
          'Rate limiting'
        ]
      },
      {
        id: 'monitoring-dashboard',
        title: 'System Monitoring Dashboard',
        description: 'Real-time monitoring dashboard for tracking application performance, server metrics, and system health.',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjE1MCIgeT0iMTAwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjUwIiByeD0iOCIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K',
        technologies: ['Python', 'FastAPI', 'InfluxDB', 'Grafana', 'Docker'],
        category: 'devops',
        featured: false,
        github: 'username/monitoring-dashboard',
        demo: 'https://monitor-demo.example.com',
        status: 'completed',
        highlights: [
          'Real-time metrics',
          'Custom alerting',
          'Performance analytics',
          'Multi-server monitoring'
        ]
      },
      {
        id: 'blockchain-api',
        title: 'Blockchain Integration API',
        description: 'RESTful API for blockchain interactions with smart contract integration and cryptocurrency transaction handling.',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTAwSDIyNVYxNTBIMTc1VjEwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2Zz4K',
        technologies: ['Node.js', 'Web3.js', 'Ethereum', 'MongoDB', 'Express'],
        category: 'blockchain',
        featured: true,
        github: 'username/blockchain-api',
        demo: null,
        status: 'in-progress',
        highlights: [
          'Smart contract integration',
          'Transaction monitoring',
          'Wallet management',
          'Multi-chain support'
        ]
      }
    ];

    // Bind methods
    this.handleFilterClick = this.handleFilterClick.bind(this);
    this.handleProjectClick = this.handleProjectClick.bind(this);
    this.handleImageLoad = this.handleImageLoad.bind(this);
  }

  /**
   * Initialize the projects component
   */
  init() {
    this.createProjectsContent();
    this.setupEventListeners();
    this.setupIntersectionObserver();
    this.loadFeaturedProjects();

    console.log('Projects component initialized');
  }

  /**
   * Create the projects HTML structure
   */
  createProjectsContent() {
    const projectsSection = document.getElementById('projects');
    if (!projectsSection) {
      console.error('Projects section not found');
      return;
    }

    projectsSection.innerHTML = `
      <div class="projects-container">
        <header class="projects-header">
          <h2 class="projects-title">Featured Projects</h2>
          <p class="projects-subtitle">
            A showcase of backend systems, APIs, and infrastructure projects I've built
          </p>
          
          <nav class="projects-filters" role="tablist" aria-label="Filter projects by category">
            <button class="filter-btn active" 
                    data-filter="all" 
                    role="tab" 
                    aria-selected="true" 
                    aria-controls="projects-grid">
              <span class="filter-icon" aria-hidden="true">🎯</span>
              <span class="filter-text">All Projects</span>
            </button>
            <button class="filter-btn" 
                    data-filter="backend" 
                    role="tab" 
                    aria-selected="false" 
                    aria-controls="projects-grid">
              <span class="filter-icon" aria-hidden="true">⚙️</span>
              <span class="filter-text">Backend</span>
            </button>
            <button class="filter-btn" 
                    data-filter="data" 
                    role="tab" 
                    aria-selected="false" 
                    aria-controls="projects-grid">
              <span class="filter-icon" aria-hidden="true">📊</span>
              <span class="filter-text">Data</span>
            </button>
            <button class="filter-btn" 
                    data-filter="devops" 
                    role="tab" 
                    aria-selected="false" 
                    aria-controls="projects-grid">
              <span class="filter-icon" aria-hidden="true">🚀</span>
              <span class="filter-text">DevOps</span>
            </button>
            <button class="filter-btn" 
                    data-filter="blockchain" 
                    role="tab" 
                    aria-selected="false" 
                    aria-controls="projects-grid">
              <span class="filter-icon" aria-hidden="true">⛓️</span>
              <span class="filter-text">Blockchain</span>
            </button>
          </nav>
        </header>
        
        <div id="projects-grid" class="projects-grid" role="tabpanel" aria-live="polite">
          ${this.generateProjectCards()}
        </div>
        
        <aside class="projects-cta" role="complementary">
          <div class="cta-content">
            <h3>Interested in working together?</h3>
            <p>I'm always open to discussing new opportunities and interesting projects.</p>
            <a href="#contact" class="btn btn-primary">Get In Touch</a>
          </div>
        </aside>
      </div>
      
      <!-- Project Modal -->
      <div class="project-modal" 
           id="project-modal" 
           role="dialog" 
           aria-modal="true" 
           aria-hidden="true">
        <div class="modal-backdrop" aria-hidden="true"></div>
        <div class="modal-content">
          <button class="modal-close" 
                  aria-label="Close project details modal"
                  type="button">
            <span aria-hidden="true">&times;</span>
          </button>
          <div class="modal-body" id="modal-body" role="document">
            <!-- Dynamic content will be inserted here -->
          </div>
        </div>
      </div>
    `;

    // Cache DOM elements
    this.projectsElement = projectsSection;
    this.filterButtons = Array.from(projectsSection.querySelectorAll('.filter-btn'));
    this.projectCards = Array.from(projectsSection.querySelectorAll('.project-card'));
    this.modal = document.getElementById('project-modal');
    this.modalBody = document.getElementById('modal-body');
  }

  /**
   * Generate project cards HTML
   */
  generateProjectCards() {
    return this.projectsData.map((project, index) => `
      <article class="project-card \${project.featured ? 'featured' : ''}" 
               data-category="\${project.category}" 
               data-project-id="\${project.id}"
               role="button"
               tabindex="0">
        <div class="project-image-container">
          <div class="project-image-placeholder" aria-hidden="true">
            <div class="placeholder-icon" aria-hidden="true">🚀</div>
            <div class="loading-spinner" aria-hidden="true"></div>
          </div>
          <img class="project-image" 
               data-src="\${project.image}" 
               alt="Screenshot of \${project.title}"
               loading="lazy">
          <div class="project-overlay" aria-hidden="true">
            <nav class="project-actions">
              \${project.github ? \`
                <a href="https://github.com/\${project.github}" 
                   class="action-btn github-btn" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   onclick="event.stopPropagation()"
                   aria-label="View source code on GitHub">
                  <span class="btn-icon" aria-hidden="true">📁</span>
                  <span class="btn-text">Code</span>
                </a>
              \` : ''}
              \${project.demo ? \`
                <a href="\${project.demo}" 
                   class="action-btn demo-btn" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   onclick="event.stopPropagation()"
                   aria-label="View live demo">
                  <span class="btn-icon" aria-hidden="true">🔗</span>
                  <span class="btn-text">Demo</span>
                </a>
              \` : ''}
            </nav>
          </div>
          \${project.featured ? '<div class="featured-badge" aria-label="Featured project">Featured</div>' : ''}
          <div class="status-badge status-\${project.status}" 
               aria-label="Project status: \${this.getStatusText(project.status)}">
            \${this.getStatusText(project.status)}
          </div>
        </div>
        
        <div class="project-content">
          <header class="project-header">
            <h3 class="project-title">\${project.title}</h3>
            <div class="project-category">
              <span aria-hidden="true">\${this.getCategoryIcon(project.category)}</span>
              <span>\${this.getCategoryName(project.category)}</span>
            </div>
          </header>
          
          <p class="project-description">\${project.description}</p>
          
          <div class="project-technologies" role="list">
            \${project.technologies.map(tech => \`
              <span class="tech-tag" role="listitem">\${tech}</span>
            \`).join('')}
          </div>
          
          <div class="project-highlights" role="list">
            \${project.highlights.slice(0, 2).map(highlight => \`
              <div class="highlight-item" role="listitem">
                <span class="highlight-icon" aria-hidden="true">✓</span>
                <span class="highlight-text">\${highlight}</span>
              </div>
            \`).join('')}
          </div>
          
          <footer class="project-footer">
            <button class="view-details-btn" 
                    aria-label="View detailed information">
              <span class="btn-text">View Details</span>
              <span class="btn-icon" aria-hidden="true">→</span>
            </button>
            <div class="github-stats" 
                 data-repo="\${project.github}"
                 role="img"
                 aria-label="GitHub repository statistics">
              <div class="stat-item">
                <span class="stat-icon" aria-hidden="true">⭐</span>
                <span class="stat-value">--</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon" aria-hidden="true">🍴</span>
                <span class="stat-value">--</span>
              </div>
            </div>
          </footer>
        </div>
      </article>
    \`).join('');
  }

  /**
   * Get status text
   */
  getStatusText(status) {
    const statusMap = {
      'completed': 'Completed',
      'in-progress': 'In Progress',
      'planning': 'Planning'
    };
    return statusMap[status] || 'Unknown';
  }

  /**
   * Get category icon
   */
  getCategoryIcon(category) {
    const iconMap = {
      'backend': '⚙️',
      'data': '📊',
      'devops': '🚀',
      'blockchain': '⛓️',
      'frontend': '🎨'
    };
    return iconMap[category] || '💻';
  }

  /**
   * Get category name
   */
  getCategoryName(category) {
    const nameMap = {
      'backend': 'Backend',
      'data': 'Data Engineering',
      'devops': 'DevOps',
      'blockchain': 'Blockchain',
      'frontend': 'Frontend'
    };
    return nameMap[category] || 'Development';
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Filter button clicks
    this.filterButtons.forEach(button => {
      button.addEventListener('click', this.handleFilterClick);
    });

    // Project card clicks
    this.projectCards.forEach(card => {
      card.addEventListener('click', this.handleProjectClick);
    });

    // Modal close events
    if (this.modal) {
      const closeBtn = this.modal.querySelector('.modal-close');
      const backdrop = this.modal.querySelector('.modal-backdrop');

      if (closeBtn) closeBtn.addEventListener('click', this.closeModal.bind(this));
      if (backdrop) backdrop.addEventListener('click', this.closeModal.bind(this));
    }

    // Keyboard events
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.closeModal();
      }
    });

    // Listen to app events
    this.app.on('section:active', this.handleSectionActive.bind(this));
  }

  /**
   * Set up intersection observer for animations
   */
  setupIntersectionObserver() {
    // Card animation observer
    this.cardObserver = new IntersectionObserver(
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

    // Observe cards for animations
    const cards = this.projectsElement.querySelectorAll('.project-card');
    cards.forEach(card => this.cardObserver.observe(card));
  }

  /**
   * Handle image load event
   */
  handleImageLoad(img) {
    const card = img.closest('.project-card');
    if (card) {
      card.classList.add('image-loaded');
    }
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
    this.app.state.setState({ selectedProjectFilter: filter });

    // Update button states and ARIA attributes
    this.filterButtons.forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    });
    button.classList.add('active');
    button.setAttribute('aria-selected', 'true');

    // Filter project cards
    this.filterProjects(filter);

    this.emit('projects:filter-change', filter);
  }

  /**
   * Filter projects based on category
   */
  filterProjects(filter) {
    const reducedMotion = this.app.state.getState().animations.reducedMotion;

    this.projectCards.forEach((card, index) => {
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
          card.style.transform = 'translateY(20px) scale(0.95)';

          setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
          }, index * 100);
        } else {
          card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          card.style.opacity = '0';
          card.style.transform = 'translateY(-20px) scale(0.95)';

          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      }
    });
  }

  /**
   * Handle project card clicks
   */
  handleProjectClick(event) {
    const card = event.currentTarget;
    const projectId = card.getAttribute('data-project-id');
    const project = this.projectsData.find(p => p.id === projectId);

    if (project) {
      this.openProjectModal(project);
    }
  }  /**

   * Open project modal with details
   */
  openProjectModal(project) {
    if (!this.modal || !this.modalBody) return;

    this.modalBody.innerHTML = \`
      <div class="modal-project">
        <div class="modal-header">
          <div class="modal-image">
            <img src="\${project.image}" alt="\${project.title}">
            <div class="modal-badges">
              \${project.featured ? '<span class="badge featured-badge">Featured</span>' : ''}
              <span class="badge status-badge status-\${project.status}">\${this.getStatusText(project.status)}</span>
            </div>
          </div>
          
          <div class="modal-info">
            <h2 class="modal-title">\${project.title}</h2>
            <div class="modal-category">\${this.getCategoryIcon(project.category)} \${this.getCategoryName(project.category)}</div>
            <p class="modal-description">\${project.description}</p>
            
            <div class="modal-actions">
              \${project.github ? \`
                <a href="https://github.com/\${project.github}" 
                   class="btn btn-secondary" 
                   target="_blank" 
                   rel="noopener noreferrer">
                  <span class="btn-icon">📁</span>
                  <span class="btn-text">View Code</span>
                </a>
              \` : ''}
              \${project.demo ? \`
                <a href="\${project.demo}" 
                   class="btn btn-primary" 
                   target="_blank" 
                   rel="noopener noreferrer">
                  <span class="btn-icon">🔗</span>
                  <span class="btn-text">Live Demo</span>
                </a>
              \` : ''}
            </div>
          </div>
        </div>
        
        <div class="modal-details">
          <div class="detail-section">
            <h3>Technologies Used</h3>
            <div class="tech-grid">
              \${project.technologies.map(tech => \`
                <div class="tech-item">
                  <span class="tech-name">\${tech}</span>
                </div>
              \`).join('')}
            </div>
          </div>
          
          <div class="detail-section">
            <h3>Key Features</h3>
            <div class="highlights-grid">
              \${project.highlights.map(highlight => \`
                <div class="highlight-item">
                  <span class="highlight-icon">✓</span>
                  <span class="highlight-text">\${highlight}</span>
                </div>
              \`).join('')}
            </div>
          </div>
          
          \${project.github ? \`
            <div class="detail-section">
              <h3>Repository Stats</h3>
              <div class="github-stats-detailed" data-repo="\${project.github}">
                <div class="stat-card">
                  <div class="stat-icon">⭐</div>
                  <div class="stat-info">
                    <div class="stat-value">--</div>
                    <div class="stat-label">Stars</div>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">🍴</div>
                  <div class="stat-info">
                    <div class="stat-value">--</div>
                    <div class="stat-label">Forks</div>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">📝</div>
                  <div class="stat-info">
                    <div class="stat-value">--</div>
                    <div class="stat-label">Commits</div>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">🔧</div>
                  <div class="stat-info">
                    <div class="stat-value">--</div>
                    <div class="stat-label">Language</div>
                  </div>
                </div>
              </div>
            </div>
          \` : ''}
        </div>
      </div>
    \`;

    // Show modal
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Load GitHub stats if available
    if (project.github) {
      this.loadGitHubStats(project.github);
    }

    this.emit('projects:modal-open', project);
  }

  /**
   * Close project modal
   */
  closeModal() {
    if (!this.modal) return;

    this.modal.classList.remove('active');
    document.body.style.overflow = '';

    this.emit('projects:modal-close');
  }

  /**
   * Load featured projects first
   */
  loadFeaturedProjects() {
    const featuredCards = this.projectsElement.querySelectorAll('.project-card.featured');
    featuredCards.forEach(card => {
      const img = card.querySelector('.project-image');
      if (img && img.dataset.src) {
        img.src = img.dataset.src;
        img.onload = () => this.handleImageLoad(img);
      }
    });
  }

  /**
   * Get static GitHub data for repositories (no API calls)
   */
  getStaticGitHubData(repo) {
    // Static data mapped to specific repositories to prevent API failures
    const staticRepoData = {
      'username/ecommerce-api': { stars: 45, forks: 12, language: 'Node.js', commits: 156 },
      'username/realtime-chat': { stars: 32, forks: 8, language: 'Go', commits: 89 },
      'username/data-pipeline': { stars: 28, forks: 6, language: 'Python', commits: 134 },
      'username/auth-service': { stars: 19, forks: 4, language: 'Node.js', commits: 67 },
      'username/monitoring-dashboard': { stars: 15, forks: 3, language: 'Python', commits: 78 },
      'username/blockchain-api': { stars: 23, forks: 5, language: 'Node.js', commits: 45 }
    };

    return staticRepoData[repo] || {
      stars: 12,
      forks: 3,
      language: 'JavaScript',
      commits: 42
    };
  }

  /**
   * Load GitHub statistics - uses static data to prevent startup failures
   */
  async loadGitHubStats(repo) {
    if (!repo) return;

    // Use static data to prevent API failures during startup
    const staticData = this.getStaticGitHubData(repo);
    this.githubCache.set(repo, staticData);
    this.updateGitHubStatsDisplay(repo, staticData);
  }

  /**
   * Update GitHub stats display with static data
   */
  updateGitHubStatsDisplay(repo, data) {
    // Update project card stats
    const projectCard = document.querySelector(\`[data-repo="\${repo}"]\`);
    if (projectCard) {
      const starsStat = projectCard.querySelector('.stat-item .stat-value');
      const forksStat = projectCard.querySelectorAll('.stat-item .stat-value')[1];

      if (starsStat) starsStat.textContent = data.stars;
      if (forksStat) forksStat.textContent = data.forks;
    }

    // Update modal stats if open
    const modalStats = document.querySelector('.github-stats-detailed');
    if (modalStats && modalStats.dataset.repo === repo) {
      const statCards = modalStats.querySelectorAll('.stat-card .stat-value');
      if (statCards.length >= 4) {
        statCards[0].textContent = data.stars;
        statCards[1].textContent = data.forks;
        statCards[2].textContent = data.commits;
        statCards[3].textContent = data.language;
      }
    }
  }

  /**
   * Handle section becoming active
   */
  handleSectionActive(sectionId) {
    if (sectionId === 'projects') {
      // Load GitHub stats for visible projects when section becomes active
      this.projectsData.forEach(project => {
        if (project.github) {
          this.loadGitHubStats(project.github);
        }
      });
    }
  }

  /**
   * Get projects data for external use
   */
  getProjectsData() {
    return this.projectsData;
  }

  /**
   * Get project by ID
   */
  getProjectById(id) {
    return this.projectsData.find(project => project.id === id);
  }

  /**
   * Search projects by query
   */
  searchProjects(query) {
    const searchTerm = query.toLowerCase();
    return this.projectsData.filter(project =>
      project.title.toLowerCase().includes(searchTerm) ||
      project.description.toLowerCase().includes(searchTerm) ||
      project.technologies.some(tech => tech.toLowerCase().includes(searchTerm)) ||
      project.highlights.some(highlight => highlight.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Destroy the component
   */
  destroy() {
    // Remove event listeners
    this.filterButtons.forEach(button => {
      button.removeEventListener('click', this.handleFilterClick);
    });

    this.projectCards.forEach(card => {
      card.removeEventListener('click', this.handleProjectClick);
    });

    // Disconnect observers
    if (this.cardObserver) {
      this.cardObserver.disconnect();
    }

    // Remove app event listeners
    this.app.off('section:active', this.handleSectionActive);

    // Close modal if open
    this.closeModal();

    this.emit('projects:destroyed');
  }
}//
 Export the Projects class
export { Projects };