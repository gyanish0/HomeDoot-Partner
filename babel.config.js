module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module:react-native-dotenv', { moduleName: '@env', path: '.env' }],
    'react-native-reanimated/plugin',
  ],
  overrides: [
    {
      test: (fileName) => {
        return !fileName.includes("node_modules\\react-native-maps");
      },
      plugins: [
        ["@babel/plugin-transform-class-properties", { loose: true }],
        ["@babel/plugin-transform-private-methods", { loose: true }],
        [
          "@babel/plugin-transform-private-property-in-object",
          { loose: true },
        ],
       
      ],
    },
  ],
};


// module.exports = {
//   presets: ['module:@react-native/babel-preset'],
// };
