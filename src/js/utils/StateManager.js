/**
 * Enhanced State Manager Utility
 * Centralized state management with UI interaction support
 */

import { EventEmitter } from './EventEmitter.js';

export class StateManager extends EventEmitter {
  constructor(initialState = {}) {
    super();
    this.state = { ...initialState };
    this.previousState = {};
    this.stateHistory = [];
    this.maxHistorySize = 50;
    this.middleware = [];
    this.validators = new Map();
    this.computedProperties = new Map();
    this.persistentKeys = new Set();
    
    // Initialize persistent state from localStorage
    this.loadPersistedState();
  }
  
  /**
   * Get current state or specific property
   * @param {string} [key] - Optional key to get specific property
   * @returns {any} State value
   */
  getState(key) {
    if (key) {
      // Check for computed properties
      if (this.computedProperties.has(key)) {
        return this.computedProperties.get(key)(this.state);
      }
      return this.state[key];
    }
    
    // Return state with computed properties
    const stateWithComputed = { ...this.state };
    this.computedProperties.forEach((computeFn, key) => {
      stateWithComputed[key] = computeFn(this.state);
    });
    
    return stateWithComputed;
  }
  
  /**
   * Set state with partial updates, validation, and middleware
   * @param {Object} updates - State updates
   * @param {boolean} [silent=false] - Skip event emission
   * @param {Object} [options] - Additional options
   */
  setState(updates, silent = false, options = {}) {
    // Validate updates
    const validationErrors = this.validateUpdates(updates);
    if (validationErrors.length > 0) {
      console.error('State validation errors:', validationErrors);
      this.emit('state:validation-error', validationErrors);
      return false;
    }
    
    // Apply middleware
    let processedUpdates = updates;
    for (const middleware of this.middleware) {
      processedUpdates = middleware(processedUpdates, this.state, options);
    }
    
    // Store previous state
    this.previousState = { ...this.state };
    
    // Update state
    this.state = { ...this.state, ...processedUpdates };
    
    // Add to history
    this.addToHistory({
      timestamp: Date.now(),
      updates: processedUpdates,
      previousState: this.previousState,
      currentState: { ...this.state }
    });
    
    // Persist state if needed
    this.persistState(processedUpdates);
    
    if (!silent) {
      this.emit('state:change', {
        current: this.getState(),
        previous: this.previousState,
        updates: processedUpdates,
        options
      });
      
      // Emit specific property change events
      Object.keys(processedUpdates).forEach(key => {
        this.emit(`state:change:${key}`, {
          current: this.state[key],
          previous: this.previousState[key],
          options
        });
      });
      
      // Emit UI-specific events
      this.emitUIEvents(processedUpdates);
    }
    
    return true;
  }
  
  /**
   * Batch multiple state updates
   * @param {Function} updateFn - Function that performs multiple setState calls
   */
  batchUpdates(updateFn) {
    const batchedUpdates = {};
    const originalSetState = this.setState.bind(this);
    
    // Override setState to collect updates
    this.setState = (updates, silent = true) => {
      Object.assign(batchedUpdates, updates);
      return true;
    };
    
    // Execute the update function
    updateFn();
    
    // Restore original setState
    this.setState = originalSetState;
    
    // Apply all batched updates at once
    if (Object.keys(batchedUpdates).length > 0) {
      this.setState(batchedUpdates, false, { batched: true });
    }
  }
  
  /**
   * Add middleware for state updates
   * @param {Function} middleware - Middleware function
   */
  addMiddleware(middleware) {
    this.middleware.push(middleware);
  }
  
  /**
   * Add validator for state property
   * @param {string} key - State property key
   * @param {Function} validator - Validator function
   */
  addValidator(key, validator) {
    if (!this.validators.has(key)) {
      this.validators.set(key, []);
    }
    this.validators.get(key).push(validator);
  }
  
  /**
   * Add computed property
   * @param {string} key - Computed property key
   * @param {Function} computeFn - Compute function
   */
  addComputedProperty(key, computeFn) {
    this.computedProperties.set(key, computeFn);
  }
  
  /**
   * Mark state keys as persistent
   * @param {string[]} keys - Keys to persist
   */
  setPersistentKeys(keys) {
    keys.forEach(key => this.persistentKeys.add(key));
  }
  
  /**
   * Validate state updates
   * @param {Object} updates - Updates to validate
   * @returns {Array} Validation errors
   */
  validateUpdates(updates) {
    const errors = [];
    
    Object.keys(updates).forEach(key => {
      if (this.validators.has(key)) {
        const validators = this.validators.get(key);
        validators.forEach(validator => {
          try {
            const result = validator(updates[key], this.state);
            if (result !== true) {
              errors.push({
                key,
                value: updates[key],
                error: result || 'Validation failed'
              });
            }
          } catch (error) {
            errors.push({
              key,
              value: updates[key],
              error: error.message
            });
          }
        });
      }
    });
    
    return errors;
  }
  
  /**
   * Emit UI-specific events based on state changes
   * @param {Object} updates - State updates
   */
  emitUIEvents(updates) {
    // Navigation events
    if (updates.activeSection) {
      this.emit('ui:section-change', updates.activeSection);
    }
    
    // Menu events
    if (updates.isMenuOpen !== undefined) {
      this.emit('ui:menu-toggle', updates.isMenuOpen);
    }
    
    // Theme events
    if (updates.theme) {
      this.emit('ui:theme-change', updates.theme);
    }
    
    // Filter events
    if (updates.selectedSkillCategory) {
      this.emit('ui:skill-filter-change', updates.selectedSkillCategory);
    }
    
    if (updates.selectedProjectFilter) {
      this.emit('ui:project-filter-change', updates.selectedProjectFilter);
    }
    
    // Viewport events
    if (updates.viewport) {
      this.emit('ui:viewport-change', updates.viewport);
    }
    
    // Animation events
    if (updates.animations) {
      this.emit('ui:animation-change', updates.animations);
    }
  }
  
  /**
   * Add state change to history
   * @param {Object} historyEntry - History entry
   */
  addToHistory(historyEntry) {
    this.stateHistory.push(historyEntry);
    
    // Limit history size
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift();
    }
  }
  
  /**
   * Get state history
   * @param {number} [limit] - Limit number of entries
   * @returns {Array} State history
   */
  getHistory(limit) {
    return limit ? this.stateHistory.slice(-limit) : [...this.stateHistory];
  }
  
  /**
   * Undo last state change
   */
  undo() {
    if (this.stateHistory.length > 0) {
      const lastEntry = this.stateHistory.pop();
      this.state = { ...lastEntry.previousState };
      this.emit('state:undo', lastEntry);
      return true;
    }
    return false;
  }
  
  /**
   * Reset state to initial values
   * @param {Object} [initialState] - New initial state
   */
  resetState(initialState = {}) {
    this.previousState = { ...this.state };
    this.state = { ...initialState };
    this.stateHistory = [];
    
    this.emit('state:reset', {
      current: this.getState(),
      previous: this.previousState
    });
  }
  
  /**
   * Load persisted state from localStorage
   */
  loadPersistedState() {
    try {
      const persistedState = localStorage.getItem('app-state');
      if (persistedState) {
        const parsed = JSON.parse(persistedState);
        Object.keys(parsed).forEach(key => {
          if (this.persistentKeys.has(key)) {
            this.state[key] = parsed[key];
          }
        });
      }
    } catch (error) {
      console.warn('Failed to load persisted state:', error);
    }
  }
  
  /**
   * Persist state to localStorage
   * @param {Object} updates - Recent updates
   */
  persistState(updates) {
    try {
      const persistentUpdates = {};
      Object.keys(updates).forEach(key => {
        if (this.persistentKeys.has(key)) {
          persistentUpdates[key] = updates[key];
        }
      });
      
      if (Object.keys(persistentUpdates).length > 0) {
        const currentPersisted = JSON.parse(localStorage.getItem('app-state') || '{}');
        const newPersisted = { ...currentPersisted, ...persistentUpdates };
        localStorage.setItem('app-state', JSON.stringify(newPersisted));
      }
    } catch (error) {
      console.warn('Failed to persist state:', error);
    }
  }
  
  /**
   * Subscribe to state changes
   * @param {Function} callback - Callback function
   * @param {string} [key] - Optional specific key to watch
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback, key) {
    const event = key ? `state:change:${key}` : 'state:change';
    this.on(event, callback);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }
  
  /**
   * Subscribe to UI events
   * @param {string} event - UI event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribeToUI(event, callback) {
    const uiEvent = `ui:${event}`;
    this.on(uiEvent, callback);
    
    return () => this.off(uiEvent, callback);
  }
  
  /**
   * Unsubscribe from state changes
   * @param {Function} callback - Callback function
   * @param {string} [key] - Optional specific key
   */
  unsubscribe(callback, key) {
    const event = key ? `state:change:${key}` : 'state:change';
    return this.off(event, callback);
  }
  
  /**
   * Get state snapshot for debugging
   * @returns {Object} State snapshot
   */
  getSnapshot() {
    return {
      current: this.getState(),
      previous: this.previousState,
      history: this.getHistory(10),
      validators: Array.from(this.validators.keys()),
      computedProperties: Array.from(this.computedProperties.keys()),
      persistentKeys: Array.from(this.persistentKeys)
    };
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    this.removeAllListeners();
    this.stateHistory = [];
    this.middleware = [];
    this.validators.clear();
    this.computedProperties.clear();
    this.persistentKeys.clear();
  }
}