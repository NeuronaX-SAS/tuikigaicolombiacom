/**
 * Global JSON.stringify patch to handle circular references
 * This file should be imported early in the app initialization
 */

// Store the original stringify function
const originalStringify = JSON.stringify;

/**
 * Clone an object with depth limitation to avoid circular references
 */
function depthLimitedClone(obj, maxDepth = 3, currentDepth = 0) {
  if (currentDepth >= maxDepth) {
    if (Array.isArray(obj)) return '[Array]';
    if (typeof obj === 'object' && obj !== null) return '[Object]';
    return obj;
  }
  
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => depthLimitedClone(item, maxDepth, currentDepth + 1));
  }
  
  const result = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Skip known problematic properties that cause circular references in node environments
      if (key === 'socket' || key === 'parser') {
        result[key] = '[Circular:' + key + ']';
        continue;
      }
      result[key] = depthLimitedClone(obj[key], maxDepth, currentDepth + 1);
    }
  }
  return result;
}

/**
 * Safe stringify function that handles circular references
 */
function safeStringify(obj, replacer, space, maxDepth = 3) {
  if (obj === undefined) return 'undefined';
  if (obj === null) return 'null';
  
  const seen = new WeakSet();
  
  const customReplacer = (key, value) => {
    // Skip known problematic properties in node socket objects
    if ((key === 'socket' || key === 'parser') && 
        value && typeof value === 'object' && 
        value.constructor && 
        (value.constructor.name === 'Socket' || value.constructor.name === 'HTTPParser')) {
      return '[' + value.constructor.name + ']';
    }
    
    // Handle primitive values
    if (value === null || typeof value !== 'object') {
      return value;
    }
    
    // Handle special types
    if (typeof value === 'function') return '[Function]';
    if (typeof value === 'symbol') return value.toString();
    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack
      };
    }
    
    // Handle circular references
    if (seen.has(value)) {
      return '[Circular]';
    }
    seen.add(value);
    
    // Handle special object types
    if (value.constructor && value.constructor !== Object && value.constructor !== Array) {
      // Special handling for Socket objects which are common in Node.js
      if (value.constructor.name === 'Socket' || value.constructor.name === 'HTTPParser') {
        return '[' + value.constructor.name + ']';
      }
      return `[${value.constructor.name}]`;
    }
    
    return value;
  };

  try {
    return originalStringify(obj, customReplacer, space);
  } catch (error) {
    console.warn('Falling back to depth-limited stringify:', error.message);
    return originalStringify(depthLimitedClone(obj, maxDepth), replacer, space);
  }
}

// Patch JSON.stringify globally
JSON.stringify = function(value, replacer, space) {
  // Early detection of Socket objects which commonly cause circular references
  if (value && typeof value === 'object') {
    const constructorName = value.constructor && value.constructor.name;
    if (constructorName === 'Socket' || constructorName === 'HTTPParser') {
      return `["${constructorName}"]`;
    }
  }

  try {
    return originalStringify(value, replacer, space);
  } catch (error) {
    if (error instanceof TypeError && 
       (error.message.includes('circular structure') || 
        error.message.includes('Converting circular'))) {
      console.warn('Detected circular reference in JSON.stringify, using safe version');
      return safeStringify(value, replacer, space);
    }
    throw error;
  }
};

// Export the functions for direct usage
export {
  originalStringify,
  safeStringify,
  depthLimitedClone
};