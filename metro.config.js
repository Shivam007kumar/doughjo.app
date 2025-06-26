const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable React 19 JSX transform
config.transformer.unstable_allowRequireContext = true;

module.exports = config;