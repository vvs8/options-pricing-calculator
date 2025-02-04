import React from 'react'
import Head from 'next/head';
import { useRouter } from 'next/router'
import Profit from '../../components/ops/Profit';

const OptionsProfit = () => {
    const router = useRouter()
    let s = router.query.slug
    return (
        <>
            <Profit strategy={s}/>
        </>
    )
}

export default OptionsProfit;