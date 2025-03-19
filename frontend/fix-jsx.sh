#!/bin/sh

# Make script exit when a command fails
set -e

# Install needed dependencies for JSX runtime
npm install --save react@18.2.0 react-dom@18.2.0
npm install --save-dev @babel/core @babel/preset-react

# Create proper .babelrc
echo '{
  "presets": [
    [
      "next/babel",
      {
        "preset-react": {
          "runtime": "automatic",
          "importSource": "react"
        }
      }
    ]
  ],
  "plugins": []
}' > .babelrc

# Ensure proper next.config.mjs
echo '/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    esmExternals: "loose",
  },
  // Explicitly configure JSX runtime
  compiler: {
    styledComponents: true,
    // Ensure proper JSX transformation
    emotion: false,
    reactRemoveProperties: process.env.NODE_ENV === "production",
    // Set the runtime to automatic
    react: {
      runtime: "automatic",
      importSource: "react"
    }
  },
};

export default nextConfig;' > next.config.mjs

# Ensure proper jsconfig.json
echo '{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    },
    "esModuleInterop": true,
    "moduleResolution": "node"
  },
  "include": ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}' > jsconfig.json

# Update _document.jsx to use class component style
echo 'import React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;' > pages/_document.jsx

# Clean Next.js cache
rm -rf .next

# Start Next.js
exec npm run dev 