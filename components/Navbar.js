import React, {useState} from 'react'
import Image from 'next/image';
import Link from 'next/link'
import { useRouter } from 'next/router'
import Strategies from './ops/Strategies';
import {IoMdClose, IoMdShuffle} from 'react-icons/io'
import {AiOutlineMenu } from 'react-icons/ai'
import {BsFillJournalBookmarkFill, BsCalculator, BsLightningCharge, BsCurrencyDollar} from 'react-icons/bs'


import styles from './css/Navbar.module.css'



const Navbar = () => {
    
    const router = useRouter()

    const isActive = (path) => {
        var m = router.pathname.split('/')[2]
        var n = router.pathname.split('/')[1]
        if (m === path) return true; 
        else if (n === path) return true; 
    }

    const MobileMenu = () => {
        const [click, setClick] = useState(false)

        const handleClick = () => {
            setClick(!click)
            if (!click) document.body.classList.add(styles.scrollblock);
            else document.body.classList.remove(styles.scrollblock);
        } 
        return (
            <>
            <div className={styles.hamb} onClick={handleClick}>
                    {click ? <IoMdClose color="white"/> : <AiOutlineMenu color="white"/>}
            </div>
            <div className={`${styles.mnav_menu} ${click ? styles.mnav_menu_active : ''}`} >
                <ul>
                    <li className={styles.mnav_item}>
                        
                    </li>
                    <li className={styles.mnav_item}>
                        <Link onClick={handleClick} href='/calculators/optionprofit' style={{ textDecoration: 'none' }}>
                            <div className={!(isActive("optionprofit")) ? styles.mnav_links : styles.mnav_links_a} >
                                <BsCurrencyDollar className={styles.mfa_typo4}/>
                                Option Profit
                            </div>
                        </Link>
                    </li>
                    <li className={styles.mnav_item}>
                        <div className={!(isActive("strategies")) ? styles.mnav_links : styles.mnav_links_a}>
                            <IoMdShuffle className={styles.mfa_typo4}/>
                            <Strategies handler={handleClick}/>
                        </div>
                    </li>
                    <li className={styles.mnav_item}>
                        <Link onClick={handleClick} href='/calculators/optionprice' style={{ textDecoration: 'none' }}>
                            <div className={!(isActive("optionprice")) ? styles.mnav_links : styles.mnav_links_a} style={isActive("services")}>
                                <BsCalculator className={styles.mfa_typo4}/>
                                Price and Greeks
                            </div>
                        </Link>
                    </li>
                    <li className={styles.mnav_item}>
                        <Link href='/calculators/iv' style={{ textDecoration: 'none' }} onClick={handleClick}>
                            <div className={!(isActive("iv")) ? styles.mnav_links : styles.mnav_links_a} style={isActive("services")}>
                                <BsLightningCharge  className={styles.mfa_typo4}/>
                                Implied Volatility
                            </div>
                        </Link>
                    </li>
                    <br/>
                    <br/>
                    <br/>
                    <br/>
                    <br/>
                    <br/>
                    <br/>
                </ul>
            </div>  
            </>   
        )
    }

    const handleClickLogo = () => {
        document.body.classList.remove(styles.scrollblock);
    } 
 
    return (
        <>   
        <nav className={styles.mainnav}>
            <div className={styles.navbar_container}>
                <div className={styles.navbar_logo}>
                    <Link href="/" style={{ textDecoration: 'none' }} onClick={handleClickLogo}>
                        <div className={styles.navbar_image}>
                            <Image
                                src="/metalogonav.png"
                                fill={true}
                                alt="Logo"
                            />
                        </div>
                        <div className={!(isActive(undefined)) ? styles.logodiv : styles.logodiv_a}>
                      
                        </div>
                    </Link>
                </div>
                <ul className={styles.nav_menu}>
                    <li className={styles.nav_item}>
                        <Link href='/calculators/optionprofit' style={{ textDecoration: 'none' }}>
                            <div className={!(isActive("optionprofit")) ? styles.nav_links : styles.nav_links_a}>
                            <BsCurrencyDollar className={styles.fa_typo4}/>
                                Option Profit
                            </div>
                        </Link>
                    </li>
                </ul>
                <ul className={styles.nav_menu}>
                    <li className={styles.nav_item}>
                        <div className={!(isActive("strategies")) ? styles.nav_links : styles.nav_links_a}>
                            <IoMdShuffle className={styles.fa_typo4}/>
                            <Strategies handler={()=>null}/>
                            &#160;&#160;
                        </div>
                    </li>
                </ul>
                <ul className={styles.nav_menu}>
                    <li className={styles.nav_item}>
                        <Link href='/calculators/optionprice' style={{ textDecoration: 'none' }}>
                            <div className={!(isActive("optionprice")) ? styles.nav_links : styles.nav_links_a}>
                                <BsCalculator className={styles.fa_typo4}/>
                                Price and Greeks
                            </div>
                        </Link>
                    </li>
                </ul>
                <ul className={styles.nav_menu}>
                    <li className={styles.nav_item}>
                        <Link href='/calculators/iv' style={{ textDecoration: 'none' }}>
                            <div className={!(isActive("iv")) ? styles.nav_links : styles.nav_links_a}>
                                <BsLightningCharge className={styles.fa_typo4}/>
                                Implied Volatility
                            </div>
                        </Link>
                    </li>
                </ul>
            </div>
            <MobileMenu/>
        </nav>
        </>
    )
}

export default Navbar;