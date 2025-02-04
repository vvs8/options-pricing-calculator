import React, { useState } from 'react'
import { showError } from '../../components/ops/error';
import { validatorIV } from '../../components/ops/validator';
import { impliedVolatilityCall, impliedVolatilityPut } from '../../f/bs';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import dayjs from 'dayjs'
var utc = require('dayjs/plugin/utc')
dayjs.extend(utc)
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
const mathjs = require('mathjs')
import Footer from '../../components/Footer';
import { IoIosArrowDropdown, IoIosArrowDropup } from 'react-icons/io';

import styles from '../../components/css/Options.module.css'
import styles1 from '../../components/css/Price.module.css'



const IV = () => {
    const [values, setValues] = useState({
        stock: 0,
        strike: 0,
        om: 0,
        i: "0",
        div: 0,
        type: "c",
        ytm: 0,
    });

    const [res, setRes] = useState("- - -")
  
    const [error, setError] = useState(false)

    const [changedFlag, setChangeFlag] = useState(false)

    const [ytmtype, setYTMType] = useState('d');

    function resetFlags() {
        setChangeFlag(false)
        setError(false)
    }

    function resetAll() {
        setRes("- - -")
        setValues({stock: 0, strike: 0, om: 0, i: "0", div: 0, type: "c", ytm: 0})
        resetFlags()
    }

    function throwError(err) {
        setChangeFlag(false)
        setRes("Error")
        setError(err)
    }

    function calculate(o, om, s, k, T, R, D) {
        switch (o) {
            case "c":
                let call = impliedVolatilityCall(om, s, k, T, R, D)*100
                return call
            case "p":
                let put = impliedVolatilityPut(om, s, k, T, R, D)*100
                return put
        }
    }

    const getYTM = (value, t) => {
        value = parseFloat(value)
        switch (t) {
            case "d":
                return value
            case "h":
                return value/24
            case "w":
                return value*7
            case "ytm":
                return value*365
        }
    }

    const initT = () => {
        return getYTM(values.ytm, ytmtype)
    }

    function handleSubmit(e) {
        e.preventDefault()
        submit()
    }

    function submit() {
        try {
            let T = initT()
            let v = validatorIV({type: values.type, om: values.om, stock: values.stock, strike: values.strike, ytm: T/365, i: values.i, div: values.div})
            if(v.valid) {
                resetFlags()
                let stock = parseFloat(values.stock)
                let om = parseFloat(values.om)
                let strike = parseFloat(values.strike)
                let i = parseFloat(values.i)
                let div = parseFloat(values.div)
                let iv = calculate(values.type, om, stock, strike, T, i, div)
                if (!isNaN(iv)) setRes(iv)
                else throwError(["Some of your inputs are invalid", "Please check your inputs"])
                return
            }
            else {
                throwError(v.error)
                return
            }
        } catch (error) {
            throwError(["Some of your inputs are invalid", "Please check your inputs"])
        }
    }

    function resetType(e) {
        setValues({...values, type: e.target.value})
    }

    function resetYTMType(e) {
        setYTMType(e.target.value)
    }

    const handleChange = (e, t) => {
        setChangeFlag(true)
        setRes("- - -")
        switch (t) {
            case "stock":
                setValues({...values, stock: e.target.value})
                break;
            case "strike":
                setValues({...values, strike: e.target.value})
                break;
            case "om":
                setValues({...values, om: e.target.value})
                break;
            case "i":
                setValues({...values, i: e.target.value})
                break;
            case "div":
                setValues({...values, div: e.target.value})
                break;
            case "ytm":
                setValues({...values, ytm: e.target.value})
                break;
        }
    }

    const [divFlag, setDivflag] = useState(false)
    function resetDiv() {
        setDivflag(!divFlag)
        setValues({...values, div: 0})
    }

    const createBlogForm = () => {
        return (
            <>
                <form onSubmit={handleSubmit} >
                    <div className={styles1.form} >
                        <br/>
                        <div className={styles1.topbox}>
                            <div className={styles1.column}>
                                <label className={styles.label}>Stock Price:</label>
                                <TextField className={styles.text} rows={1}  id="stock" value={values.stock} 
                                    onChange={e=>handleChange(e, 'stock')}
                                    InputProps={{startAdornment: <InputAdornment position="start">$</InputAdornment>}}
                                />
                            </div>
                            <span style={{width: "37.3px"}}></span>
                            <div className={styles1.topboext}>
                                <div className={styles1.column}>
                                    <label className={styles.label}>Risk-Free Rate:</label>
                                    <TextField className={styles.text} rows={1}  id="i" value={values.i} 
                                        onChange={e=>handleChange(e, 'i')} error={false} 
                                        InputProps={{startAdornment: <InputAdornment position="start">r</InputAdornment>, endAdornment: <InputAdornment position="start">%</InputAdornment>}}
                                    />
                                </div>
                                <div className={styles.divset}>
                                {(divFlag) ? <a onClick={()=>resetDiv()}  className={styles.stockseta}>Remove Dividend <div className={styles.stockseta2}> <IoIosArrowDropup/></div></a> : <a onClick={()=>resetDiv()} className={styles.stockseta}>Add Dividend Yield<div className={styles.stockseta2}> <IoIosArrowDropdown/></div></a>}
                                </div>
                                {divFlag && (
                                    <div className={styles1.columndiv}>
                                        <label className={styles.label}>Dividend Yield:</label>
                                        <TextField className={styles.text} rows={1} id="div" value={values.div}
                                            onChange={e=>handleChange(e, 'div')} error={false} 
                                            InputProps={{startAdornment: <InputAdornment position="start">d</InputAdornment>, endAdornment: <InputAdornment position="start">%</InputAdornment>}}
                                        /> 
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={styles1.bottombox}>
                            <div className={styles.columnholder}>
                                <div className={styles.column}>
                                    <div className={styles.radio}>
                                        <Select
                                            className={styles.selector}
                                            id="type" 
                                            sx={{fontWeight: 600, color: "rgb(248, 248, 248)"}}
                                            value={values.type}
                                            onChange={(e)=>resetType(e)}
                                        >
                                            <MenuItem value={"c"}>Call </MenuItem>
                                            <MenuItem value={"p"}>Put</MenuItem>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <br/>
                            <div className={styles1.columnholder}>
                                <div className={styles1.column}>
                                    <label className={styles.label}>Time to Expiry:</label>
                                    <TextField className={styles1.text} id="ytm" placeholder="Time" value={values.ytm} 
                                        onChange={e=>handleChange(e, 'ytm')} 
                                    /> 
                                </div>
                                <div className={styles1.radio}>
                                    <Select
                                        className={styles1.selector}
                                        id="ytmtype" 
                                        value={ytmtype}
                                        onChange={(e)=>resetYTMType(e)}
                                    >
                                        <MenuItem value={"d"}>Days</MenuItem>
                                        <MenuItem value={"h"}>Hours</MenuItem>
                                        <MenuItem value={"w"}>Weeks</MenuItem>
                                        <MenuItem value={"ytm"}>Ytm</MenuItem>
                                    </Select>
                                </div>
                            </div>
                            <br/>
                            <div className={styles1.columnholder}>
                                <div className={styles1.column}>
                                    <div>
                                        <label className={styles.label}>Strike Price:</label>
                                        <TextField className={styles.text} rows={1}  id="strike"value={values.strike} 
                                            onChange={e=>handleChange(e, 'strike')} 
                                            InputProps={{startAdornment: <InputAdornment position="start">$</InputAdornment>}}
                                        />
                                    </div>
                                </div>
                                <span style={{width: "37.3px"}}></span>
                                <div className={styles1.column}>
                                    <div>
                                        <label className={styles.label}>Option Price:</label>
                                        <TextField className={styles.text} rows={1}  id="om" value={values.om} 
                                            onChange={e=>handleChange(e, 'om')}
                                            InputProps={{startAdornment: <InputAdornment position="start">$</InputAdornment>}}
                                        />
                                    </div>
                                </div>
                            </div>
                            <br/>
                        </div>
                    </div>
                    <br/>
                    <div className={styles1.button_cont}>
                        <div className={styles1.resultboxiv}>
                            <div className={styles1.resultboxivmin}>Result:</div><div className={styles1.resultboxivres}>{(res >= 0) ? (<b>{mathjs.round(res, 3)}%</b>) : <b>{res}</b>}</div>
                        </div>
                        <button type="submit" className={!changedFlag ? styles1.request_button : styles1.request_button_changed}>
                            Calculate
                        </button>
                    </div>
                    <div className={styles1.resetbuttonbox}>
                        <a onClick={()=>resetAll()} className={styles1.resetbutton} >Reset</a>
                    </div>
                    <br/>
                </form>
            </>
        );
    };

    return (
        <>
            <div className={styles1.main}>
                <div className={styles1.submain}>
                    <div className={styles1.title}>Implied Volatility Calculator</div>
                    <div className={styles1.desc}>
                        This calculator derives a theoretical IV value by back-solving the <u>Black-Scholes formula</u> for the value of volatility given the market price of the option contract. 
                        <br/>
                    </div>
                    <hr/>
                    <br/>
                    <br/>
                    <div className={styles1.flexdork}>
                        {createBlogForm()}
                        {error && showError(error)}
                    </div>
                </div>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
            </div>
            <br/>
                <br/>
                <br/>
                <br/>
                <br/>
            <Footer/>
        </>
    );
};




    

export default IV;