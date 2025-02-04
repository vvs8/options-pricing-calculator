import { impliedVolatilityCall, impliedVolatilityPut } from '../../f/bs'
import dayjs from 'dayjs'
var utc = require('dayjs/plugin/utc')
dayjs.extend(utc)
const mathjs = require('mathjs')
import { max, min } from 'mathjs';

export const initStartingDay = () => {
    let curdate = dayjs.utc()
    if (curdate.day() == 0)
        return curdate.set('hour', 16).subtract(2, 'days').set('minute', 0).set('second', 0)
    else if (curdate.day() == 6)
        return curdate.set('hour', 16).subtract(1, 'days').set('minute', 0).set('second', 0)
    else return curdate.set('hour', 16).set('minute', 0).set('second', 0)
}

export const opdate = initStartingDay().add(14, 'days').set('hour', 16).set('minute', 0).set('second', 0)

const call = (id, op, action, strike, qty) => ({
    id: id,
    om: op,
    op: op,
    type: 'c',
    strike: strike,
    iv: false,
    ivauto: true,
    qty: qty,
    date: opdate,
    action: action
})

const put = (id, op, action, strike, qty) => ({
    id: id,
    om: op,
    op: op,
    type: 'p',
    strike: strike,
    iv: false,
    ivauto: true,
    qty: qty,
    date: opdate,
    action: action
})

export function getStrategy(choice) {
    switch(choice){
        case 'longcall':
            return {title: "Long Call", stock: {price: 95, priceP: 100, qty: 0, stockflag: false}, options: [call('opt2', 1.05, 'buy', 95, 1)], type: 0}
        case 'shortput':
            return {title: 'Short Put', stock: {price: 95, priceP: 100, qty: 0, stockflag: false}, options: [put('opt2', 1.05, 'write', 93, 1)], type: 0}
        case 'bullcs':
            return {title: 'Bull Call Spread', stock: {price: 95, priceP: 100, qty: 0, stockflag: false}, options: [call('opt2', 1.05, 'buy', 95, 1), call('opt3', 0.50, 'write', 97, 1)], type: 0}
        case 'bullps':
            return {title: 'Bull Put Spread', stock: {price: 95, priceP: 100, qty: 0, stockflag: false}, options: [put('opt2', 1.05, 'write', 95, 1), put('opt3', 0.50, 'buy', 93, 1)], type: 0}
        case 'longput':
            return {title: 'Long Put', stock: {price: 95, priceP: 100, qty: 0, stockflag: false}, options: [put('opt2', 1.05, 'buy', 93, 1)], type: 1}
        case 'shortcall':
            return {title: 'Short Call', stock: {price: 95, priceP: 100, qty: 0, stockflag: false}, options: [call('opt2', 1.05, 'write', 95, 1)], type: 1}
        case 'bearcs':
            return {title: 'Bear Call Spread', stock: {price: 95, priceP: 100, qty: 0, stockflag: false}, options: [call('opt2', 1.05, 'buy', 95, 1), call('opt3', 2.50, 'write', 93, 1)], type: 1}
        case 'bearps':
            return {title: 'Bear Put Spread', stock: {price: 95, priceP: 100, qty: 0, stockflag: false}, options: [put('opt2', 1.05, 'buy', 95, 1), put('opt3', 0.50, 'write', 93, 1)], type: 1}
        case 'butterfly':
            return {title: 'Butterfly (long call)', stock: {price: 95, priceP: 100, qty: 0, stockflag: false}, options: [call('opt2', 2.5, 'buy', 93, 1), call('opt3', 1.05, 'write', 95, 2), call('opt7', 0.50, 'buy', 97, 1)], type: 2}
        case 'collar':
            return {title: 'Collar', stock: {price: 100, priceP: 100, qty: 100, stockflag: true}, options: [call('opt3', 1.8, 'write', 105, 1), put('opt7', 1.60, 'buy', 95, 1)], type: 2}
        case 'ic':
            return {title: 'Iron Condor (short)', stock: {price: 100, priceP: 100, qty: 0, stockflag: false}, options: [put('opt2', 1, 'buy', 90, 1), put('opt8', 2, 'write', 95, 1), call('opt3', 1.2, 'buy', 110, 1), call('opt7', 2.3, 'write', 105, 1)], type: 2}
        case 'straddle':
            return {title: 'Straddle (long)', stock: {price: 95, priceP: 95, qty: 0, stockflag: false}, options: [call('opt2', 1.05, 'buy', 95, 1), put('opt3', 1.00, 'buy', 95, 1)], type: 2}
        case 'strangle':
            return {title: 'Strangle (long)', stock: {price: 95, priceP: 95, qty: 0, stockflag: false}, options: [call('opt2', 1.50, 'buy', 100, 1), put('opt3', 1.20, 'buy', 90, 1)], type: 2}
        default:
            return {title: 'Long Call', options: [call('opt2', 1.05, 'buy', 95)], type: 0}
        
    }
}

function getMaxMinMatrix(mtx, res, stockdata) {
    let A = []
    for (var l = 0; l <mtx.length; l++) {
        let el = mtx[l].row[0].net*100 + mtx[l].stocknet
        let el1 = mtx[l].row[mtx[0].row.length-1].net*100 + mtx[l].stocknet
        A.push(el)
        A.push(el1)
    }
    let stockFactor = (stockdata.action === 'long') ? 1 : -1
    let topright = 0 + stockFactor*(stockdata.stock*37-stockdata.stockP)*stockdata.shares
    let topleft = 0 + stockFactor*(stockdata.stock*37-stockdata.stockP)*stockdata.shares
    let bottomright = 0 + stockFactor*(0-stockdata.stockP)*stockdata.shares
    let bottomleft = 0 + stockFactor*(0-stockdata.stockP)*stockdata.shares
    let uppercheck = 0 + stockFactor*(stockdata.stock*57-stockdata.stockP)*stockdata.shares
    for (var l = 0; l < res.length; l++) {
        topright = topright + res[l].maxdata.topright
        topleft = topleft + res[l].maxdata.topleft
        bottomright = bottomright + res[l].maxdata.bottomright
        bottomleft = bottomleft + res[l].maxdata.bottomleft
        uppercheck = uppercheck + res[l].maxdata.uppercheck
    }
    A.push(topright)
    A.push(topleft)
    A.push(bottomright)
    A.push(bottomleft)
    //console.log(uppercheck, topright)
    let mx = max(A)
    if(uppercheck > topright) mx = false
    let mn = min(A)
    if(uppercheck < topright) mn = false
    //console.log({mx, mn})
    return {mx, mn}
}

function maxRiskOption(res, matrix, stock) {
    let pivot = 0
    let maxrisk = 0
    let high = 0
    let low = 0
    let credit = 0
    let maxprofit = 0
    let minmax = getMaxMinMatrix(matrix, res, stock) 
    if(res.length < 2) {
        if(res[0].action == "buy") {
            maxrisk = minmax.mn
            high =  Math.abs(maxrisk) * 3
            low = maxrisk
            pivot = Math.abs(maxrisk)
            credit = res[0].credit
            maxprofit = minmax.mx
        }
        else {
            maxrisk = minmax.mn
            high = res[0].credit * 3
            low = -res[0].credit
            pivot = Math.abs(maxrisk)
            credit = res[0].credit
            maxprofit = minmax.mx
        }
        return { high, maxrisk, low, pivot, credit, maxprofit}  
    }
    if(res.every(o => o.action === res[0].action)) {
        if(res[0].action == "buy") {
            for (var l = 0; l <res.length; l++) {
                credit = credit + res[l].credit  
            }
            maxprofit = minmax.mx
            maxrisk = minmax.mn
            pivot = Math.abs(maxrisk)
            high = Math.abs(maxrisk) * 3
            low = maxrisk
            
        }
        if(res[0].action == "write") {
            for (var l = 0; l <res.length; l++) {
                high = high + res[l].credit
                low = low + -res[l].credit
                credit = credit + res[l].credit
            }
            high = high * 3
            maxprofit = minmax.mx
            maxrisk = minmax.mn
            pivot = Math.abs(maxrisk)
        }
        return { high, maxrisk, low, pivot, credit, maxprofit }  
    }
    else {
        if(res.every(o => o.type === res[0].type)) {
            for (var l = 0; l <res.length; l++) {
                credit = credit + res[l].credit
            }
            maxprofit = minmax.mx
            maxrisk = minmax.mn
            high = Math.abs(maxprofit)*3
            low = maxrisk
            pivot = Math.abs(maxrisk)
            return { high, maxrisk, low, pivot, credit, maxprofit} 
        }  
        else {
            for (var l = 0; l <res.length; l++) {
                credit = credit + res[l].credit
            } 
            maxprofit = minmax.mx
            maxrisk = minmax.mn
            high = maxprofit ? Math.abs(maxprofit)*3 : Math.abs(credit)*3
            low = maxrisk ? maxrisk : credit
            pivot = maxrisk ? Math.abs(maxrisk) : Math.abs(credit)
            return { high, maxrisk, low, pivot, credit, maxprofit} 
        }  
    } 
}

function solveForStockMarketPrice(stockPurchase, strike, premium, quantity, shares) {
    console.log(stockPurchase, strike, premium, quantity, shares)
    //let M = ((stockPurchase * shares) + (strike + premium) * 100 * quantity) / (100 * quantity + shares);
    //let M = -1*((premium * 100 * quantity)/shares)+stockPurchase
    //let A = mathjs.matrix([[shares + 100 * quantity] ]);
    //let b = mathjs.matrix([[(stockPurchase * shares) + (strike + premium) * 100 * quantity]]);

   
    let M = (premium * 100 * quantity) / (-1*shares) + stockPurchase;
    // Extract the value of M from the solution
    //let M = solution._data[0][0];
    
    
    return M;
}

function findBreakEven(options, stock) {
    //console.log(stock)
    //console.log(options)
    let breakeven = []
    if(stock.shares === 0) {
        if(options.length<2) {
            breakeven[0] = options[0].strike + (options[0].type === "call" ? options[0].op : -options[0].op)
            return breakeven
        }
        else return false
    }
    else {
        let optionaction = stock.action === "long" ? "buy" : "write"
        if(options.length<2) {
            if (options[0].action === optionaction) {
                if (options[0].type === "call") 
                    breakeven[0] = ((stock.stockP * stock.shares) + (options[0].strike + options[0].op) * 100 * options[0].qty) / (100 * options[0].qty + stock.shares);
                else {
                    breakeven[0] = (options[0].op * 100 * options[0].qty) / stock.shares + stock.stockP;
                    if (stock.shares + options[0].qty < options[0].qty*100)    
                        breakeven[1] = ((options[0].strike - options[0].op) * 100 * options[0].qty - (stock.stockP*stock.shares)) / (100 * options[0].qty - stock.shares);
                }
                return breakeven
            }
            else {
                if (options[0].type === "call") {
                    breakeven[0] = (options[0].op * 100 * options[0].qty) / (-1*stock.shares) + stock.stockP;
                    if (stock.shares + options[0].qty < options[0].qty*100)
                        breakeven[1] = ((options[0].strike + options[0].op) * 100 * options[0].qty - (stock.stockP*stock.shares)) / (100 * options[0].qty - stock.shares);
                }
                else
                    breakeven[0] = ((options[0].strike - options[0].op) * 100 * options[0].qty + (stock.stockP*stock.shares)) / (100 * options[0].qty + stock.shares);
                return breakeven
            }
        }
        else return false
    }
}

export function maxRisk(res, matrix, stock) {
    let data = maxRiskOption(res, matrix, stock)
    let breakeven = findBreakEven(res, stock)
    data.breakeven = breakeven
    console.log(data)
    return data
}

export function finalMatrix(data, stockdata) {
    const A = []
    let stockFactor = (stockdata.action === 'long') ? 1 : -1
    if(data.length>0){
        for (var i = 0; i <data[0].P.length; i++) {
            let obj = {stock: data[0].P[i].price, change: mathjs.round((data[0].P[i].price-stockdata.stock)/stockdata.stock*100, 2), row: [], stocknet: mathjs.round(stockFactor*(data[0].P[i].price-stockdata.stockP)*stockdata.shares)}
            for (var r = 0; r <data[0].P[0].row.length; r++) {
                let row = {net: 0, set: []}
                for (var l = 0; l <data.length; l++) {
                    row.net = row.net + (data[l].P[i].row[r].net*data[l].P[i].row[r].qty)
                    row.set.push(data[l].P[i].row[r])
                }
                obj.row.push(row)
            }
            A.push(obj)
        }
        return A
    }
}
  
export function convertYtm(d){
    let numberOfHours =  d*24
    var Days=Math.floor(numberOfHours/24);
    var Remainder=numberOfHours % 24;
    var Hours=Math.floor(Remainder);
    var Minutes=Math.floor(60*(Remainder-Hours));
    return (Days+'d ' + Hours + ':' + Minutes + 'h' )
}

function insertIntoSortedArray(arr, num) {
    let low = 0;
    let high = arr.length;
    while (low < high) {
      let mid = Math.floor((low + high) / 2);
      if (arr[mid] < num) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    if (arr[low] != num) {
        arr.splice(low, 0, num);
    }
    return arr;
}

export const initPriceRange = (high, low, mkt) => {
    let diff = high - low
    let pt = Math.round(diff/30)
    if(diff<40){pt = 1}
    if(diff<20){pt = 0.5}
    if(diff<10){pt = 0.25}
    if(diff<5){pt = 0.1}
    if(diff<2){pt = 0.05}
    if(diff<0.5){pt = 0.01}
    high = Math.round(high/pt)*pt
    low = Math.round(low/pt)*pt
    let A = []
    for (let i = low; i <= high+0.001; i+=pt) {
        let strike = i
        A.push(mathjs.round(strike, 2)) 
    }
    mkt=mathjs.round(mkt, 2)
    if(mkt>=low && mkt<=high)
        A = insertIntoSortedArray(A, mkt)
    return A
}

function convertArray(input) {
    const output = [];
    const map = new Map();
    for (let i = 0; i < input.length; i++) {
      const date = new Date(input[i]);
      const month = date.toLocaleString('en', { month: 'short' });
      const year = date.getFullYear().toString();
      const key = `${month}, ${year}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(input[i]);
    }
    for (const [key, dates] of map.entries()) {
      output.push({ m: key, dates });
    }
    return output;
}

export function getTimeline(arr) {
    const mindays = arr.reduce((min, current) => {
        return current.ytm < min.ytm ? current : min;
    });
    let res = mindays.P[0].row
    //console.log(res)
    let days = convertArray(res.map(obj => obj.date))
    //console.log(days)
    return {res, days}
}

export function initPrange(values, options) {
    let high = []
    let low = []
    let highw = 1.07
    let loww = 0.93
    //console.log(values)
    //console.log(options)
    let msv = dayjs.utc(values.date)
    for(let i=0; i<options.length; i++) {
        let mev = dayjs.utc(options[i].date)
        let T = mev.diff(msv)/(1000 * 3600 * 24)
        let stock = parseFloat(values.stock)
        let om = parseFloat(options[i].om)
        let strike = parseFloat(options[i].strike)
        let r = parseFloat(values.i)
        let div = parseFloat(values.div)
        //console.log(T)
        if(options[i].type == "c" && options[i].action == "buy") {
            let iv = impliedVolatilityCall(om, stock, strike, T, r, div)
            highw = 1.01 + iv/20
            loww = 0.99 - iv/100
        }
        else if(options[i].type == "c" && options[i].action == "write") {
            let iv = impliedVolatilityCall(om, stock, strike, T, r, div)
            highw = 1.01 + iv/100
            loww = 0.99 - iv/20
        }
        else if(options[i].type == "p" && options[i].action == "buy") {
            let iv = impliedVolatilityPut(om, stock, strike, T, r, div)
            highw = 1.01 + iv/100
            loww = 0.99 - iv/20
        }
        else if(options[i].type == "p" && options[i].action == "write") {
            let iv = impliedVolatilityPut(om, stock, strike, T, r, div)
            highw = 1.01  + iv/20
            loww = 0.99 - iv/100
        }
        high.push(parseFloat(values.stock) * highw)
        low.push(parseFloat(values.stock) * loww)
    }
    let iprange = initPriceRange(max(high), min(low), parseFloat(values.stock))
    return iprange
}

export const getDTM = (date, time, expiry) => {
    let timeh = dayjs.utc(time).format('HH')
    let timem = dayjs.utc(time).format('mm')
    let inp = dayjs.utc(date).set('hour', timeh).set('minute', timem).set('second', 0)
    let exp =  dayjs.utc(expiry)
    let res = exp.diff(inp)/(365 * 1000 * 3600 * 24)
    return res
}
