import '../styles/globals.css'
import Head from 'next/head';
import Layout from '../components/Layout';
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Loading from "../components/system/Loading";



function MyApp({ Component, pageProps }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleStart = (url) => { 
            url !== router.pathname ? setLoading(true) : setLoading(false); 
        };
        const handleComplete = (url) => setLoading(false);
        router.events.on("routeChangeStart", handleStart);
        router.events.on("routeChangeComplete", handleComplete);
        router.events.on("routeChangeError", handleComplete);
    }, [router]);

    const head = () => (
        <Head>
            <link rel="icon" type="image/png" href={"/metalogo.png"}/>
        </Head>
    );

    return (
        <>
            <Layout>
                {head()}
                {
                (loading) ?
                (<Loading loading={loading} />) : 
                (<Component {...pageProps} />) 
                }
            </Layout>
        </>
    )
}

export default MyApp;