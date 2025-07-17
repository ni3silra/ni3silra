/**
 * Component Registry Utility
 * Manages component lifecycle and registration
 */

export class ComponentRegistry {
  constructor() {
    this.components = new Map();
    this.instances = new Map();
  }
  
  /**
   * Register a component class
   * @param {string} name - Component name
   * @param {Class} ComponentClass - Component class
   */
  register(name, ComponentClass) {
    this.components.set(name, ComponentClass);
  }
  
  /**
   * Create and initialize a component instance
   * @param {string} name - Component name
   * @param {Object} options - Component options
   * @param {string} [instanceId] - Optional instance ID
   * @returns {Object} Component instance
   */
  create(name, options = {}, instanceId) {
    const ComponentClass = this.components.get(name);
    
    if (!ComponentClass) {
      throw new Error(`Component "${name}" not registered`);
    }
    
    const id = instanceId || `${name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const instance = new ComponentClass(options);
    
    // Add metadata
    instance._componentName = name;
    instance._instanceId = id;
    instance._createdAt = Date.now();
    
    this.instances.set(id, instance);
    
    // Initialize if method exists
    if (typeof instance.init === 'function') {
      instance.init();
    }
    
    return instance;
  }
  
  /**
   * Get component instance by ID
   * @param {string} instanceId - Instance ID
   * @returns {Object|null} Component instance
   */
  getInstance(instanceId) {
    return this.instances.get(instanceId) || null;
  }
  
  /**
   * Get all instances of a component type
   * @param {string} name - Component name
   * @returns {Array} Array of instances
   */
  getInstancesByType(name) {
    return Array.from(this.instances.values())
      .filter(instance => instance._componentName === name);
  }
  
  /**
   * Destroy a component instance
   * @param {string} instanceId - Instance ID
   */
  destroy(instanceId) {
    const instance = this.instances.get(instanceId);
    
    if (instance) {
      // Call destroy method if exists
      if (typeof instance.destroy === 'function') {
        instance.destroy();
      }
      
      this.instances.delete(instanceId);
    }
  }
  
  /**
   * Destroy all instances of a component type
   * @param {string} name - Component name
   */
  destroyByType(name) {
    const instances = this.getInstancesByType(name);
    instances.forEach(instance => {
      this.destroy(instance._instanceId);
    });
  }
  
  /**
   * Destroy all component instances
   */
  destroyAll() {
    Array.from(this.instances.keys()).forEach(id => {
      this.destroy(id);
    });
  }
  
  /**
   * Get registry statistics
   * @returns {Object} Registry stats
   */
  getStats() {
    const typeCount = {};
    
    Array.from(this.instances.values()).forEach(instance => {
      const type = instance._componentName;
      typeCount[type] = (typeCount[type] || 0) + 1;
    });
    
    return {
      totalComponents: this.components.size,
      totalInstances: this.instances.size,
      instancesByType: typeCount
    };
  }
}