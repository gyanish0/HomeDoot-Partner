#!/bin/bash

# HomeDoot Partner Icon Generator
# Usage: ./generate_icons.sh /path/to/your/hd_logo.png

SOURCE_IMAGE="$1"

if [ -z "$SOURCE_IMAGE" ]; then
    echo "Usage: ./generate_icons.sh /path/to/hd_logo.png"
    exit 1
fi

if [ ! -f "$SOURCE_IMAGE" ]; then
    echo "Error: Source image not found: $SOURCE_IMAGE"
    exit 1
fi

echo "Generating Android icons..."

# Android icons
sips -z 48 48 "$SOURCE_IMAGE" --out android/app/src/main/res/mipmap-mdpi/ic_launcher.png
sips -z 72 72 "$SOURCE_IMAGE" --out android/app/src/main/res/mipmap-hdpi/ic_launcher.png
sips -z 96 96 "$SOURCE_IMAGE" --out android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
sips -z 144 144 "$SOURCE_IMAGE" --out android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
sips -z 192 192 "$SOURCE_IMAGE" --out android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png

# Android round icons
sips -z 48 48 "$SOURCE_IMAGE" --out android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png
sips -z 72 72 "$SOURCE_IMAGE" --out android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png
sips -z 96 96 "$SOURCE_IMAGE" --out android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png
sips -z 144 144 "$SOURCE_IMAGE" --out android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png
sips -z 192 192 "$SOURCE_IMAGE" --out android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png

# Android foreground icons
sips -z 48 48 "$SOURCE_IMAGE" --out android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png
sips -z 72 72 "$SOURCE_IMAGE" --out android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png
sips -z 96 96 "$SOURCE_IMAGE" --out android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.png
sips -z 144 144 "$SOURCE_IMAGE" --out android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.png
sips -z 192 192 "$SOURCE_IMAGE" --out android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png

echo "Generating iOS icons..."

# iOS icons
sips -z 20 20 "$SOURCE_IMAGE" --out ios/cars24x7userapp/Images.xcassets/AppIcon.appiconset/Icon-20.png
sips -z 40 40 "$SOURCE_IMAGE" --out ios/cars24x7userapp/Images.xcassets/AppIcon.appiconset/Icon-20@2x.png
sips -z 60 60 "$SOURCE_IMAGE" --out ios/cars24x7userapp/Images.xcassets/AppIcon.appiconset/Icon-20@3x.png
sips -z 29 29 "$SOURCE_IMAGE" --out ios/cars24x7userapp/Images.xcassets/AppIcon.appiconset/Icon-29.png
sips -z 58 58 "$SOURCE_IMAGE" --out ios/cars24x7userapp/Images.xcassets/AppIcon.appiconset/Icon-29@2x.png
sips -z 87 87 "$SOURCE_IMAGE" --out ios/cars24x7userapp/Images.xcassets/AppIcon.appiconset/Icon-29@3x.png
sips -z 40 40 "$SOURCE_IMAGE" --out ios/cars24x7userapp/Images.xcassets/AppIcon.appiconset/Icon-40.png
sips -z 80 80 "$SOURCE_IMAGE" --out ios/cars24x7userapp/Images.xcassets/AppIcon.appiconset/Icon-40@2x.png
sips -z 120 120 "$SOURCE_IMAGE" --out ios/cars24x7userapp/Images.xcassets/AppIcon.appiconset/Icon-40@3x.png
sips -z 120 120 "$SOURCE_IMAGE" --out ios/cars24x7userapp/Images.xcassets/AppIcon.appiconset/Icon-60@2x.png
sips -z 180 180 "$SOURCE_IMAGE" --out ios/cars24x7userapp/Images.xcassets/AppIcon.appiconset/Icon-60@3x.png
sips -z 76 76 "$SOURCE_IMAGE" --out ios/cars24x7userapp/Images.xcassets/AppIcon.appiconset/Icon-76.png
sips -z 152 152 "$SOURCE_IMAGE" --out ios/cars24x7userapp/Images.xcassets/AppIcon.appiconset/Icon-76@2x.png
sips -z 167 167 "$SOURCE_IMAGE" --out ios/cars24x7userapp/Images.xcassets/AppIcon.appiconset/Icon-83.5@2x.png
sips -z 1024 1024 "$SOURCE_IMAGE" --out ios/cars24x7userapp/Images.xcassets/AppIcon.appiconset/Icon-1024.png

echo "✅ Icons generated successfully!"
echo ""
echo "Next steps:"
echo "1. Clean build: cd android && ./gradlew clean"
echo "2. Rebuild app: npx react-native run-android"
echo "3. For iOS: cd ios && rm -rf build && pod install"
