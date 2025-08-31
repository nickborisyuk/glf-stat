import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function updateVersion() {
  try {
    // Read current version
    const versionFile = path.join(__dirname, 'version.json');
    const versionData = JSON.parse(await fs.readFile(versionFile, 'utf8'));
    
    // Parse current version
    const [major, minor, timestamp] = versionData.version.split('.');
    
    // Increment minor version
    const newMinor = parseInt(minor) + 1;
    
    // Get current time in HHMMSS format
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const newTimestamp = `${hours}${minutes}${seconds}`;
    
    // Create new version
    const newVersion = `0.${newMinor}.${newTimestamp}`;
    
    // Update version file
    const newVersionData = {
      version: newVersion,
      lastDeploy: now.toISOString()
    };
    
    await fs.writeFile(versionFile, JSON.stringify(newVersionData, null, 2));
    
    console.log(`✅ Version updated: ${versionData.version} → ${newVersion}`);
    
    // Update version in App.jsx
    const appFile = path.join(__dirname, 'client', 'src', 'App.jsx');
    let appContent = await fs.readFile(appFile, 'utf8');
    
    // Replace version in App.jsx
    const versionRegex = /const APP_VERSION = ['"`][^'"`]*['"`]/;
    if (versionRegex.test(appContent)) {
      appContent = appContent.replace(versionRegex, `const APP_VERSION = '${newVersion}'`);
    } else {
      // Add version constant if it doesn't exist
      const importMatch = appContent.match(/import.*from.*['"`]react['"`]/);
      if (importMatch) {
        const afterImports = appContent.indexOf(importMatch[0]) + importMatch[0].length;
        appContent = appContent.slice(0, afterImports) + 
                    '\n\nconst APP_VERSION = \'' + newVersion + '\';' +
                    appContent.slice(afterImports);
      }
    }
    
    await fs.writeFile(appFile, appContent);
    console.log(`✅ Version updated in App.jsx: ${newVersion}`);
    
    // Update version in server/index.js
    const serverFile = path.join(__dirname, 'server', 'src', 'index.js');
    let serverContent = await fs.readFile(serverFile, 'utf8');
    
    // Replace version in server/index.js
    const serverVersionRegex = /const API_VERSION = ['"`][^'"`]*['"`]/;
    if (serverVersionRegex.test(serverContent)) {
      serverContent = serverContent.replace(serverVersionRegex, `const API_VERSION = '${newVersion}'`);
    } else {
      // Add version constant if it doesn't exist
      const importMatch = serverContent.match(/import.*from.*['"`]url['"`]/);
      if (importMatch) {
        const afterImports = serverContent.indexOf(importMatch[0]) + importMatch[0].length;
        serverContent = serverContent.slice(0, afterImports) + 
                        '\n\n// API Version - will be updated by update-version.js\nconst API_VERSION = \'' + newVersion + '\';' +
                        serverContent.slice(afterImports);
      }
    }
    
    await fs.writeFile(serverFile, serverContent);
    console.log(`✅ Version updated in server/index.js: ${newVersion}`);
    
    return newVersion;
  } catch (error) {
    console.error('❌ Error updating version:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateVersion();
}

export default updateVersion;
