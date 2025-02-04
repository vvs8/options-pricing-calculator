import React, { useState } from 'react'
import Link from 'next/link'
import { getInfos } from './infos'
import { getDTM } from './support'
import dayjs from 'dayjs'
var utc = require('dayjs/plugin/utc')
dayjs.extend(utc)
const mathjs = require('mathjs')
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import Switch from '@mui/material/Switch';
import {IoIosCloseCircleOutline, IoMdInformationCircleOutline} from 'react-icons/io';
import {MdLockOpen, MdLock} from 'react-icons/md';

import styles from '../../components/css/Options.module.css'



const Option = ({values, stockvalues, onChange, deleteOp, displayClose}) => {

    const [lockS, setLock] = useState(true)
    function handleLock() {
        setValues({...values, op: values.om})
        setLock(!lockS)
    }

    function setValues(values) {
        onChange(values.id, values)
    }
    
    function funDays(n) {
        let inp = dayjs.utc(n).set('hour', 16).set('minute', 0).set('second', 0)
        setValues({...values, date: inp})
    }

    function resetType(e) {
        setValues({...values, type: e.target.value})
    }

    function handleChangeRadio(e) { 
        setValues({...values, action: e.target.value})
    }

    const handleChange = (e, t) => {
        switch (t) {
            case "type":
                setValues({...values, type: e.target.value})
                break;
            case "strike":
                setValues({...values, strike: e.target.value})
                break;
            case "om":
                if (lockS) setValues({...values, om: e.target.value, op: e.target.value})
                else setValues({...values, om: e.target.value})
                break;
            case "op":
                setValues({...values, op: e.target.value})
                break;
            case "qty":
                setValues({...values, qty: e.target.value})
                break;
            case "iv":
                setValues({...values, iv: e.target.value})
                break;
            case "ivauto":
                if(!e.target.checked) setValues({...values, ivauto: e.target.checked})
                else setValues({...values, ivauto: e.target.checked, iv: false})
                break;
        }
    }

    const disableWeekends = (date) => date.day() === 0 || date.day() === 6;

    function deleteOp1() {
        deleteOp(values.id)
    }
    
    return (
        <>
            <div className={styles.optioninfoholder}>
                <div className={styles.optioninfo}>${values.strike}{values.type} &nbsp;{dayjs(values.date).format('ll')}</div>
            </div>
           <div className={styles.holder}>
                {displayClose && <a onClick={()=>deleteOp1()}className={styles.removebutton}><IoIosCloseCircleOutline/></a>}
                <div className={styles.columnholder}>
                    <div className={styles.columnholdersec}>
                        <div className={styles.column}>
                            <div className={styles.radio}>
                                <div>
                                    <Select
                                        className={styles.selector}
                                        name="type" id="type" 
                                        value={values.type}
                                        onChange={(e)=>resetType(e)}
                                        sx={{fontWeight: 600, color: "rgb(248, 248, 248)"}}
                                        >
                                        <MenuItem value={"c"}>Call </MenuItem>
                                        <MenuItem value={"p"}>Put</MenuItem>
                                    </Select>
                                </div>
                                <div className={styles.radiocc}>
                                    <FormControl>
                                        <RadioGroup
                                            name="optionradio"
                                            value={values.action}
                                            onChange={handleChangeRadio}
                                        >
                                            <FormControlLabel value="buy" control={<Radio sx={{'& .MuiSvgIcon-root': {fontSize: 17 }, padding: 0,  color: "grey",'&.Mui-checked': {color: 'red'},}}/>} label={<span className={styles.radioc}>Buy</span>}  />
                                            <span style={{height: '3px'}}></span>
                                            <FormControlLabel value="write" control={<Radio sx={{'& .MuiSvgIcon-root': {fontSize: 17}, padding: 0,  color: "gray",'&.Mui-checked': {color: 'red'},}}/>} label={<span className={styles.radioc}>Write</span>} />
                                        </RadioGroup>
                                    </FormControl>
                                </div>
                            </div>
                            <div className={styles.textcover}>
                                <label className={styles.label}>Strike Price: </label>
                                <TextField className={styles.textstrike} rows={1}  id="strike" name="strike" value={values.strike} 
                                    onChange={e=>handleChange(e, 'strike')} 
                                    InputProps={{startAdornment: <InputAdornment position="start">$</InputAdornment>}}
                                />
                            </div>
                        </div>
                        <div className={styles.centralcolumn}>
                            <div className={styles.textcover}>
                                <label className={styles.label}>Market Price: <a className={styles.info} onClick={()=>getInfos("om")}><IoMdInformationCircleOutline/></a></label>
                                <TextField className={styles.textc} rows={1}  id="om" name="om" value={values.om} 
                                    onChange={e=>handleChange(e, 'om')} 
                                    InputProps={{startAdornment: <InputAdornment position="start">$</InputAdornment>}}
                                />
                            </div>
                            <div className={styles.lockqty}> 
                                <div className={styles.textcover}>
                                    <label className={styles.label}>Entry Price: <a className={styles.info} onClick={()=>getInfos("op")}><IoMdInformationCircleOutline/></a></label>
                                    <TextField disabled={lockS} className={styles.textc} rows={1}  id="op" name="op" value={lockS ? values.om : values.op}
                                        onChange={e=>handleChange(e, 'op')} 
                                        InputProps={{startAdornment: <InputAdornment position="start">$</InputAdornment>}}
                                    />
                                </div>
                                <div className={styles.lockicon}>
                                    <a onClick={handleLock}>
                                    {lockS ? <MdLock/> : <MdLockOpen/> }
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.columnlast}>
                        <div className={styles.textcover}>
                            <label className={styles.label}>Expiry Date: <a className={styles.info} onClick={()=>getInfos("exp")}><IoMdInformationCircleOutline/></a></label>
                            <LocalizationProvider dateAdapter={AdapterDayjs} >
                                <DatePicker className={styles.datefield}
                                    value={values.date}
                                    onChange={funDays}
                                    shouldDisableDate={disableWeekends}
                                    renderInput={(params) => <TextField {...params} />}
                                />
                            </LocalizationProvider>
                        </div>
                   
                        <div className={styles.textcover}>
                            <label className={styles.labelqty}># of Contracts:</label>
                            <div className={styles.textqty}>
                                <TextField  rows={1}  id="qty" name="qty" value={values.qty}
                                    onChange={e=>handleChange(e, 'qty')}
                                    InputProps={{startAdornment: <InputAdornment position="start">Qty</InputAdornment>}}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.obottombox}>
                    <div className={styles.ivbox}>
                        <div className={styles.ivswitch}><Switch checked={values.ivauto} onChange={(e)=>handleChange(e, 'ivauto')} color='warning' size='small' style={{color: 'red'}}/></div>
                        <a className={styles.infomap} onClick={()=>getInfos("iv")}><IoMdInformationCircleOutline/></a>
                        <label className={styles.ivlabel} style={{paddingTop: "2px"}}>IV: </label>
                        {(values.ivauto === true) && <div className={styles.ivres} style={{paddingTop: "2px"}}> {(values.iv > 0) && mathjs.round(values.iv, 3)+"%"}</div>}
                        {(values.ivauto === false) && <input className={styles.quant} type="number" id="number" value={values.iv} onChange={e=>handleChange(e, 'iv')}></input>}
                        {(values.ivauto === true) && <div style={{paddingTop: "2px"}}> Auto</div>}
                    </div>
                    {values.iv && <div>
                        <Link href={{
                            pathname: '/calculators/optionprice',
                            query: { stock: stockvalues.stock, strike: values.strike, i: stockvalues.i, iv: values.iv, div: stockvalues.div, type: values.type, ytm: getDTM(stockvalues.date, stockvalues.time, values.date)}
                        }}>
                            <div className={styles.openpricelink}>View Greeks</div>
                        </Link>
                    </div> }
                </div>
            </div>
            <br/>
            <br/>
        </>
    );
};



export default Option;