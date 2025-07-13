/**
 * Utility functions for the extension
 */

/**
 * Safely clean and validate selected text
 */
export function cleanSelectedText(text: string): string | null {
  const cleaned = text
    .replace(/[\.\*\?;!()\+,\[:\]<>^_`\[\]{}~\\\/\"\'=]/g, ' ')
    .trim();

  if (!cleaned || cleaned.includes(' ') || !cleaned.match(/^[a-zA-Z]+$/)) {
    return null;
  }

  // Special case for words ending with "day"
  return cleaned.endsWith('day') ? cleaned : cleaned.toLowerCase();
}

/**
 * Check if the target element is an input field
 */
export function isInputElement(element: HTMLElement): boolean {
  const tagName = element.tagName.toLowerCase();
  return tagName === 'input' || tagName === 'textarea';
}

/**
 * Safely get window selection
 */
export function getWindowSelection(): Selection | null {
  try {
    return window.getSelection();
  } catch (error) {
    console.warn('Failed to get window selection:', error);
    return null;
  }
}

/**
 * Create element with classes
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  classes?: string[],
  attributes?: Record<string, string>
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);

  if (classes) {
    element.classList.add(...classes);
  }

  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }

  return element;
}

/**
 * Safely remove element from DOM
 */
export function safeRemoveElement(element: Element, parent?: Element): boolean {
  try {
    const parentElement = parent || element.parentElement;
    if (parentElement && parentElement.contains(element)) {
      parentElement.removeChild(element);
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Failed to remove element:', error);
    return false;
  }
}

/**
 * Debounce function to limit rapid calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: any;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Simple logger with different levels
 */
export const logger = {
  debug: (message: string, ...args: any[]): void => {
    // Only log in development mode if available
    if (typeof console !== 'undefined' && console.debug) {
      console.debug(`[LMD Debug] ${message}`, ...args);
    }
  },

  info: (message: string, ...args: any[]): void => {
    console.info(`[LMD Info] ${message}`, ...args);
  },

  warn: (message: string, ...args: any[]): void => {
    console.warn(`[LMD Warning] ${message}`, ...args);
  },

  error: (message: string, error?: any): void => {
    console.error(`[LMD Error] ${message}`, error);
  }
};

/**
 * Type guard to check if an element is an HTMLElement
 */
export function isHTMLElement(element: any): element is HTMLElement {
  return element instanceof HTMLElement;
}
