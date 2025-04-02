#!/bin/bash

# This script generates various icon sizes from a single SVG file
# Requires librsvg (rsvg-convert) and ImageMagick (convert)

# Check if required tools are installed
if ! command -v rsvg-convert &> /dev/null && ! command -v convert &> /dev/null; then
    echo "Error: This script requires librsvg (rsvg-convert) and ImageMagick (convert)"
    echo "Install with: brew install librsvg imagemagick (on macOS)"
    exit 1
fi

# Source SVG file
SVG_FILE="favicon.svg"
BASE_DIR="$(dirname "$0")"
SVG_PATH="${BASE_DIR}/${SVG_FILE}"

# Check if source file exists
if [ ! -f "$SVG_PATH" ]; then
    echo "Error: Source SVG file not found at $SVG_PATH"
    exit 1
fi

# Create PNG icons in various sizes
echo "Generating PNG icons from SVG..."
sizes=(16 32 48 57 60 72 76 96 114 120 128 144 152 180 192 384 512)

for size in "${sizes[@]}"; do
    echo "Creating ${size}x${size} icon..."
    
    # Using rsvg-convert if available
    if command -v rsvg-convert &> /dev/null; then
        rsvg-convert -w $size -h $size "$SVG_PATH" -o "${BASE_DIR}/icon-${size}.png"
    # Fallback to convert
    elif command -v convert &> /dev/null; then
        convert -background none -size "${size}x${size}" "$SVG_PATH" "${BASE_DIR}/icon-${size}.png"
    fi
done

# Create apple-touch-icon (180px)
echo "Creating apple-touch-icon.png..."
cp "${BASE_DIR}/icon-180.png" "${BASE_DIR}/apple-touch-icon.png"

# Create favicon.ico (multi-size: 16, 32, 48)
echo "Creating favicon.ico..."
if command -v convert &> /dev/null; then
    convert "${BASE_DIR}/icon-16.png" "${BASE_DIR}/icon-32.png" "${BASE_DIR}/icon-48.png" "${BASE_DIR}/favicon.ico"
    echo "favicon.ico created successfully."
else
    echo "Warning: Could not create favicon.ico - ImageMagick's convert command not found."
fi

echo "Icon generation complete!"