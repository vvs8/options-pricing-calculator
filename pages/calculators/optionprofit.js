import React from 'react'
import Head from 'next/head';
import Profit from '../../components/ops/Profit';

const  Home = () => {

  const head = () => (
    <Head>
        <title>Options Profit Calculator</title>
    </Head>
);

  return (
    <>
        {head()}
        <Profit />
    </>
  );
}

export default Home;