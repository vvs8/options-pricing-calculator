import React from 'react';
import Link from 'next/link'


import styles from './css/Footer.module.css'

const Footer = () => {
  return (
    <footer className={styles.main}>
      <div >
        <h4 className={styles.title}>Ultimate Options Calculator © 2025</h4>
        <br/>
        <div className={styles.lowerflex}>
          <small className={styles.link}>
            <Link href='/info/termsandconditions' className={styles.link}> 
              <div>
                Terms and Conditions
              </div>
            </Link>
          </small>
        </div>
        <br/>
      </div>
      <div className={styles.smallinfo}>
        Disclaimer: The information and calculations provided by this website are not financial, investment, professional, or any other form of advice. 
        While we strive to ensure the accuracy of the information and calculations, we do not provide any express or implied guarantee or warranty regarding its accuracy. 
        We do not accept any liability for errors or omissions.
      </div>
      <br/>
      <br/>
      <br/>
    </footer>
  );
}

export default Footer;