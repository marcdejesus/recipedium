import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en" className="light">
        <Head>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <body className="min-h-screen bg-background antialiased">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument; 