#!/bin/bash

# Install dependencies
npm install

# Build the application
npm run build

# Copy 404.html to the output directory if it doesn't exist there
if [ ! -f "dist/spa/404.html" ]; then
  cp public/404.html dist/spa/404.html
fi

# Ensure index.html is properly set up
echo "Build completed successfully!"
