/**
 * Utility to handle asset paths correctly in both development and production
 * This ensures paths are consistent across environments
 * 
 * @param {string} path - Relative path from public directory (e.g., 'images/logo.png')
 * @returns {string} - Properly formatted path for the current environment
 */
export function getAssetPath(path) {
  // Remove leading slash if it exists
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // In development and production, base URL should be properly set by Vite
  return import.meta.env.BASE_URL + cleanPath;
}