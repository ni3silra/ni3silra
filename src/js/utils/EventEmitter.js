/**
 * Event Emitter Utility
 * Provides event-driven architecture for components
 */

export class EventEmitter {
  constructor() {
    this.events = new Map();
  }
  
  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   * @param {Object} options - Options (once, priority)
   */
  on(event, callback, options = {}) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    
    const listener = {
      callback,
      once: options.once || false,
      priority: options.priority || 0
    };
    
    const listeners = this.events.get(event);
    listeners.push(listener);
    
    // Sort by priority (higher priority first)
    listeners.sort((a, b) => b.priority - a.priority);
    
    return this;
  }
  
  /**
   * Add one-time event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  once(event, callback) {
    return this.on(event, callback, { once: true });
  }
  
  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback to remove
   */
  off(event, callback) {
    if (!this.events.has(event)) {
      return this;
    }
    
    const listeners = this.events.get(event);
    const index = listeners.findIndex(listener => listener.callback === callback);
    
    if (index !== -1) {
      listeners.splice(index, 1);
    }
    
    if (listeners.length === 0) {
      this.events.delete(event);
    }
    
    return this;
  }
  
  /**
   * Emit event
   * @param {string} event - Event name
   * @param {...any} args - Arguments to pass to listeners
   */
  emit(event, ...args) {
    if (!this.events.has(event)) {
      return this;
    }
    
    const listeners = this.events.get(event).slice(); // Copy to avoid mutation issues
    
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      
      try {
        listener.callback.apply(this, args);
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
      }
      
      if (listener.once) {
        this.off(event, listener.callback);
      }
    }
    
    return this;
  }
  
  /**
   * Remove all listeners for an event or all events
   * @param {string} [event] - Event name (optional)
   */
  removeAllListeners(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
    
    return this;
  }
  
  /**
   * Get listener count for an event
   * @param {string} event - Event name
   * @returns {number} Number of listeners
   */
  listenerCount(event) {
    return this.events.has(event) ? this.events.get(event).length : 0;
  }
  
  /**
   * Get all event names
   * @returns {string[]} Array of event names
   */
  eventNames() {
    return Array.from(this.events.keys());
  }
}