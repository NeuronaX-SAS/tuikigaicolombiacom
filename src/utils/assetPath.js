/**
 * Utility to handle asset paths consistently across environments
 * This ensures paths are correct in both development and production
 * 
 * @param {string} path - Relative path from public directory (e.g., 'images/logo.png')
 * @returns {string} - Properly formatted path
 */
export function getAssetPath(path) {
  // Remove leading slash if it exists
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `/${cleanPath}`;
}