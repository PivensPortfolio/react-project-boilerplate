#!/usr/bin/env node

/**
 * Bundle analysis script for React project
 * Analyzes build output and provides insights on bundle size and optimization opportunities
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '..', 'dist');
const ASSETS_DIR = path.join(DIST_DIR, 'assets');

/**
 * Get file size in human readable format
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Analyze bundle files
 */
function analyzeBundles() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Build directory not found. Run "npm run build" first.');
    process.exit(1);
  }

  if (!fs.existsSync(ASSETS_DIR)) {
    console.error('❌ Assets directory not found in build output.');
    process.exit(1);
  }

  const files = fs.readdirSync(ASSETS_DIR);
  const jsFiles = files.filter(file => file.endsWith('.js'));
  const cssFiles = files.filter(file => file.endsWith('.css'));
  
  let totalJSSize = 0;
  let totalCSSSize = 0;
  
  console.log('\n📊 Bundle Analysis Report\n');
  console.log('=' .repeat(50));
  
  // Analyze JavaScript files
  console.log('\n📦 JavaScript Bundles:');
  console.log('-'.repeat(30));
  
  const jsAnalysis = jsFiles.map(file => {
    const filePath = path.join(ASSETS_DIR, file);
    const stats = fs.statSync(filePath);
    const size = stats.size;
    totalJSSize += size;
    
    // Determine bundle type
    let type = 'Unknown';
    if (file.includes('index')) type = 'Main Bundle';
    else if (file.includes('vendor')) type = 'Vendor Bundle';
    else if (file.includes('chunk')) type = 'Lazy Chunk';
    
    return { file, size, type };
  }).sort((a, b) => b.size - a.size);
  
  jsAnalysis.forEach(({ file, size, type }) => {
    console.log(`  ${type.padEnd(15)} ${file.padEnd(30)} ${formatBytes(size).padStart(10)}`);
  });
  
  // Analyze CSS files
  if (cssFiles.length > 0) {
    console.log('\n🎨 CSS Bundles:');
    console.log('-'.repeat(30));
    
    cssFiles.forEach(file => {
      const filePath = path.join(ASSETS_DIR, file);
      const stats = fs.statSync(filePath);
      const size = stats.size;
      totalCSSSize += size;
      console.log(`  ${file.padEnd(40)} ${formatBytes(size).padStart(10)}`);
    });
  }
  
  // Summary
  console.log('\n📈 Summary:');
  console.log('-'.repeat(30));
  console.log(`  Total JS Size:  ${formatBytes(totalJSSize)}`);
  console.log(`  Total CSS Size: ${formatBytes(totalCSSSize)}`);
  console.log(`  Total Size:     ${formatBytes(totalJSSize + totalCSSSize)}`);
  
  // Recommendations
  console.log('\n💡 Optimization Recommendations:');
  console.log('-'.repeat(40));
  
  const mainBundle = jsAnalysis.find(bundle => bundle.type === 'Main Bundle');
  if (mainBundle && mainBundle.size > 500 * 1024) { // 500KB
    console.log('  ⚠️  Main bundle is large (>500KB). Consider code splitting.');
  }
  
  const vendorBundle = jsAnalysis.find(bundle => bundle.type === 'Vendor Bundle');
  if (vendorBundle && vendorBundle.size > 1024 * 1024) { // 1MB
    console.log('  ⚠️  Vendor bundle is large (>1MB). Consider splitting vendor chunks.');
  }
  
  if (jsAnalysis.filter(bundle => bundle.type === 'Lazy Chunk').length === 0) {
    console.log('  💡 No lazy chunks detected. Consider implementing route-based code splitting.');
  }
  
  if (totalJSSize > 2 * 1024 * 1024) { // 2MB
    console.log('  ⚠️  Total JS size is large (>2MB). Consider tree shaking and removing unused dependencies.');
  }
  
  console.log('\n✅ Analysis complete!\n');
  
  return {
    totalJSSize,
    totalCSSSize,
    totalSize: totalJSSize + totalCSSSize,
    bundles: jsAnalysis,
  };
}

/**
 * Check for common optimization opportunities
 */
function checkOptimizations() {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  console.log('🔍 Checking for optimization opportunities...\n');
  
  // Check for large dependencies
  const largeDependencies = [
    'lodash',
    'moment',
    'antd',
    'material-ui',
    '@mui/material',
  ];
  
  const foundLargeDeps = largeDependencies.filter(dep => 
    packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]
  );
  
  if (foundLargeDeps.length > 0) {
    console.log('📦 Large dependencies detected:');
    foundLargeDeps.forEach(dep => {
      console.log(`  - ${dep} (consider alternatives or tree shaking)`);
    });
    console.log();
  }
  
  // Check for optimization flags in build
  const viteConfigPath = path.join(__dirname, '..', 'vite.config.ts');
  if (fs.existsSync(viteConfigPath)) {
    const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
    
    if (!viteConfig.includes('rollupOptions')) {
      console.log('⚙️  Consider adding Rollup optimization options to vite.config.ts');
    }
    
    if (!viteConfig.includes('chunkSizeWarningLimit')) {
      console.log('⚙️  Consider setting chunkSizeWarningLimit in vite.config.ts');
    }
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const analysis = analyzeBundles();
    checkOptimizations();
    
    // Exit with warning if bundles are too large
    if (analysis.totalSize > 3 * 1024 * 1024) { // 3MB
      console.log('⚠️  Warning: Total bundle size exceeds 3MB');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error analyzing bundles:', error.message);
    process.exit(1);
  }
}