import React from 'react';
import '../styles/global.css';
import Head from 'next/head';

const App = ({ Component, pageProps }) => (
  <>
    <Head>
      <meta
        name="viewport"
        content="initial-scale=1.0, width=device-width"
        key="viewport"
      />
    </Head>
    <Component {...pageProps} />
  </>
);

export default App;
