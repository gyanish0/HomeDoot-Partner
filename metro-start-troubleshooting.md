# Metro and Android Build Fix

## Symptom

Running `npm start` failed before the app loaded with:

`TypeError: Cannot read properties of undefined (reading 'handle')`

The stack trace pointed into `connect`, then Metro's `runServer` path.

## Root Cause

`@react-native/community-cli-plugin` was passing `indexPageMiddleware` into Metro's `unstable_extraMiddleware` list, but the installed `@react-native-community/cli-server-api` build was not exporting that symbol. `connect()` treats middleware entries as functions, so the undefined value crashed server startup.

## Fix Applied

The installed `@react-native-community/cli-server-api/build/index.js` was updated to export `indexPageMiddleware` from `./indexPageMiddleware`.

## Verification

Confirmed the middleware exports are functions:

```bash
node -e "const { indexPageMiddleware } = require('@react-native-community/cli-server-api'); console.log(typeof indexPageMiddleware)"

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createDevServerMiddleware = createDevServerMiddleware;
exports.indexPageMiddleware = void 0;

```

Confirmed Metro starts cleanly on a spare port:

```bash
npm start -- --port 8082
```

## Note

This change was made inside `node_modules`, so reinstalling dependencies may remove it. If the issue returns after a clean install, update the dependency set so `@react-native-community/cli-server-api` provides `indexPageMiddleware` again.

## Android Codegen Failure

If `npm run android` fails in `:react-native-screens:generateCodegenSchemaFromJavaScript` with:

`Unknown prop type for "accessibilityContainerViewIsModal": "undefined"`

the installed `react-native-screens` release is too new for the app's current React Native codegen. Pinning `react-native-screens` to `4.10.0` avoids the unsupported `CT.WithDefault<...>` annotation in `src/fabric/FullWindowOverlayNativeComponent.ts` and lets the Android build continue.

Verification:

```bash
npm install
npm run android
```

## Gesture Handler Kotlin Failure

If the Android build later fails in `:react-native-gesture-handler:compileDebugKotlin` with an error like:

`Class 'ButtonViewGroup' is not abstract and does not implement abstract member 'getPointerEvents'`

the installed `react-native-gesture-handler` release is too new for the app's React Native version. Pinning `react-native-gesture-handler` to `2.24.0` removes the incompatible `pointerEvents` override from `RNGestureHandlerButtonViewManager.kt`.

Verification:

```bash
npm install
npm run android
```

## SVG Yoga API Failure

If the Android build fails in `react-native-svg` with an error like:

`no member named 'StyleSizeLength' in namespace 'facebook::yoga'`

the installed `react-native-svg` release is too new for React Native 0.77. Pinning `react-native-svg` to `15.11.2` keeps the codegen C++ aligned with the Yoga API shipped in this app's RN version.

Verification:

```bash
npm install
npm run android
```