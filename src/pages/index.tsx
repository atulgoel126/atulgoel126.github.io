import Head from 'next/head';
import React from 'react';
import { PixelRoom } from '../components/room/PixelRoom';

const IndexPage: React.FC = () => (
  <>
    <Head>
      <title>Atul Goel — games, fintech & the teams behind them</title>
      <meta
        name="description"
        content="Atul Goel is a tech lead and co-founder with 8 years across games, fintech and cloud. Step into the room — everything is clickable."
      />
    </Head>
    <PixelRoom />
  </>
);

export default IndexPage;
