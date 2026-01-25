const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const config = async () => {
    const defaultConfig = await getDefaultConfig(__dirname);
    const {
      resolver: {sourceExts, assetExts},
    } = defaultConfig;
  
    return mergeConfig(defaultConfig, {
      transformer: {
        babelTransformerPath: require.resolve('react-native-svg-transformer'),
        getTransformOptions: async () => ({
          transform: {
            experimentalImportSupport: false,
            inlineRequires: true,
          },
        }),
      },
      resolver: {
        assetExts: assetExts.filter(ext => ext !== 'svg'),
        sourceExts: [...sourceExts, 'svg'],
      },
    });
  };
  


  
  module.exports = config;


// const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

// /**
//  * Metro configuration
//  * https://reactnative.dev/docs/metro
//  *
//  * @type {import('metro-config').MetroConfig}
//  */
// const config = {};

// module.exports = mergeConfig(getDefaultConfig(__dirname), config);
