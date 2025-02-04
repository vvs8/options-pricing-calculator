import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

import {RiArrowUpSLine, RiArrowDownSLine} from 'react-icons/ri';


import styles from '../../components/css/Strategies.module.css'

const Strategies = ({handler}) => {

    const [drFlag, setDropflag] = useState(false)
    const wrapperRef = useRef(null);
 
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) 
                setDropflag(false)
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);
      
    const StrategiesList = () => {
        if (drFlag) return (
            <div className={styles.maincont}>
                <div className={styles.cont}>
                    <label className={styles.label}>Bullish:</label>
                    <Link onClick={()=>{setDropflag(false); handler()}} href="/strategies/longcall" >
                        <li className={styles.selection}>Long Call</li>
                    </Link>
                    <Link onClick={()=>{setDropflag(false); handler()}} href="/strategies/shortput" >
                        <li className={styles.selection}>Short Put</li>
                    </Link>
                    <Link onClick={()=>{setDropflag(false); handler()}} href="/strategies/bullcs" >
                        <li className={styles.selection}>Bull Call Spread</li>
                    </Link>
                    <Link onClick={()=>{setDropflag(false); handler()}} href="/strategies/bullps" >
                        <li className={styles.selection}>Bull Put Spread</li>
                    </Link>
                </div>
                <div className={styles.cont}>
                    <label className={styles.label}>Bearish:</label>
                    <Link onClick={()=>{setDropflag(false); handler()}} href="/strategies/longput" >
                        <li className={styles.selection}>Long Put</li>
                    </Link>
                    <Link onClick={()=>{setDropflag(false); handler()}} href="/strategies/shortcall" >
                        <li className={styles.selection}>Short Call</li>
                    </Link>
                    <Link onClick={()=>{setDropflag(false); handler()}} href="/strategies/bearcs" >
                        <li className={styles.selection}>Bear Call Spread</li>
                    </Link>
                    <Link onClick={()=>{setDropflag(false); handler()}} href="/strategies/bearps" >
                        <li className={styles.selection}>Bear Put Spread</li>
                    </Link>
                </div>
                <div className={styles.cont}>
                    <label className={styles.label}>Neutral:</label>
                    <Link onClick={()=>{setDropflag(false); handler()}} href="/strategies/butterfly" >
                        <li className={styles.selection}>Butterfly</li>
                    </Link>
                    <Link onClick={()=>{setDropflag(false); handler()}} href="/strategies/collar" >
                        <li className={styles.selection}>Collar</li>
                    </Link>
                    <Link onClick={()=>{setDropflag(false); handler()}} href="/strategies/ic" >
                        <li className={styles.selection}>Iron Condor</li>
                    </Link>
                    <Link onClick={()=>{setDropflag(false); handler()}} href="/strategies/straddle" >
                        <li className={styles.selection}>Straddle</li>
                    </Link>
                    <Link onClick={()=>{setDropflag(false); handler()}} href="/strategies/strangle" >
                        <li className={styles.selection}>Strangle</li>
                    </Link>
                </div> 
            </div>
        )
        else return null;
    }
    
    return (
        <>
            <div ref={wrapperRef}>
                <a onClick={()=>setDropflag(!drFlag)} className={styles.stockseta}>Strategies <div className={styles.stockseta2}>{(drFlag) ? (<RiArrowUpSLine/>) : (<RiArrowDownSLine/>)}</div></a> 
                {StrategiesList()}
            </div>
        </>
    );
};



export default Strategies;