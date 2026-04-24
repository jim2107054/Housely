const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add SVG transformer
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};

config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...config.resolver.sourceExts, "svg"],
  // Block the nested expo-crypto inside expo-auth-session (requires native
  // ExpoCryptoAES module not available in Expo Go). Metro will fall back to
  // resolving expo-crypto from the project root, which IS Expo-Go-compatible.
  // Use [/\\] to match both forward slashes (macOS/Linux) and backslashes (Windows).
  blockList: [
    /node_modules[/\\]expo-auth-session[/\\]node_modules[/\\]expo-crypto[/\\]/,
  ],
  extraNodeModules: {
    'expo-crypto': path.resolve(__dirname, 'node_modules/expo-crypto'),
  },
};

module.exports = withNativeWind(config, { input: './global.css' })