/**
 * Keyboard shortcut utilities for MaxiSign
 */

/**
 * Keyboard shortcuts configuration
 * 
 * This object maps action names to their keyboard shortcuts
 * and descriptions for display in the UI.
 */
export const KEYBOARD_SHORTCUTS = {
  // PDF Navigation
  NEXT_PAGE: {
    key: 'ArrowRight',
    display: '→',
    description: 'Next page',
    category: 'navigation'
  },
  PREV_PAGE: {
    key: 'ArrowLeft',
    display: '←',
    description: 'Previous page',
    category: 'navigation'
  },
  FIRST_PAGE: {
    key: 'Home',
    display: 'Home',
    description: 'First page',
    category: 'navigation'
  },
  LAST_PAGE: {
    key: 'End',
    display: 'End',
    description: 'Last page',
    category: 'navigation'
  },
  
  // Zoom Controls
  ZOOM_IN: {
    key: '+',
    altKey: true,
    display: 'Alt+Plus',
    description: 'Zoom in',
    category: 'zoom'
  },
  ZOOM_OUT: {
    key: '-',
    altKey: true,
    display: 'Alt+Minus',
    description: 'Zoom out',
    category: 'zoom'
  },
  RESET_ZOOM: {
    key: '0',
    altKey: true,
    display: 'Alt+0',
    description: 'Reset zoom',
    category: 'zoom'
  },
  
  // Image Manipulation
  DELETE_IMAGE: {
    key: 'Delete',
    display: 'Delete',
    description: 'Delete selected image',
    category: 'image'
  },
  UNDO: {
    key: 'z',
    ctrlKey: true,
    display: 'Ctrl+Z',
    description: 'Undo',
    category: 'edit'
  },
  REDO: {
    key: 'y',
    ctrlKey: true,
    display: 'Ctrl+Y',
    description: 'Redo',
    category: 'edit'
  },
  
  // Document Actions
  SAVE_PDF: {
    key: 's',
    ctrlKey: true,
    display: 'Ctrl+S',
    description: 'Save PDF',
    category: 'document'
  },
  OPEN_PDF: {
    key: 'o',
    ctrlKey: true,
    display: 'Ctrl+O',
    description: 'Open PDF',
    category: 'document'
  },
  
  // Help
  SHOW_SHORTCUTS: {
    key: '?',
    display: '?',
    description: 'Show keyboard shortcuts',
    category: 'help'
  }
};

/**
 * Check if a keyboard event matches a shortcut
 * 
 * @param {KeyboardEvent} event - Keyboard event
 * @param {Object} shortcut - Shortcut configuration
 * @returns {boolean} True if the event matches the shortcut
 */
export const matchesShortcut = (event, shortcut) => {
  if (event.key !== shortcut.key) return false;
  
  if (shortcut.ctrlKey && !event.ctrlKey) return false;
  if (!shortcut.ctrlKey && event.ctrlKey) return false;
  
  if (shortcut.altKey && !event.altKey) return false;
  if (!shortcut.altKey && event.altKey) return false;
  
  if (shortcut.shiftKey && !event.shiftKey) return false;
  if (!shortcut.shiftKey && event.shiftKey) return false;
  
  return true;
};

/**
 * Find a shortcut by action name
 * 
 * @param {string} actionName - Name of the action
 * @returns {Object|null} Shortcut configuration or null if not found
 */
export const getShortcutByAction = (actionName) => {
  return KEYBOARD_SHORTCUTS[actionName] || null;
};

/**
 * Get all shortcuts grouped by category
 * 
 * @returns {Object} Shortcuts grouped by category
 */
export const getShortcutsByCategory = () => {
  const categories = {};
  
  Object.entries(KEYBOARD_SHORTCUTS).forEach(([action, shortcut]) => {
    const category = shortcut.category || 'other';
    
    if (!categories[category]) {
      categories[category] = [];
    }
    
    categories[category].push({
      action,
      ...shortcut
    });
  });
  
  return categories;
};

/**
 * Create a keyboard event handler
 * 
 * @param {Object} handlers - Map of action names to handler functions
 * @returns {Function} Event handler function
 */
export const createKeyboardHandler = (handlers) => {
  return (event) => {
    // Don't handle events if focus is in an input element
    if (
      event.target.tagName === 'INPUT' ||
      event.target.tagName === 'TEXTAREA' ||
      event.target.isContentEditable
    ) {
      return;
    }
    
    for (const [action, handler] of Object.entries(handlers)) {
      const shortcut = KEYBOARD_SHORTCUTS[action];
      if (shortcut && matchesShortcut(event, shortcut)) {
        event.preventDefault();
        handler(event);
        break;
      }
    }
  };
};

export default {
  KEYBOARD_SHORTCUTS,
  matchesShortcut,
  getShortcutByAction,
  getShortcutsByCategory,
  createKeyboardHandler
};
