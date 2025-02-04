import React from 'react'
import Navbar from './Navbar';
import { ProfitProvider } from './state/ProfitContext';
import { PriceProvider } from './state/PriceContext';

import styles from './css/Layout.module.css'

const Layout = ({ children }) => {
    
    return (
        <>
            <div className={styles.main}>
                <div className={styles.sub}>
                <Navbar />
                <ProfitProvider>
                    <PriceProvider>
                        {children}
                    </PriceProvider>
                </ProfitProvider>
                </div>
            </div>
        </>
    );
};

export default Layout;