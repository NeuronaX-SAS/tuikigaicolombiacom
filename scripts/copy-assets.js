/**
 * Script to ensure all assets from the public directory are correctly copied to the dist folder
 * This helps prevent 404 errors for static assets in production
 */
const fs = require('fs');
const path = require('path');

// Paths
const publicDir = path.join(__dirname, '../public');
const distDir = path.join(__dirname, '../dist');
const imagesDir = path.join(distDir, 'images');
const documentsDir = path.join(distDir, 'documents');

// Ensure target directories exist
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Copy a file from source to destination
function copyFile(source, destination) {
  try {
    fs.copyFileSync(source, destination);
    console.log(`Copied: ${source} → ${destination}`);
  } catch (error) {
    console.error(`Error copying ${source}: ${error.message}`);
  }
}

// Copy a directory and its contents recursively
function copyDirectory(source, destination) {
  ensureDirectoryExists(destination);
  
  const entries = fs.readdirSync(source, { withFileTypes: true });
  
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destPath = path.join(destination, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(sourcePath, destPath);
    } else {
      copyFile(sourcePath, destPath);
    }
  }
}

// Main execution
function main() {
  console.log('Starting asset copy process...');
  
  // Ensure dist directory exists
  ensureDirectoryExists(distDir);
  
  // Copy images directory
  const publicImagesDir = path.join(publicDir, 'images');
  if (fs.existsSync(publicImagesDir)) {
    ensureDirectoryExists(imagesDir);
    copyDirectory(publicImagesDir, imagesDir);
  }
  
  // Copy documents directory
  const publicDocsDir = path.join(publicDir, 'documents');
  if (fs.existsSync(publicDocsDir)) {
    ensureDirectoryExists(documentsDir);
    copyDirectory(publicDocsDir, documentsDir);
  }
  
  // Copy root files (like logo, favicon, etc.)
  const rootFiles = fs.readdirSync(publicDir, { withFileTypes: true });
  for (const file of rootFiles) {
    if (!file.isDirectory()) {
      const sourcePath = path.join(publicDir, file.name);
      const destPath = path.join(distDir, file.name);
      copyFile(sourcePath, destPath);
    }
  }
  
  console.log('Asset copy process completed!');
  
  // Patch the Cloudflare Pages Functions worker import path
  const workerPath = path.join(distDir, '_worker.js');
  if (fs.existsSync(workerPath)) {
    let workerCode = fs.readFileSync(workerPath, 'utf8');
    workerCode = workerCode.replace(
      'from "entry.cloudflare-pages"',
      'from "./entry.cloudflare-pages.js"'
    );
    fs.writeFileSync(workerPath, workerCode);
    console.log(`Patched worker import in ${workerPath}`);
  }
}

main();