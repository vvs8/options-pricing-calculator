import React, { useRef, useState, useEffect, useContext } from 'react'
import { ProfitContext } from '../state/ProfitContext';
import { getTimeline, getStrategy, initPrange, initPriceRange, opdate, finalMatrix, maxRisk, convertYtm} from '../../components/ops/support';
import { calculateCall, calculatePut } from '../../actions/calculator';
import Option from '../../components/ops/Option';
import OptionChart from '../charts/OptionsChart';
import { showError } from './error';
import { getStrategyInfos, getInfos } from './infos'
import Footer from '../../components/Footer';
import Loading from '../system/Loading';
import { validatorStock, validatorOption, validatorDatez, validatorPriceRange } from './validator';
import dayjs from 'dayjs'
var utc = require('dayjs/plugin/utc')
dayjs.extend(utc)
var minMax = require('dayjs/plugin/minMax')
dayjs.extend(minMax)
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';
import { Tooltip1 } from './tooltips';
import InputAdornment from '@mui/material/InputAdornment';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
const mathjs = require('mathjs')
import {IoMdCloseCircle, IoMdAdd, IoIosSettings, IoMdSettings, IoIosArrowBack, IoIosArrowForward, IoIosArrowDropdown, IoIosArrowDropup, IoMdInformationCircleOutline } from 'react-icons/io';
import { MdChangeHistory, MdOutlineKeyboardArrowDown, MdOutlineKeyboardArrowUp } from 'react-icons/md';
import { VscGraphLine } from 'react-icons/vsc';

import styles from '../../components/css/Options.module.css'


const Profit = ({strategy}) => {
 
    const { values, options, timedisplay, stockFlag, setStockflag, setValues, setOptions, setTimeDisplay } = useContext(ProfitContext);
   
    const [strategytitle, setSrategyTitle] = useState({title: '', type: 0})
    const [error, setError] = useState(false)

    useEffect(() => {
        if(strategy) {
            let stg = getStrategy(strategy)
            setOptions(stg.options)
            if(stg.stock) { 
                setStockflag(stg.stock.stockflag)
                setValues({...values, stock: stg.stock.price, stockP: stg.stock.priceP, shares: stg.stock.qty})
            }
            setSrategyTitle({title: stg.title, type: stg.type})
        }
    }, [])

    const [res, setRes] = useState([])
    const [periods, setPeriods] = useState([])
    const [stockdata, setStockData] = useState([])
    const [finalmatrix, setFinalmatrix] = useState([])
    const [maxrisk, setMaxRisk] = useState()
    const [prange, setPrange] = useState([])
    const [tmrange, setTmrange] = useState([])

    const [changedFlag, setChangeFlag] = useState(false)
    const [loadingFlag, setLoadingFlag] = useState(false)

    async function calculate(o, om, op, s, k, T, R, D, range, id, qty, action, iv, ivauto, timedisplay) {
        switch (o) {
            case "c":
                let call = await calculateCall({o, om, op, s, k, T, R, D, range, id, qty, action, iv, ivauto, timedisplay})
                return call;
            case "p":
                let put= await calculatePut({o, om, op, s, k, T, R, D, range, id, qty, action, iv, ivauto, timedisplay})
                return put;
        }
    }

    function resetFlags() {
        setChangeFlag(false)
        setError(false)
        setMapDisplay('p')
    }

    function resetAll() {
        setRes([])
        setFinalmatrix([])
        setStockData([])
        setPeriods([])
        setPrange([])
        setTmrange([])
        resetFlags()
        setLoadingFlag(false)
    }

    function throwError(err) {
        resetAll()
        setError(err)
    }

    function lastDate(n) {
        setValues({...values, date: n})
    }

    function lastTime(n) {
        setValues({...values, time: n})
    }

    const disableWeekends = (date) => date.day() === 0 || date.day() === 6;

    function initLastDate() {
        let timeh = values.time.format('HH')
        let timem = values.time.format('mm')
        let inp = dayjs.utc(values.date).set('hour', timeh).set('minute', timem).set('second', 0)
        return inp
    }

    function initDdate() {
        let days = []
        for (var i = 0; i <options.length; i++) {
            let date = options[i].date
            days.push(date)
        }
        return dayjs.min(days);
    }

    async function submit(lastdate, d, range, sub, ivadj) {
        try {
            let vy = validatorDatez(lastdate, d, options)
            let v = validatorStock(values)
            let vo = validatorOption(options)
            if(([vy.valid, v.valid, vo.valid]).every(Boolean)) {
                resetFlags()
                let div = values.div ? parseFloat(values.div) : 0
                let stock = mathjs.round(parseFloat(values.stock), 2)
                let stockP = values.stockP ? mathjs.round(parseFloat(values.stockP), 2) : 0
                let shares = values.shares ? parseInt(values.shares) : 0
                let A = []
                let Op = []
                for (var i = 0; i<options.length; i++) {
                    let o = options[i]
                    let ivauto = o.ivauto
                    if(!sub) ivauto = false
                    let rtn = await calculate(o.type, parseFloat(o.om), parseFloat(o.op), stock, parseFloat(o.strike), {s: lastdate, e: o.date, d: d}, parseFloat(values.i), div, range, o.id, parseInt(o.qty), o.action, parseFloat(o.iv*(1+ivadj)), ivauto, timedisplay)
                    if (!rtn) {
                        throwError(["Some of your inputs are invalid, creating a calculation error (e.g. too high/small stock price, option price resulting in infinite IV)", "Please check your inputs"])
                        return
                    }
                    setPrange(rtn.prange)
                    setTmrange(rtn.timerange)
                    const nextA = {...o, iv: rtn.iv}
                    Op.push(nextA)
                    A.push(rtn)   
                }
                let stockobject = {stock: stock, stockP: stockP, shares: shares, action: values.action}
                setStockData(stockobject)
                const timeline = getTimeline(A)
                setPeriods(timeline)
                setRes(A)
                if(sub) setOptions(Op)
                let mtx = finalMatrix(A, stockobject)
                setFinalmatrix(mtx)
                if(sub) {
                    let obj = maxRisk(A, mtx, stockobject)
                    setMaxRisk(obj)
                }
                setLoadingFlag(false)
                return
            }
            else {
                let err = v.error.concat(vo.error, vy.error)
                throwError(err)
                return
            }
        } catch (error) {
            throwError(["Some of your inputs are invalid", "Please check your inputs"])
        }
    }

    function handleSubmit(e) {
        e.preventDefault();
        setLoadingFlag(true)
        let lastdate = initLastDate()
        let d = initDdate()
        let range = initPrange(values, options)
        submit(lastdate, d, range, true, 0)
    }


    function handleOptionChange(id, data) {
        setChangeFlag(true)
        const index = options.findIndex(e => e.id === id);
        if (index !== -1) {
            const nextA = [...options.slice(0, index), data, ...options.slice(index+1)];
            setOptions(nextA)
        }
        else {
            setOptions(pre=>[...pre, data])
        }
    }

    const handleChange = (e, t) => {
        setChangeFlag(true)
        switch (t) {
            case "stock":
                setValues({...values, stock: e.target.value})
                break;
            case "stockP":
                setValues({...values, stockP: e.target.value})
                break;
            case "i":
                setValues({...values, i: e.target.value})
                break;
            case "div":
                setValues({...values, div: e.target.value})
                break;
            case "shares":
                setValues({...values, shares: e.target.value})
                break;
        }
    }

    function handleChangeRadio(e) { 
        setChangeFlag(true)
        setValues({...values, action: e.target.value})
    }

    const resetStock = () => {
        setStockflag(!stockFlag)
        setValues({...values, shares: 0, stockP: values.stock})
    }

    function resetDiv() {
        setTimeDisplay("o")
        setValues({...values, div: 0, time: dayjs.utc().set('hour', 16).set('minute', 0).set('second', 0)})
    }

    const [settingFlag, setSettingflag] = useState(false)
    const additionalSettings = () => {
        return (
            <>
                <div className={`${styles.settingscont} ${settingFlag ? styles.settingsexpanded : ''}`}>
                    {!settingFlag && <div className={styles.setta}>
                        <div><a onClick={()=>setSettingflag(!settingFlag)}><IoIosSettings className={styles.settaicon}/></a></div>
                    </div>}
                    {settingFlag && <a onClick={()=>{setSettingflag(false)}}><IoMdCloseCircle className={styles.closebutt}/></a>}
                    {settingFlag &&
                    (<div className={styles.column}>
                        <br/>
                        <div>
                            <label className={styles.label}>Last Traded At <a className={styles.info} onClick={()=>getInfos("starttime")}><IoMdInformationCircleOutline/></a></label>
                            <LocalizationProvider dateAdapter={AdapterDayjs} >
                            <TimePicker 
                                className={styles.timefield}
                                value={values.time.format('YYYY-MM-DDTHH:mm:ss')}
                                onChange={lastTime}
                                renderInput={(params) => <TextField {...params} />}
                                minTime={dayjs().set('hour', 9).set('minute', 29)}
                                maxTime={dayjs().set('hour', 16).startOf('hour')}
                            />
                            </LocalizationProvider>
                        </div>
                        <br/>
                        <div>
                            <label className={styles.label}>Dividend Yield</label>
                            <TextField className={styles.text} rows={1}  id="div" name="div" placeholder="Dividend Yield" value={values.div} 
                                onChange={e=>handleChange(e, 'div')} error={false} 
                                InputProps={{startAdornment: <InputAdornment position="start">d</InputAdornment>, endAdornment: <InputAdornment position="start">%</InputAdornment>}}
                            /> 
                        </div>
                        <br/>
                        <label className={styles.label}>Display Time <a className={styles.info} onClick={()=>getInfos("displaytime")}><IoMdInformationCircleOutline/></a></label>
                        <div style={{marginTop: "1.2px"}}>
                            <select className ={styles.mapdisplayselect} value={timedisplay} onChange={(e)=> {setTimeDisplay(e.target.value); setChangeFlag(true)}} id="timedisplay">
                                <option value="o">Market Open</option>
                                <option value="c">Market Close</option>
                            </select>
                        </div>
                        <br/>
                        <div className={styles.tsliderbuttons}>
                            <a onClick={()=>resetDiv()} style={{cursor:"pointer"}}>Reset</a>
                        </div>
                    </div>)}
                </div>
            </>
        )
    }
    
    const createBlogForm = () => {
        return (
            <form onSubmit={handleSubmit}>
                <div className={styles.mainform}>
                    <div className={styles.topbox}>
                        <div className={styles.column}>
                            <div>
                                <label className={styles.labeltop}>Market Price:</label>
                                <TextField className={styles.text} rows={1}  id="stock" name="stock" placeholder="Stock Price" value={values.stock} 
                                    onChange={e=>handleChange(e, 'stock')}
                                    InputProps={{startAdornment: <InputAdornment position="start">$</InputAdornment>}}
                                />
                            </div>
                        </div>
                        <div className={styles.column}>
                            <label className={styles.labeltop}>Last Traded On: <a className={styles.info} onClick={()=>getInfos("startdate")}><IoMdInformationCircleOutline/></a></label>
                            <LocalizationProvider dateAdapter={AdapterDayjs} >
                                <DatePicker 
                                    className={styles.datefield}
                                    value={values.date}
                                    onChange={lastDate}
                                    shouldDisableDate={disableWeekends}
                                    renderInput={(params) => <TextField {...params} />}
                                />
                            </LocalizationProvider>  
                        </div>
                    </div>
                    <div className={styles.stockset}>
                    {(stockFlag) ? <a onClick={resetStock} className={styles.stockseta}><div className={styles.stockseta2}> <IoIosArrowDropup/></div>Remove Position</a> : <a onClick={resetStock} className={styles.stockseta}><div className={styles.stockseta2}> <IoIosArrowDropdown/></div>Add Stock Position</a>}
                    </div>
                    {stockFlag && (
                        <div className={styles.stockbox}>
                            <div className={styles.column}>
                                <label className={styles.labeltop}>Purchase Price: <a className={styles.info} onClick={()=>getInfos("stockP")}><IoMdInformationCircleOutline/></a></label>
                                <TextField className={styles.text} rows={1}  id="stockP" name="stockP" placeholder="Stock Price" value={values.stockP} 
                                    onChange={e=>handleChange(e, 'stockP')}
                                    InputProps={{startAdornment: <InputAdornment position="start">$</InputAdornment>}}
                                />
                            </div>
                            <div className={styles.columnshares}>
                                <label className={styles.labeltop}># of Shares:</label>
                                <div className={styles.sharesrow}>
                                    <div>
                                        <TextField className={styles.shares} rows={1}  id="shares" name="shares" value={values.shares}
                                            onChange={e=>handleChange(e, 'shares')} error={false} 
                                            InputProps={{startAdornment: <InputAdornment position="start">#</InputAdornment>}}
                                        />
                                    </div>
                                    <div className={styles.radioccstock}>
                                    <FormControl>
                                        <RadioGroup
                                            name="stockradio"
                                            value={values.action}
                                            onChange={handleChangeRadio}
                                        >
                                            <FormControlLabel value="long" control={<Radio sx={{'& .MuiSvgIcon-root': {fontSize: 17}, padding: 0, color: "black",'&.Mui-checked': {color: 'red'},}}/>} label={<span className={styles.topradioc}>Long</span>}  />
                                            <span style={{height: '3px'}}></span>
                                            <FormControlLabel value="short" control={<Radio sx={{'& .MuiSvgIcon-root': {fontSize: 17}, padding: 0, color: "black",'&.Mui-checked': {color: 'red'},}}/>} label={<span className={styles.topradioc}>Short</span>} />
                                        </RadioGroup>
                                    </FormControl>
                                </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <br/>
                    <div className={styles.topbox}>
                        <div className={styles.column}>
                            <label className={styles.labeltop}>Risk-Free Rate: <a className={styles.info} onClick={()=>getInfos("i")}><IoMdInformationCircleOutline/></a></label>
                            <TextField className={styles.text} rows={1}  id="i" name="i" placeholder="Interest Rate" value={values.i} 
                                onChange={e=>handleChange(e, 'i')} error={false} 
                                InputProps={{startAdornment: <InputAdornment position="start">r</InputAdornment>, endAdornment: <InputAdornment position="start">%</InputAdornment>}}
                            />
                        </div>
                        {additionalSettings()}
                    </div>
                </div>
                <div >
                    <button type="submit" className={!changedFlag ? styles.request_button : styles.request_button_changed}>
                        Calculate
                    </button>
                </div>
            </form>
        );
    };

    const weekday = (weekday) => {
        if(weekday != "Sat" && weekday != "Sun") 
            return true 
        else return false
    }

    function heatMap(value, stocknet, high, low) {
        let green = ["#ccffd9","#b3ffc6","#99ffb3","#80ff9f", "#4dff79", "#33ff66", "#1aff53", "#00ff40", "#00f73d"]
        let red = ["#ff0000", "#ff1a1a", "#ff3333", "#ff4d4d", "#ff8080", "#ff9999", "#ffb3b3", "#ffcccc", "#ffe6e6"]
        value = value*100+stocknet
        let x = mathjs.round(value) 
        low = low
        if(x>0){
            if (high < x) return {backgroundColor: "#00ff99", color: '#086100'}
            let norm = (value-0)/(high-0)
            let k = mathjs.round(Math.abs(norm)*8)
            return {backgroundColor: green[k], color: '#003700'}
        }
        if(x==0){
            return {backgroundColor: "rgb(255, 255, 255)", color: 'black'}
        }
        else {
            if (low+0.1 >= x) return {backgroundColor: "#cc0000", color: '#f26661'}
            let normred = Math.abs((value-low)/(0-low))
            let k = mathjs.round(Math.abs(normred)*8)
            return {backgroundColor: red[k], color: '#5a0000'}
        }
    }

    const [mapdisplay, setMapDisplay] = useState('p')
    function priceCvt(price, stocknet, premium, display){
        switch(display) {
            case 'p':
                let res = 100*price + stocknet
                if (Math.abs(res)>9999) return (res/1000).toFixed(1)+"k"
                return (res).toFixed(0)
            case 's':
                return mathjs.round(price+premium/100, 2)
            case 'c':
                return (mathjs.round((price*100+stocknet)/Math.abs(premium)*100, 2)).toFixed(0)+'%'
        }
    }

    const expiredMessage = (data) => {
        if(data == 'Expired') return (
            <Tooltip1
                title={
                <React.Fragment>
                    <p>{'Some of your options have expired.'}</p>
                </React.Fragment>
                }
            >
                <div>Expired<IoMdInformationCircleOutline/></div>
            </Tooltip1>
        )
        else return null  
    }

    const [ivadj, setIVadj] = useState(0)

    const Map = () => {
        const [dropdata, setDropData] = useState(false)
        const numFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
        function DropDown(data, stock, stocknet, premium) {
            if(dropdata)
                return (
                    <div className={styles.droptodown}>
                        <table style={{width: '100%', borderCollapse: 'collapse'}}>
                            <a onClick={()=>setDropData(false)}><IoMdCloseCircle className={styles.closebutt}/></a>
                            <thead>
                                <tr className={styles.dropdownrow}>
                                    <td style={{color: 'red'}}><b>{data.set[0].date} - ${stock}</b></td>
                                    <td>Price:&nbsp;</td>
                                    <td>Entry:&nbsp;</td>
                                    <td>Qty:&nbsp;</td>
                                    <td>Net:&nbsp;</td>
                                </tr>
                            </thead>
                            <tbody>
                                {(stockdata.shares>0) &&
                                <tr className={styles.dropdownrow}>
                                    <td>
                                        {weekday(data.set[0].weekday) && <div>{(stockdata.action === 'long') ? <p>Sell</p> : <p>Buy to Cover</p>}</div>}
                                        <b>Shares ({stockdata.action})</b>
                                    </td>
                                    <td>{stock}</td>
                                    <td>{stockdata.stockP}</td>
                                    <td>{stockdata.shares}</td>
                                    <td>{stocknet}</td>
                                </tr>}
                                {data.set.map((v, i) => (
                                    <tr className={styles.dropdownrow} key={i}>
                                        <td>
                                            {weekday(v.weekday) && <div>{(v.action === 'buy') ? <p>Sell</p> : <p>Buy to Close</p>}</div>}
                                            <div className={styles.dwsubline}>
                                                <b>{v.type} &nbsp;</b>
                                                <b>${v.strike} &nbsp;</b>
                                                <b>{v.expiry}</b>
                                            </div>
                                            <div>{v.message !== 'Expired' ? v.date : v.expiry}  ({convertYtm(mathjs.round(v.ytm, 3))} dtm)</div>
                                        </td>
                                        <td>{v.oprice.toFixed(2)}</td>
                                        <td>{(v.entry).toFixed(2)}</td>
                                        <td>{v.qty}</td>
                                        <td>{mathjs.round(v.net*100*v.qty)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <br/>
                            <tfoot>
                                <tr>
                                    <td>{maxrisk.maxrisk && <b>{(mathjs.round((data.net*100+stocknet)/Math.abs(premium)*100, 2))}%</b>}</td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td><b>{numFormat.format(data.net*100+stocknet)}</b></td>
                                </tr> 
                            </tfoot>
                        </table>
                    </div>
                )
            else return null
        }

        const [ivind, setIVind] = useState(0)
        const [ivchg, setIVchg] = useState(false)
        
        const changeVol = () => {
            function handleChange(e) {
                let res = e.target.value
                setIVind(res)
            }

            function handleApply() {
                handleResubmit(ivind)
                setIVadj(ivind)
            }

            function handleReset() {
                if(ivadj!=0) {
                    handleResubmit(0)
                    setIVadj(0)
                }
                setIVchg(false)
                setIVind(0)
            }

            return (
                <>
                    <a style={(ivadj != 0) ? {color: "crimson"} : null} className={styles.ivselect} onClick={()=>setIVchg(!ivchg)}>
                        {ivadj}% IV<MdChangeHistory style={{transform: "translateY(2px)"}}/>
                    </a>
                    <a className={styles.infomap} onClick={()=>getInfos("ivadj")}><IoMdInformationCircleOutline/></a>
                    {ivchg &&
                        <div className={styles.tslider}>
                            <div className={styles.tindcont}>
                                    <label>IV % Change</label>
                                    <b>{mathjs.round(ivind, 2)}%</b>
                                </div>
                            <a onClick={()=>{setIVchg(false); setIVind(ivadj)}}><IoMdCloseCircle className={styles.closebutt}/></a>
                            <Slider
                                defaultValue={ivadj}
                                step={1}
                                marks
                                min={-100}
                                max={100}
                                onChange={handleChange}
                                style={{color:"white"}}
                            />
                            <div className={styles.tsliderbottom}>
                                <div className={styles.tsliderside}>-100%</div>
                                <div className={styles.tsliderside}>&nbsp; &nbsp;0%</div>
                                <div className={styles.tsliderside}>+100%</div>
                            </div>
                            <div className={styles.tsliderbuttons}>
                                <a onClick={()=>handleReset()} style={{cursor:"pointer"}} >Reset</a>
                                <a onClick={()=>handleApply()} style={{cursor:"pointer"}}>Apply</a>
                            </div>
                        </div>
                    }
                </>
            )
        }

        const [showchart, setChart] = useState(false)

        const scrollContainerRef = useRef(null);
        const leftButtonRef = useRef(null);
        const rightButtonRef = useRef(null);
        let scrollInterval;

        const startScrollingLeft = () => {
            scrollInterval = setInterval(() => {
            scrollContainerRef.current.scrollLeft -= 12; 
            }, 16); 
        };

        const startScrollingRight = () => {
            scrollInterval = setInterval(() => {
            scrollContainerRef.current.scrollLeft += 12; 
            }, 16); 
        };

        const stopScrolling = () => {
            clearInterval(scrollInterval);
        };

        const checkOverflow = () => {
            const container = scrollContainerRef.current;
            if (!container) return;
            const showLeftButton = container.scrollLeft > 0;
            const showRightButton = container.scrollLeft + container.clientWidth + 1 < container.scrollWidth;
            leftButtonRef.current.style.visibility = showLeftButton ? 'visible' : 'hidden';
            rightButtonRef.current.style.visibility = showRightButton ? 'visible' : 'hidden'; 
        };
    
        useEffect(() => {
            const container = scrollContainerRef.current;
            if (container) {
                checkOverflow();
                const observer = new ResizeObserver(checkOverflow);
                observer.observe(container);
                return () => observer.disconnect();
            }
        }, []);

        function Map(obj) {
            let premium = obj.pivot
            let high = obj.high
            let low = obj.low
            return (
                <div className={styles.mapcontainer} ref={scrollContainerRef} onScroll={checkOverflow}>  
                    <div className={styles.mapcontainer2}> 
                    <table className={styles.maptable}>
                        <tbody>
                            <tr>
                                <td className={styles.sprice}></td>
                                {(periods.days).map((v, i) => (
                                <th key={i} className={i % 2 === 0 ? styles.it1 : styles.it2} colspan={v.dates.length}>
                                    <div className={styles.itmonths}>{v.m.split(',')[0].trim()}</div>     
                                </th>))}
                                <td className={styles.stime}></td>
                            </tr>
                            <tr>
                                <td className={styles.sprice}></td>
                                {(periods.res).map((v, i) => (
                                    <td key={i} className={styles.it}>
                                        <div className={styles.itmessage}>{expiredMessage(v.message, res)}</div>
                                        <div className={styles.itdates}>{v.date}</div>
                                        <div className={weekday(v.weekday) ? styles.itweeks : styles.itweeksends }>{v.weekday}</div>
                                        <div className={styles.itdates}>{v.time}</div>
                                    </td>
                                ))}
                                <td className={styles.stime}></td>
                            </tr>
                            {finalmatrix.map((v, i) => (
                                <>
                                    <tr key={i}>
                                        <td className={styles.sprice} style={v.stock==stockdata.stock ? {color: "rgb(255, 57, 58)"} : null}>{numFormat.format(v.stock)}</td>
                                        {v.row.map((w, l) => (
                                            <td key={l} onClick={()=>setDropData({row: w, stock: v.stock, stocknet: v.stocknet, premium: premium})} className={styles.iprice} style={heatMap(w.net, v.stocknet, high, low)}>
                                                {priceCvt(w.net, v.stocknet, premium, mapdisplay)} 
                                            </td>
                                        ))}
                                        <td className={styles.stime} style={v.stock==stockdata.stock ? {color: "rgb(255, 57, 58)"} : null}>{v.change}%</td>
                                    </tr> 
                                    {v.stock==stockdata.stock && <tr><td colSpan={"100%"}><span className={styles.matrixdeliner}></span></td></tr>}
                                </>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>
            )
        }

        const [prange1, setPrange1] = useState([])
        const [tmrange1, setTmrange1] = useState([])

        useEffect(() => {
            setPrange1(prange)
            setTmrange1(tmrange)
        }, []);

        const [timeRangeFlag, setTimeRangeflag] = useState(false)
        const [prFlag, setPrflag] = useState(false)
        function handleResubmit(ivadj) {
            setLoadingFlag(true)
            let checkp = validatorPriceRange(prange1.high, prange1.low, values.stock)
            if(checkp.valid) {
                let timeh = values.time.format('HH')
                let timem = values.time.format('mm')
                let start = dayjs.utc(tmrange1.start).set('hour', timeh).set('minute', timem).set('second', 0)
                let end = dayjs.utc(tmrange1.end).set('hour', 16).set('minute', 0).set('second', 0)
                let iprange = initPriceRange(prange1.high, prange1.low, values.stock)
                submit(start, end, iprange, false, ivadj/100)
                setIVind(ivadj)
            }
            else {
                throwError(checkp.error)
            }
        }

        return (
            <>
                {DropDown(dropdata.row, dropdata.stock, dropdata.stocknet, dropdata.premium)}
                <div>
                    <br/>
                    <table className={styles.optionsdata}>
                        <tr>  
                            <th>{maxrisk.credit>0 ? "Credit:" : "Entry Cost:"}</th> 
                            <th>Max Profit:</th>
                            <th>Max Risk:</th>
                            {maxrisk.breakeven && <th>Breakeven:</th>}
                        </tr>
                        <tr> 
                        <td>{numFormat.format(maxrisk.credit)}</td>
                            <td>{maxrisk.maxprofit ? numFormat.format(maxrisk.maxprofit) : "∞ Infinity"}</td>
                            <td>{maxrisk.maxrisk ? numFormat.format(maxrisk.maxrisk) : "∞ Infinity"}</td>
                            {maxrisk.breakeven && <td>{maxrisk.breakeven.map((b, i)=>(`$${mathjs.round(b, 2)} `))}</td>}
                        </tr>
                    </table>
                </div>
                <div className={styles.map}>
                    <div className={styles.buttons}>
                        {maxrisk.maxrisk && <>
                            <select className ={styles.mapdisplayselect} value={mapdisplay} onChange={(e)=>setMapDisplay(e.target.value)} id="mapprices">
                                <option value="p">$ Profit</option>
                                <option value="c">% Gain</option>
                            </select>
                            <a className={styles.infomap} onClick={()=>getInfos("switch")}><IoMdInformationCircleOutline/></a>
                            <span style={{width: "30px"}}></span>
                        </>}
                        {changeVol()}
                    </div>
                    <div className={styles.scrollbuttcont}>
                        <a ref={leftButtonRef} onMouseDown={startScrollingLeft} onMouseUp={stopScrolling} onMouseLeave={stopScrolling} onTouchStart={startScrollingLeft} onTouchEnd={stopScrolling} onTouchCancel={stopScrolling}><IoIosArrowBack className={styles.scrollbuttl}/></a>
                        <a ref={rightButtonRef} onMouseDown={startScrollingRight} onMouseUp={stopScrolling} onMouseLeave={stopScrolling} onTouchStart={startScrollingRight} onTouchEnd={stopScrolling} onTouchCancel={stopScrolling}><IoIosArrowForward className={styles.scrollbuttr}/></a>
                    </div>
                    {Map(maxrisk)}
                    <br/>
                    <div className={styles.undermap}>
                    <label className={styles.label}>Date Range:</label>
                        <div className={styles.timerange}>
                            {(timeRangeFlag === false) && <div>
                                {tmrange1.start} - {tmrange1.end}
                                <a onClick={()=>setTimeRangeflag(true)} className={styles.ivchangea}><IoMdSettings/></a>
                            </div>}
                            {timeRangeFlag && <div >
                                <input className={styles.timeinp} min="2018-01-01" max={tmrange1.end} type="date" id="tmrangelow" value={tmrange1.start} onChange={e => setTmrange1({...tmrange1, start: e.target.value})}></input> - <input className={styles.timeinp} type="date" id="tmrangehigh" value={tmrange1.end} onChange={e => setTmrange1({...tmrange1, end: e.target.value})}></input>
                                <a onClick={()=>handleResubmit(ivadj)} className={styles.ivchangea2}>Apply</a>
                            </div>}
                        </div>
                        <label className={styles.label}>Price Range:</label>
                        <div className={styles.pricerange}>
                            {(prFlag === false) && <div>
                                ${prange1.low} - ${prange1.high}
                                <a onClick={()=>setPrflag(true)} className={styles.ivchangea}><IoMdSettings/></a>
                            </div>}
                            {prFlag && <div >
                                <input className={styles.quant} type="number" id="rangelow" value={prange1.low} onChange={e => setPrange1({...prange1, low: parseFloat(e.target.value)})}></input> - <input className={styles.quant} type="number" id="rangehigh" value={prange1.high} onChange={e => setPrange1({...prange1, high: parseFloat(e.target.value)})}></input>
                                <a onClick={()=>handleResubmit(ivadj)} className={styles.ivchangea2}>Apply</a>
                            </div>}
                        </div>
                    </div>
                    <br/>
                    <br/>
                    <div>
                        <div className={styles.showchartbutton}>
                            <a onClick={()=>setChart(!showchart)}>
                                {showchart ? <div> Hide Chart <VscGraphLine className={styles.showcharticon}/> <MdOutlineKeyboardArrowUp className={styles.showcharticonarrow}/></div> : <div> Show Chart <VscGraphLine className={styles.showcharticon}/> <MdOutlineKeyboardArrowDown className={styles.showcharticonarrow}/></div>} 
                            </a>
                        </div>
                        <br/>
                        <div className={`${styles.chartbox} ${showchart ? styles.chartboxexp : ''}`}>
                            {showchart && <OptionChart props={{prices: finalmatrix, times: periods.res, curprice: stockdata.stock}}/>}
                        </div>
                    </div>
                </div>
            </>
        )
    }

    function addOptionKey() {
        setChangeFlag(true)
        setOptions([...options, 
            {id: Math.random().toString(36).slice(2, 7),
            om: 0,
            op: 0,
            type: 'c',
            strike: 0,
            iv: false,
            ivauto: true,
            qty: 1,
            date: opdate,
            action: 'buy'
        }])
    }

    function deleteOp2(id) {
        setChangeFlag(true)
        setOptions(options.filter(a => a.id !== id))
    }

    return (
        <>
            <div className={styles.main}>
                <div className={styles.submain}>
                <div className={styles.title}>Option Profit Calculator</div>
                <div className={styles.desc}>
                    This calculator derives theoretical option prices using the <u>Black-Scholes formula</u> and displays a matrix of  profit outcomes over time for a given price of the underlying. 
                    <br/>
                    <br/>
                    <u>Implied Volatility</u> is calculated automatically by default, but can be set to a pre-defined value. You can customize the inputs and add legs as per your strategy. 
                    <br/>
                </div>
                <hr/>
                <br/>
                {strategy && <div className={styles.strategy} style={{color: "black"}}>Strategy: <b style={{color: "tomato"}}>{strategytitle.title}</b></div>}
                {strategy && <div className={styles.strategydesc}>{getStrategyInfos(strategy)}</div>}
                <div className={styles.overform}>
                    <div className={styles.form}>
                        <div className={styles.title2}>Underlying:</div>
                        {createBlogForm()}
                        <br/>
                        <div className={styles.title2}>Contracts:</div>
                        <br/>
                        {options.map((o, i)=>(
                            <Option key={i} values={options.find(x => x.id === o.id)} stockvalues={values} displayClose={options.length>1 ? true : false} onChange={handleOptionChange} deleteOp={deleteOp2}/>
                        ))} 
                        {(options.length <= 6) && (
                        <a onClick={()=>addOptionKey()} className={styles.add}>
                            <div className={styles.addcont}>
                                <div className={styles.addbutton}><IoMdAdd/></div>
                                <p className={styles.addcontlabel}>Leg</p>
                            </div>
                        </a>)}
                        <br/>
                        <br/>
                        <br/>
                    </div>
                </div>
                {error && showError(error)}
                <div className={styles.mapbox}>
                    {(res.length > 0) && ( 
                        <Map/>
                    )}
                    {loadingFlag && (
                        <div className={styles.overlay}>
                            <Loading/>
                        </div>)}
                    {(changedFlag && res.length > 0) && (
                    <div className={styles.overlay}>
                        <div className={styles.overlaycontent}>
                            <p>Inputs have changed</p>
                            <a className={styles.overlaylink} onClick={(e)=>handleSubmit(e)}>Recalculate</a>
                        </div>
                    </div>)}
                </div>
                </div>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
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



export default Profit;