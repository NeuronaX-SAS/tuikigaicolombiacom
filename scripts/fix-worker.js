/**
 * Script to fix the _worker.js file for Cloudflare Pages deployment
 * This replaces the simple sed command with a more robust Node.js solution
 */
const fs = require('fs');
const path = require('path');

const workerFilePath = path.join(__dirname, '../dist/_worker.js');

try {
  console.log('Fixing _worker.js file...');
  
  // Create the proper worker file content
  const workerContent = `/**
 * Worker script for Cloudflare Pages
 * This file properly imports from the correct asset path
 */
import { fetch } from "./assets/assets/entry.cloudflare-pages.js"; // Adjusted path
export default { fetch };
`;

  // Write the fixed content to the worker file
  fs.writeFileSync(workerFilePath, workerContent, 'utf8');
  
  console.log('Successfully fixed _worker.js file!');
} catch (error) {
  console.error('Error fixing _worker.js file:', error);
  process.exit(1);
}