const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for three.js and expo-gl related extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs', 'mjs'];
config.resolver.assetExts = [...config.resolver.assetExts, 'glb', 'gltf', 'mtl', 'obj'];

// Add path aliases for @/ imports using unstable_enablePackageExports
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
