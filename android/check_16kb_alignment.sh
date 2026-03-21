#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <path-to-apk-or-aab>"
  exit 1
fi

ARTIFACT="$1"
SDK_ROOT="${ANDROID_SDK_ROOT:-$HOME/Library/Android/sdk}"
NDK_VERSION="${NDK_VERSION:-27.1.12297006}"
NDK_BIN="$SDK_ROOT/ndk/$NDK_VERSION/toolchains/llvm/prebuilt/darwin-x86_64/bin"
OBJDUMP="$NDK_BIN/llvm-objdump"
ZIPALIGN="$SDK_ROOT/build-tools/35.0.0/zipalign"

if [[ ! -f "$ARTIFACT" ]]; then
  echo "Artifact not found: $ARTIFACT"
  exit 1
fi

if [[ ! -x "$OBJDUMP" ]]; then
  echo "llvm-objdump not found: $OBJDUMP"
  exit 1
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

EXT="${ARTIFACT##*.}"
if [[ "$EXT" == "apk" || "$EXT" == "aab" ]]; then
  unzip -q "$ARTIFACT" -d "$TMP_DIR/extracted"
else
  echo "Unsupported file type: .$EXT (expected .apk or .aab)"
  exit 1
fi

echo "Checking ELF LOAD alignment (arm64-v8a/x86_64)..."
BAD=0
while IFS= read -r so_file; do
  if "$OBJDUMP" -p "$so_file" | awk '/LOAD/{gsub(/2\*\*/,"",$NF); if (($NF+0) < 14) bad=1} END{exit bad?0:1}'; then
    echo "UNALIGNED: ${so_file#$TMP_DIR/extracted/}"
    BAD=1
  fi
done < <(find "$TMP_DIR/extracted" -type f -name '*.so' | grep -E '/(arm64-v8a|x86_64)/')

if [[ "$BAD" -eq 0 ]]; then
  echo "All 64-bit ELF libraries are 16 KB compatible (LOAD alignment >= 2**14)."
fi

if [[ "$EXT" == "apk" ]]; then
  if [[ -x "$ZIPALIGN" ]]; then
    echo ""
    echo "Checking ZIP page alignment..."
    if "$ZIPALIGN" -v -c -P 16 4 "$ARTIFACT" >/dev/null; then
      echo "ZIPALIGN OK: 16 KB page alignment verified."
    else
      echo "ZIPALIGN FAIL: APK is not correctly 16 KB page-aligned."
      BAD=1
    fi
  else
    echo "zipalign not found: $ZIPALIGN (skipping zip alignment check)"
  fi
fi

if [[ "$BAD" -ne 0 ]]; then
  exit 2
fi
