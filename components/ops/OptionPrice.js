import React, { useEffect, useState, useContext } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { PriceContext } from '../state/PriceContext'
import {call, put, callDataset, callTimeDataset, callVDataset, putDataset, putTimeDataset, putVDataset} from '../../formulas/formulas'
import { convertYtm } from '../../components/ops/support';
import LineChart from '../../components/charts/LineChart';
import { showError } from '../../components/ops/error';
import { validatorPrice } from '../../components/ops/validator';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import dayjs from 'dayjs'
var utc = require('dayjs/plugin/utc')
dayjs.extend(utc)
import Slider from '@mui/material/Slider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
const mathjs = require('mathjs')
import Footer from '../../components/Footer';
import { IoIosArrowDropdown, IoIosArrowDropup, IoIosArrowBack, } from 'react-icons/io';

import styles from '../../components/css/Options.module.css'
import styles1 from '../../components/css/Price.module.css'



const OptionPrice = () => {
    const router = useRouter()
    const { values, setValues } = useContext(PriceContext);

    const [backbutton, setBackButton] = useState(false)

    useEffect(() => {
        const isEmpty = Object.keys(router.query).length === 0;
        if(!isEmpty) {
            setBackButton(true)
            let res = router.query
            handleSubmit1({stock: res.stock, strike: res.strike, i: res.i, iv: res.iv, div: res.div, type: res.type, ytm: res.ytm, ytmtype: "ytm"})
            setValues({stock: res.stock, strike: res.strike, i: res.i, iv: res.iv, div: res.div, type: res.type, ytm: res.ytm, ytmtype: "ytm"})
        }
    }, [])

    const [res, setRes] = useState("- - -")
    const [df, setDf] = useState([])
    const [dfT, setDfT] = useState([])
    const [dfv, setDfv] = useState([])

    const [pvalues, setPvalues] = useState(null);
    const [step, setStep] = useState(null)
    const [error, setError] = useState(false)

    const [changedFlag, setChangeFlag] = useState(false)

    function resetFlags() {
        setChangeFlag(false)
        setError(false)
    }

    function resetAll() {
        setRes("- - -")
        setValues({stock: 0, strike: 0, iv: 0, i: 0, div: 0, type: "c", ytm: 0, ytmtype: "d"})
        resetFlags()
    }

    function throwError(err) {
        setChangeFlag(false)
        setRes("Error")
        setError(err)
    }

    function calculate(o, s, k, T, R, V, D) {
        switch (o) {
            case "c":
                let c = call(s, k, T, R, V, D)
                setRes(c);
                let df = callDataset(s, k, T, R, V, D)
                setDf(df)
                let dfT = callTimeDataset(s, k, T, R, V, D)
                setDfT(dfT)
                let dfv = callVDataset(s, k, T, R, V, D)
                setDfv(dfv)
                break;
            case "p":
                let p = put(s, k, T, R, V, D)
                setRes(p);
                let dfp = putDataset(s, k, T, R, V, D)
                setDf(dfp)
                let dfTp = putTimeDataset(s, k, T, R, V, D)
                setDfT(dfTp)
                let dfvp = putVDataset(s, k, T, R, V, D)
                setDfv(dfvp)
                break;
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

    const initT = (values) => getYTM(values.ytm, values.ytmtype)

    const initStep = (T) => {
        let c = 0.25
        if(T>365) c = 14
        else if(T>120) c = 7
        else if(T>90) c = 5
        else if(T>60) c = 3
        else if(T>30) c = 2
        else if(T>20) c = 1
        else if(T>10) c = 0.5
        else if(T>5) c = 0.25
        else c = 0.125
        return c
    }

    function handleSubmit1(values) {
        submit(values)
    }

    function handleSubmit(e) {
        e.preventDefault()
        setSliderValue1(0)
        setSliderValue2(0)
        setSliderValue3(0)
        submit(values)
    }

    function submit(values) {
        try {
            let T = initT(values)
            let v = validatorPrice({type: values.type, stock: values.stock, strike: values.strike, ytm: T/365, i: values.i, iv: values.iv, div: values.div})
            if(v.valid) {
                resetFlags()
                let stock = parseFloat(values.stock)
                let strike = parseFloat(values.strike)
                let iv = parseFloat(values.iv)
                let i = parseFloat(values.i)
                let div = parseFloat(values.div)
                setTimeind(T)
                let step = initStep(T)
                setStep(step)
                setStockind(values.stock)
                setIVind(values.iv)
                setPvalues({type: values.type, stock: stock, strike: strike, t: T, i: i, iv: iv, div: div})
                calculate(values.type, stock, strike, T, i, iv, div)
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
        setChangeFlag(true)
        setValues({...values, type: e.target.value})
    }

    function resetYTMType(e) {
        setChangeFlag(true)
        setValues({...values, ytmtype: e.target.value})
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
            case "i":
                setValues({...values, i: e.target.value})
                break;
            case "div":
                setValues({...values, div: e.target.value})
                break;
            case "iv":
                setValues({...values, iv: e.target.value})
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
                <form onSubmit={handleSubmit}>
                    <div className={styles1.form}>
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
                                        <label className={styles.label}>Dividend Yield</label>
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
                                            value={values.type}
                                            onChange={(e)=>resetType(e)}
                                            sx={{fontWeight: 600, color: "rgb(248, 248, 248)"}}
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
                                        value={values.ytmtype}
                                        onChange={(e)=>resetYTMType(e)}
                                    >
                                        <MenuItem value={"d"}>Days</MenuItem>
                                        <MenuItem value={"h"}>Hours</MenuItem>
                                        <MenuItem value={"w"}>Weeks</MenuItem>
                                        <MenuItem value={"ytm"}>YTM</MenuItem>
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
                                        <label className={styles.label}>Volatility:</label>
                                        <TextField className={styles.text} rows={1}  id="iv" value={values.iv} 
                                            onChange={e=>handleChange(e, 'iv')}
                                            InputProps={{endAdornment: <InputAdornment position="end">%</InputAdornment>}}
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
                            <div className={styles1.resultboxivmin}>Result:</div><div className={styles1.resultboxivres}>{(res >= 0) ? (<b>${mathjs.round(res, 3)}</b>) : <b>{res}</b>}</div>
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

    const [timeind, setTimeind] = useState(null)
    const [stockind, setStockind] = useState(null)
    const [ivind, setIVind] = useState(null)

    function handleResubmit(e) {
        let res = (e.target.value)
        setSliderValue1(res)
        let T = pvalues.t - res 
        setTimeind(T)
        calculate(pvalues.type, stockind, pvalues.strike, T, pvalues.i, ivind, pvalues.div)
    }

    function handleStockResubmit(e) {
        let res = (e.target.value)
        setSliderValue2(res)
        let s =  pvalues.stock*(1+(res/100))
        setStockind(s)
        calculate(pvalues.type, s, pvalues.strike, timeind, pvalues.i, ivind, pvalues.div)
    }

    function handleVResubmit(e) {
        let res = (e.target.value)
        setSliderValue3(res)
        let s =  pvalues.iv*(1+(res/100))
        setIVind(s)
        calculate(pvalues.type, stockind, pvalues.strike, timeind, pvalues.i, s, pvalues.div)
    }

    const [slidervalue1, setSliderValue1] = useState(0)
    const [slidervalue2, setSliderValue2] = useState(0)
    const [slidervalue3, setSliderValue3] = useState(0)

    return (
        <>
            <div className={styles1.main}>
                <div className={styles1.submain}>
                {backbutton && (<Link href='/calculators/optionprofit' >
                    <>
                    <br/>
                    <div className={styles1.backbutton}>
                        <IoIosArrowBack/> <div className={styles1.backbuttontext}>Back</div>
                    </div>
                   
                    </>
                </Link>)}
                <div className={styles1.title}>Option Price and Greeks Calculator</div>
                <div className={styles1.desc}>
                    This calculator derives theoretical option prices and greeks using the <u>Black-Scholes formula</u>. You can customize and adjust the inputs to see the change in the underlying parameters. 
                    <br/>
                </div>
                <hr/>
                <br/>
                <br/>
                <div className={styles1.mainflex}>
                <div >
                    {createBlogForm()}
                    {error && showError(error)}
                </div>
                {(res >= 0) && (
                    <div className={styles1.resultcontainer}>
                        <div className={styles1.resultbox}>
                            <div>
                                Option Price: <span style={{color:"#7FFFD4"}}> ${mathjs.round(res, 2)}</span>
                            </div>
                            <div className={styles1.resultboxgreeks}>
                                <div className={styles1.resultboxgreek}>Δ {mathjs.round(df.curdelta, 3)}</div>
                                <div className={styles1.resultboxgreek}>Γ {mathjs.round(df.curgamma, 3)}</div>
                                <div className={styles1.resultboxgreek}>v {mathjs.round(df.curvega, 3)}</div>
                                <div className={styles1.resultboxgreek}>Θ {mathjs.round(df.curtheta, 3)}</div>
                            </div>
                        </div>
                        <div className={styles1.chart}>
                            <LineChart props={df} props1={dfT} propsv={dfv}/>
                        </div> 
                        <br/>
                        <div className={styles1.slidercont}>
                            <div className={styles1.tslider}>
                                <div className={styles1.tindcont}>
                                    <label className={styles1.chlabel}>Time to Expiry</label>
                                    <b>{convertYtm(timeind)}</b>
                                </div>
                                <Slider
                                    defaultValue={0}
                                    value={slidervalue1}
                                    step={step}
                                    marks
                                    min={0}
                                    max={pvalues.t-0.125}
                                    onChange={handleResubmit}
                                    style={{color:"white"}}
                                />
                                <div className={styles1.tsliderbottom}>
                                    <div className={styles1.tsliderside}>Current</div>
                                    <div className={styles1.tsliderside}>Expiry</div>
                                </div>
                            </div>
                            <div className={styles1.tslider}>
                                <div className={styles1.tindcont}>
                                    <label className={styles1.chlabel}>Stock Price</label>
                                    <b>${mathjs.round(stockind, 2)}</b>
                                </div>
                                <Slider
                                    defaultValue={0}
                                    value={slidervalue2}
                                    step={0.5}
                                    marks
                                    min={-20}
                                    max={20}
                                    onChange={handleStockResubmit}
                                    style={{color:"white"}}
                                />
                                <div className={styles1.tsliderbottom}>
                                    <div className={styles1.tsliderside}>-20%</div>
                                    <div className={styles.tsliderside}>&nbsp; &nbsp;0%</div>
                                    <div className={styles1.tsliderside}>+20%</div>
                                </div>
                            </div>
                            <div className={styles1.tslider}>
                                <div className={styles1.tindcont}>
                                    <label className={styles1.chlabel}>Volatility</label>
                                    <b>{mathjs.round(ivind, 2)}%</b>
                                </div>
                                <Slider
                                    defaultValue={0}
                                    value={slidervalue3}
                                    step={1}
                                    marks
                                    min={-100}
                                    max={100}
                                    onChange={handleVResubmit}
                                    style={{color:"white"}}
                                />
                                <div className={styles1.tsliderbottom}>
                                    <div className={styles1.tsliderside}>-100%</div>
                                    <div className={styles.tsliderside}>&nbsp; &nbsp;0%</div>
                                    <div className={styles1.tsliderside}>+100%</div>
                                </div>
                            </div>
                        </div>
                        {changedFlag && (
                        <div className={styles.overlay} style={{marginInline: "17px"}}>
                            <div className={styles.overlaycontent}>
                                <p>Inputs changed</p>
                                <a className={styles.overlaylink} onClick={(e)=>handleSubmit(e)}>Recalculate</a>
                            </div>
                        </div>)}
                    </div> 
                )}
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
};   

export default OptionPrice;