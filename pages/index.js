import React from 'react'
import Image from 'next/image'
import Head from 'next/head';
import Link from 'next/link'
import Footer from '../components/Footer';

import styles from '../components/css/Home.module.css'

const  Home = () => {

  const head = () => (
    <Head>
        <title>Options Profit Calculator</title>
    </Head>
);

  return (
    <>
      {head()}
      <div className={styles.main}>
        <div className={styles.maintitle}>A collection of tools to make your options journey more comprehensive</div>
        <div>
          <div className={styles.wide}>
            <div className={styles.box}>
              <Link href='/calculators/optionprofit' style={{ textDecoration: 'none' }}>
                <div className={styles.pagebox}>
                  <div className={styles.title}>
                    Profit Calculator
                  </div>
                  <Image
                    src="/home1.png"
                    width={250}
                    height={250}
                    alt="Picture of the author"
                  />
                </div>
              </Link>
            </div>
            <div className={styles.desc}>
              Visualize profit/loss outcomes of the option strategy.
              <br/>
              <br/>
              Calculate option prices using the Black-Scholes model and research profit/loss outcomes over time for a given price of the underlying.
            </div>
          </div>
          <div className={styles.wide}>
            <div className={styles.box}>
              <Link href='/calculators/optionprice' style={{ textDecoration: 'none' }}>
                <div className={styles.pagebox}>
                  <div className={styles.title}>
                    Price and Greeks Calculator
                  </div>
                  <Image
                    src="/home2.png"
                    width={250}
                    height={250}
                    alt="Picture of the author"
                  />
                </div>
              </Link>
            </div>
            <div className={styles.desc}>
              Calculate call and put option greeks. 
              <br/>
              <br/>
              Use this interactive tool to see the effect of change in parameters.
            </div>
          </div>
          <div className={styles.wide}>
            <div className={styles.box}>
              <Link href='/calculators/iv' style={{ textDecoration: 'none' }}>
                <div className={styles.pagebox}>
                  <div className={styles.title}>
                    Implied Volatility Calculator
                  </div>
                  <Image
                    src="/home3.png"
                    width={250}
                    height={250}
                    alt="Picture of the author"
                  />
                </div>
              </Link> 
            </div>
            <div className={styles.desc}>
              Easily get an implied volatility value by using this calculator. 
              <br/>
              <br/>
              The calculator iteratively back-solves the Black-Scholes formula, deriving the value of volatility given the market price of the option contract.
            </div>
          </div>
        </div>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
      </div>
      <Footer/>
    </>
  );
}

export default Home;
