const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config')
const path = require('path')

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    assetExts: [
      'png',
      'jpg',
      'jpeg',
      'gif',
      'webp',
      'ttf',
      'otf',
      'svg',
      'mp3',
      'wav',
      'm4a',
      'json',
      'lottie',
    ],
    sourceExts: ['ts', 'tsx', 'js', 'jsx', 'json'],
    resolveRequest: (context, moduleName, platform) => {
      // Metro in React Native 0.76 can fail to resolve explicit `.js` imports
      // inside onnxruntime-common even though the CommonJS files are present.
      // Let Metro perform its normal extension lookup for just that package.
      const isOnnxRuntimeCommon = /[\\/]onnxruntime-common[\\/]dist[\\/]cjs[\\/]/.test(
        context.originModulePath,
      )
      if (isOnnxRuntimeCommon && moduleName.startsWith('./') && moduleName.endsWith('.js')) {
        return context.resolveRequest(context, moduleName.slice(0, -3), platform)
      }
      // Resolve SVG imports
      if (moduleName.endsWith('.svg')) {
        return context.resolveRequest(context, moduleName, platform)
      }
      return context.resolveRequest(context, moduleName, platform)
    },
  },
  watchFolders: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'assets')],
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
}

module.exports = mergeConfig(getDefaultConfig(__dirname), config)
