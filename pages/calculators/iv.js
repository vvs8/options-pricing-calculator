import React from 'react'
import Head from 'next/head';
import IV from '../../components/ops/IV';


const ImpliedVolatility = () => {
    const head = () => (
        <Head>
            <title>Implied Volatility IV Calculator</title>
        </Head>
    );
    return (
        <>
            {head()}
            <IV/>
        </>
    )
}

export default ImpliedVolatility ;