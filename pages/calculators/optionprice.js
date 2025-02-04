import React from 'react'
import Head from 'next/head';
import OptionPrice from '../../components/ops/OptionPrice';


const Price = () => {
    const head = () => (
        <Head>
            <title>Call & Put Option Price and Greeks Calculator</title>
        </Head>
    );
    return (
        <>
            {head()}
            <OptionPrice/>
        </>
    )
}

export default Price;