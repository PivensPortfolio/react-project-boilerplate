#!/usr/bin/env node

/**
 * Bundle optimization script
 * Analyzes and optimizes the build output for better performance
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '..', 'dist');
const ASSETS_DIR = path.join(DIST_DIR, 'assets');

/**
 * Analyze bundle composition
 */
function analyzeBundleComposition() {
  console.log('🔍 Analyzing bundle composition...\n');
  
  if (!fs.existsSync(ASSETS_DIR)) {
    console.error('❌ Assets directory not found. Run build first.');
    return;
  }
  
  const files = fs.readdirSync(ASSETS_DIR);
  const jsFiles = files.filter(file => file.endsWith('.js'));
  const cssFiles = files.filter(file => file.endsWith('.css'));
  
  // Analyze JavaScript bundles
  const bundleAnalysis = jsFiles.map(file => {
    const filePath = path.join(ASSETS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const size = fs.statSync(filePath).size;
    
    // Detect bundle type based on content
    let type = 'unknown';
    let libraries = [];
    
    if (content.includes('react') || content.includes('React')) {
      type = 'react-vendor';
      libraries.push('React');
    }
    if (content.includes('react-dom')) {
      libraries.push('ReactDOM');
    }
    if (content.includes('react-router')) {
      type = 'router-vendor';
      libraries.push('React Router');
    }
    if (content.includes('zustand')) {
      type = 'state-vendor';
      libraries.push('Zustand');
    }
    if (content.includes('axios')) {
      type = 'http-vendor';
      libraries.push('Axios');
    }
    if (file.includes('index') && type === 'unknown') {
      type = 'main';
    }
    if (file.includes('chunk')) {
      type = 'lazy-chunk';
    }
    
    // Detect potential optimizations
    const optimizations = [];
    if (content.includes('console.log') && process.env.NODE_ENV === 'production') {
      optimizations.push('Remove console.log statements');
    }
    if (content.includes('debugger')) {
      optimizations.push('Remove debugger statements');
    }
    if (size > 500 * 1024) { // 500KB
      optimizations.push('Consider code splitting');
    }
    
    return {
      file,
      type,
      size,
      libraries,
      optimizations,
    };
  });
  
  // Sort by size
  bundleAnalysis.sort((a, b) => b.size - a.size);
  
  console.log('📦 Bundle Analysis:');
  console.log('─'.repeat(80));
  
  bundleAnalysis.forEach(bundle => {
    const sizeKB = (bundle.size / 1024).toFixed(1);
    console.log(`${bundle.file.padEnd(40)} ${bundle.type.padEnd(15)} ${sizeKB.padStart(8)} KB`);
    
    if (bundle.libraries.length > 0) {
      console.log(`  📚 Libraries: ${bundle.libraries.join(', ')}`);
    }
    
    if (bundle.optimizations.length > 0) {
      console.log(`  💡 Optimizations: ${bundle.optimizations.join(', ')}`);
    }
    
    console.log();
  });
  
  return bundleAnalysis;
}

/**
 * Check for unused dependencies
 */
function checkUnusedDependencies() {
  console.log('🔍 Checking for unused dependencies...\n');
  
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const dependencies = Object.keys(packageJson.dependencies || {});
  const devDependencies = Object.keys(packageJson.devDependencies || {});
  
  // Read all source files to check usage
  const srcDir = path.join(__dirname, '..', 'src');
  const sourceFiles = getAllFiles(srcDir, ['.ts', '.tsx', '.js', '.jsx']);
  
  const allSourceContent = sourceFiles
    .map(file => fs.readFileSync(file, 'utf8'))
    .join('\n');
  
  const unusedDeps = dependencies.filter(dep => {
    // Skip certain dependencies that might not be directly imported
    const skipCheck = ['react', 'react-dom', '@types/react', '@types/react-dom'];
    if (skipCheck.includes(dep)) return false;
    
    // Check if dependency is imported or used
    const importPatterns = [
      new RegExp(`import.*from\\s+['"]${dep}['"]`, 'g'),
      new RegExp(`import\\s+['"]${dep}['"]`, 'g'),
      new RegExp(`require\\(['"]${dep}['"]\\)`, 'g'),
    ];
    
    return !importPatterns.some(pattern => pattern.test(allSourceContent));
  });
  
  if (unusedDeps.length > 0) {
    console.log('📦 Potentially unused dependencies:');
    unusedDeps.forEach(dep => {
      console.log(`  - ${dep}`);
    });
    console.log('\n💡 Consider removing these dependencies to reduce bundle size.\n');
  } else {
    console.log('✅ No unused dependencies detected.\n');
  }
  
  return unusedDeps;
}

/**
 * Optimize CSS files
 */
function optimizeCSS() {
  console.log('🎨 Optimizing CSS files...\n');
  
  const cssFiles = fs.readdirSync(ASSETS_DIR)
    .filter(file => file.endsWith('.css'))
    .map(file => path.join(ASSETS_DIR, file));
  
  cssFiles.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    const originalSize = content.length;
    
    // Basic CSS optimizations
    let optimized = content
      // Remove comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Remove whitespace around certain characters
      .replace(/\s*([{}:;,>+~])\s*/g, '$1')
      // Remove trailing semicolons
      .replace(/;}/g, '}')
      .trim();
    
    const optimizedSize = optimized.length;
    const savings = originalSize - optimizedSize;
    const savingsPercent = ((savings / originalSize) * 100).toFixed(1);
    
    if (savings > 0) {
      fs.writeFileSync(filePath, optimized);
      console.log(`✅ ${path.basename(filePath)}: ${savings} bytes saved (${savingsPercent}%)`);
    }
  });
  
  console.log();
}

/**
 * Generate performance report
 */
function generatePerformanceReport(bundleAnalysis) {
  console.log('📊 Performance Report\n');
  console.log('='.repeat(50));
  
  const totalJSSize = bundleAnalysis.reduce((sum, bundle) => sum + bundle.size, 0);
  const mainBundle = bundleAnalysis.find(b => b.type === 'main');
  const vendorBundles = bundleAnalysis.filter(b => b.type.includes('vendor'));
  const lazyChunks = bundleAnalysis.filter(b => b.type === 'lazy-chunk');
  
  console.log(`\n📦 Bundle Summary:`);
  console.log(`  Total JS Size: ${(totalJSSize / 1024).toFixed(1)} KB`);
  console.log(`  Main Bundle: ${mainBundle ? (mainBundle.size / 1024).toFixed(1) : 0} KB`);
  console.log(`  Vendor Bundles: ${vendorBundles.length} (${(vendorBundles.reduce((sum, b) => sum + b.size, 0) / 1024).toFixed(1)} KB)`);
  console.log(`  Lazy Chunks: ${lazyChunks.length} (${(lazyChunks.reduce((sum, b) => sum + b.size, 0) / 1024).toFixed(1)} KB)`);
  
  console.log(`\n🎯 Performance Scores:`);
  
  // Bundle size score
  const bundleSizeScore = totalJSSize < 500 * 1024 ? 'A' : 
                         totalJSSize < 1024 * 1024 ? 'B' : 
                         totalJSSize < 2 * 1024 * 1024 ? 'C' : 'D';
  console.log(`  Bundle Size: ${bundleSizeScore} (${(totalJSSize / 1024).toFixed(1)} KB)`);
  
  // Code splitting score
  const codeSplittingScore = lazyChunks.length > 0 ? 'A' : 
                            vendorBundles.length > 1 ? 'B' : 'C';
  console.log(`  Code Splitting: ${codeSplittingScore} (${lazyChunks.length} lazy chunks)`);
  
  // Vendor optimization score
  const vendorOptScore = vendorBundles.length > 2 ? 'A' : 
                        vendorBundles.length > 0 ? 'B' : 'C';
  console.log(`  Vendor Optimization: ${vendorOptScore} (${vendorBundles.length} vendor bundles)`);
  
  console.log(`\n💡 Recommendations:`);
  
  if (totalJSSize > 1024 * 1024) {
    console.log(`  - Total bundle size is large (${(totalJSSize / 1024 / 1024).toFixed(1)}MB). Consider more aggressive code splitting.`);
  }
  
  if (mainBundle && mainBundle.size > 500 * 1024) {
    console.log(`  - Main bundle is large (${(mainBundle.size / 1024).toFixed(1)}KB). Move more code to vendor bundles or lazy chunks.`);
  }
  
  if (lazyChunks.length === 0) {
    console.log(`  - No lazy chunks detected. Implement route-based code splitting for better performance.`);
  }
  
  if (vendorBundles.length < 2) {
    console.log(`  - Consider splitting vendor dependencies into separate chunks for better caching.`);
  }
  
  console.log();
}

/**
 * Helper function to get all files recursively
 */
function getAllFiles(dir, extensions) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    });
  }
  
  traverse(dir);
  return files;
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Bundle Optimization Tool\n');
  
  try {
    const bundleAnalysis = analyzeBundleComposition();
    checkUnusedDependencies();
    optimizeCSS();
    
    if (bundleAnalysis) {
      generatePerformanceReport(bundleAnalysis);
    }
    
    console.log('✅ Bundle optimization complete!\n');
  } catch (error) {
    console.error('❌ Error during bundle optimization:', error.message);
    process.exit(1);
  }
}