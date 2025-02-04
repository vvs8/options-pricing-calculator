const mathjs = require('mathjs')
import dayjs from 'dayjs'
var utc = require('dayjs/plugin/utc')
dayjs.extend(utc)

function cdfNormal(x, mean, std) {
    return (1 + mathjs.erf((x-mean) / (Math.sqrt(2) * std))) / 2
}

function pdfNormal(x) {
    return 1/Math.sqrt(2*Math.PI)*Math.exp(-Math.pow(x, 2)/2)
}

export function call(s, k, T, R, V, D) {
    let t = T/365
    let v = V/100
    let r = R*0.01
    let q = D*0.01
    let d1 = (Math.log(s/k) + (r-q + Math.pow(v, 2)/2)*t) / (v*Math.sqrt(t))
    let d2 = d1 - v * Math.sqrt(t)
    let res = s * Math.exp(-q*t) * cdfNormal(d1, 0, 1) - k * Math.exp(-r*t)*cdfNormal(d2, 0, 1)
    if (isNaN(res)) return 0;
    return mathjs.round(res, 2)
}

function callIV(s, k, R, T, v, D) {
    let t = T/365
    let r = R*0.01
    let q = D*0.01
    let d1 = (Math.log(s/k) + (r-q + Math.pow(v, 2)/2)*t) / (v*Math.sqrt(t))
    let d2 = d1 - v * Math.sqrt(t)
    let res = s * Math.exp(-q*t) * cdfNormal(d1, 0, 1) - k * Math.exp(-r*t)*cdfNormal(d2, 0, 1)
    let vega = Math.exp(-q*t) * s * Math.sqrt(t) * pdfNormal(d1)
    return [res, vega]
}

export function impliedVolatilityCall(target, s, k, To, R, D) {
    let msv = dayjs.utc(To.s)
    let mev = dayjs.utc(To.e)
    let T = mev.diff(msv)/(1000 * 3600 * 24)
    let max = 100
    let prec = 1.0e-5
    let v = 1
    for (var i = 0; i < max; i++) {
        let price = callIV(s, k, R, T, v, D)
        let diff = target - price[0]
        if (Math.abs(diff) < prec) {
            return v
        }
        v = v + (diff/price[1])
    }
    return v
}

export function callMatrix(market, target, s, k, To, R, D, A, id, qty, action, v, ivauto, timedisplay) {
    if (ivauto === true) v = impliedVolatilityCall(market, s, k, To, R, D)*100
    if (isNaN(v)) return false;
    let ms = dayjs.utc(To.s)
    let me = dayjs.utc(To.e)
    let md = dayjs.utc(To.d)
    let T = me.diff(ms)/(1000 * 3600 * 24)
    let Td = md.diff(ms)/(1000 * 3600 * 24)
    let offset = mathjs.round(Td - T, 3)
    let c = 1
    if(Td>30) c = 2
    if(Td>60) c = 3
    if(Td>90) c = 5
    if(Td>120) c = 7
    if(Td>365) c = 14
    let nextT 
    let T1
    let lastytm
    if(timedisplay == "c") {
        nextT = ms.add(c, 'days').set('hour', 16).set('minute', 0).set('second', 0)
        T1 = me.diff(nextT)/(1000 * 3600 * 24)
        lastytm = 0
    }
    else {
        nextT = ms.add(c, 'days').set('hour', 9).set('minute', 30).set('second', 0)
        T1 = me.diff(nextT)/(1000 * 3600 * 24)
        lastytm = T1 % 1;
    }
    let Prices = []
    var net = (op, mkt) => mkt - op
    if (action==="write") net = (op, mkt) => op - mkt
    if(T>0.001) {
        if(offset===0){
            for (let i = A.length-1; i >=0; i--) {
                let Row = []
                const res = call(A[i], k, T, R, v, D)
                Row.push({oprice: res, ytm: T, date: ms.format('MMM DD, YY'), expiry: me.format('MMM DD, YY'), type: 'Call', qty: qty, action: action, entry: target, net: net(target, res), strike: k, message: '', time: ms.format('hh:mm A'), weekday: ms.format('ddd')})
                for(let l = T1; l>lastytm; l=l-c){
                    const res = call(A[i], k, l, R, v, D)
                    let date = ms.add(Math.ceil(T1-l+c), 'days')
                    Row.push({oprice: res, ytm: l, date: date.format('MMM DD, YY'), expiry: me.format('MMM DD, YY'), type: 'Call', qty: qty, action: action, entry: target, net: net(target, res), strike: k, message: '',  time: nextT.format('hh:mm A'), weekday: date.format('ddd')})
                }
                const res1 = call(A[i], k, lastytm, R, v, D)
                Row.push({oprice: res1, ytm: lastytm, date: me.format('MMM DD, YY'), expiry: me.format('MMM DD, YY'), type: 'Call', qty: qty, action: action, entry: target, net: net(target, res1), strike: k, message: '', time: nextT.format('hh:mm A'), weekday: me.format('ddd')}) 
                const res0 = call(A[i], k, 0, R, v, D)
                Row.push({oprice: res0, ytm: 0, date: me.add(1, 'days').format('MMM DD, YY'), expiry: me.format('MMM DD, YY'), type: 'Call', qty: qty, action: action, entry: target, net: net(target, res0), strike: k, message: 'Expired', time: nextT.format('hh:mm A'), weekday: me.add(1, 'days').format('ddd')})  
                Prices.push({price: A[i], row: Row})
            }
        }
        else if (offset>0) {
            for (let i = A.length-1; i >=0; i--) {
                let Row = []
                let num = Td
                const res = call(A[i], k, T, R, v, D)
                Row.push({oprice: res, ytm: T, date: ms.format('MMM DD, YY'), expiry: me.format('MMM DD, YY'), type: 'Call', qty: qty, action: action, entry: target, net: net(target, res), strike: k, message: '', time: ms.format('hh:mm A'), weekday: ms.format('ddd')})
                for(let l = T1; l>0; l=l-c){
                    num = num - c
                    const res = call(A[i], k, l, R, v, D)
                    let date = ms.add(Math.ceil(T1-l+c), 'days')
                    Row.push({oprice: res, ytm: l, date: date.format('MMM DD, YY'), expiry: me.format('MMM DD, YY'), type: 'Call', qty: qty, action: action, entry: target, net: net(target, res), strike: k, message: ' ', time: nextT.format('hh:mm A'), weekday: date.format('ddd')})
                }
                const res0 = call(A[i], k, 0, R, v, D)
                for(let r = num-c; r>=1; r=r-c) {
                    let date = ms.add(Math.ceil(Td-r), 'days')
                    Row.push({oprice: res0, ytm: 0, date: date.format('MMM DD, YY'), expiry: me.format('MMM DD, YY'), type: 'Call', qty: qty, action: action, entry: target, net: net(target, res0), strike: k, message: 'Expired', time: nextT.format('hh:mm A'), weekday: date.format('ddd')})
                }
                Row.push({oprice: res0, ytm: 0, date: md.format('MMM DD, YY'), expiry: me.format('MMM DD, YY'), type: 'Call', qty: qty, action: action, entry: target, net: net(target, res0), strike: k, message: 'Expired', time: nextT.format('hh:mm A'), weekday: md.format('ddd')})
                Row.push({oprice: res0, ytm: 0, date: md.add(1, 'days').format('MMM DD, YY'), expiry: me.format('MMM DD, YY'), type: 'Call', qty: qty, action: action, entry: target, net: net(target, res0), strike: k, message: 'Expired', time: nextT.format('hh:mm A'), weekday: md.add(1, 'days').format('ddd')})
                Prices.push({price: A[i], row: Row})
            }
        }
        else {
            for (let i = A.length-1; i >=0; i--) {
                let Row = []
                const res = call(A[i], k, T, R, v, D)
                Row.push({oprice: res, ytm: T, date: ms.format('MMM DD, YY'), expiry: me.format('MMM DD, YY'), type: 'Call', qty: qty, action: action, entry: target, net: net(target, res), strike: k, message: ' ', time: ms.format('hh:mm A'), weekday: ms.format('ddd')})
                for(let l = T1; l>=Math.abs(offset)+1; l=l-c){
                    const res = call(A[i], k, l, R, v, D)
                    let date = ms.add(Math.ceil(T1-l+c), 'days')
                    Row.push({oprice: res, ytm: l, date: date.format('MMM DD, YY'), expiry: me.format('MMM DD, YY'), type: 'Call', qty: qty, action: action, entry: target, net: net(target, res), strike: k, message: ' ', time: nextT.format('hh:mm A'), weekday: date.format('ddd')})
                }
                let date = md
                let ytm = Math.abs(offset)+lastytm
                let res01 = call(A[i], k, ytm, R, v, D)
                let res00 = call(A[i], k, ytm-1, R, v, D)
                Row.push({oprice: res01, ytm: ytm, date: date.format('MMM DD, YY'), expiry: me.format('MMM DD, YY'), type: 'Call', qty: qty, action: action, entry: target, net: net(target, res01), strike: k, message: '', time: nextT.format('hh:mm A'), weekday: date.format('ddd')})
                Row.push({oprice: res00, ytm: ytm-1, date: date.add(1, 'days').format('MMM DD, YY'), expiry: me.format('MMM DD, YY'), type: 'Call', qty: qty, action: action, entry: target, net: net(target, res00), strike: k, message: '', time: nextT.format('hh:mm A'), weekday: date.add(1, 'days').format('ddd')})
                Prices.push({price: A[i], row: Row})
            }
        }
    }
    if(T<0.001) {
        for (let i = A.length-1; i >=0; i--) {
            let Row = []
            const res0 = call(A[i], k, 0, R, v, D)
            Row.push({oprice: res0, ytm: 0, date: ms.format('MMM DD, YY'), expiry: me.format('MMM DD, YY'), type: 'Call', qty: qty, action: action, entry: target, net: net(target, res0), strike: k, message: 'Expired', time: ms.format('hh:mm A'), weekday: ms.format('ddd')})
            for(let l = c; l<Td-1; l=l+c){
                Row.push({oprice: res0, ytm: 0, date: ms.add(l, 'days').format('MMM DD, YY'), expiry: me.format('MMM DD, YY'), type: 'Call', qty: qty, action: action, entry: target, net: net(target, res0), strike: k, message: 'Expired', time: nextT.format('hh:mm A'), weekday: ms.add(l, 'days').format('ddd')})
            }
            Row.push({oprice: res0, ytm: 0, date: md.format('MMM DD, YY'), expiry: me.format('MMM DD, YY'), type: 'Call', qty: qty, action: action, entry: target, net: net(target, res0), strike: k, message: 'Expired', time: nextT.format('hh:mm A'), weekday: md.format('ddd')})
            Row.push({oprice: res0, ytm: 0, date: md.add(1, 'days').format('MMM DD, YY'), expiry: me.format('MMM DD, YY'), type: 'Call', qty: qty, action: action, entry: target, net: net(target, res0), strike: k, message: 'Expired', time: nextT.format('hh:mm A'), weekday: md.add(1, 'days').format('ddd')})
            Prices.push({price: A[i], row: Row})
        }
    }
    let premium = () => {
        if(action == "write") {
            return target * qty * 100
        }
        else return -target * qty * 100
    }
    let maxUp = () => {
        let stockhigh = s * 37
        if(action == "write") {
            const res1 = call(stockhigh, k, 0, R, v, D)
            const res2 = call(stockhigh, k, T, R, v, D)
            const res3 = call(s * 57, k, 0, R, v, D)
            return {topright: (target-res1)*100 * qty, bottomright: target*100 * qty, topleft: (target-res2)*100 * qty, bottomleft: target*100 * qty, uppercheck: (target-res3)*100 * qty}
        }
        else {
            const res1 = call(stockhigh, k, 0, R, v, D)
            const res2 = call(stockhigh, k, T, R, v, D)
            const res3 = call(s * 57, k, 0, R, v, D)
            return {topright: (res1-target)*100 * qty, bottomright: target*-100 * qty, topleft: (res2-target)*100 * qty, bottomleft: target*-100 * qty, uppercheck: (res3-target)*100 * qty}
        }
    }
    return {id: id, P: Prices, iv: v, op: target, om: market, maxdata: maxUp(), credit: premium(), strike: k, ytm: T, timerange: {start: dayjs(To.s).format('YYYY-MM-DD'), end: dayjs(To.d).format('YYYY-MM-DD') }, expiry: me.format('MMM DD, YY'), prange: {low: A[0], high: A[A.length-1]}, type: 'call', qty: qty, action: action} 
}

export function put(s, k, T, R, V, D) {
    let t = T/365
    let v = V/100
    let r = R*0.01
    let q = D*0.01
    let d1 = (Math.log(s/k) + (r-q + Math.pow(v, 2)/2)*t) / (v*Math.sqrt(t))
    let d2 = d1 - v * Math.sqrt(t)
    let res = k * Math.exp(-r*t)*cdfNormal(-d2, 0, 1) - s * Math.exp(-q*t)*cdfNormal(-d1, 0, 1)
    if (isNaN(res)) return 0;
    return parseFloat(res.toFixed(4));
}

function putIV(s, k, R, T, v, D) {
    let t = T/365
    let r = R*0.01
    let q = D*0.01
    let d1 = (Math.log(s/k) + (r-q + Math.pow(v, 2)/2)*t) / (v*Math.sqrt(t))
    let d2 = d1 - v * Math.sqrt(t)
    let res = k * Math.exp(-r*t)*cdfNormal(-d2, 0, 1) - s * Math.exp(-q*t)*cdfNormal(-d1, 0, 1)
    let vega = Math.exp(-q*t) * s * Math.sqrt(t) * pdfNormal(d1)
    return [res, vega]
}

export function impliedVolatilityPut(target, s, k, To, R, D) {
    let msv = dayjs.utc(To.s)
    let mev = dayjs.utc(To.e)
    let T = mev.diff(msv)/(1000 * 3600 * 24)
    let max = 200
    let prec = 1.0e-5
    let v = 1
    for (var i = 0; i < max; i++) {
        let price = putIV(s, k, R, T, v, D)
        let diff = target - price[0]
        if (Math.abs(diff) < prec) {
            return v
        }
        v = v + (diff/price[1])
    }
    return v
}

export function putMatrix(market, target, s, k, To, R, D, A, id, qty, action, v, ivauto, timedisplay) {
    if (ivauto === true) v = impliedVolatilityPut(market, s, k, To, R, D)*100
    if (isNaN(v)) return false;
    let ms = dayjs.utc(To.s)
    let me = dayjs.utc(To.e)
    let md = dayjs.utc(To.d)
    let T = me.diff(ms)/(1000 * 3600 * 24)
    let Td = md.diff(ms)/(1000 * 3600 * 24)
    let offset = mathjs.round(Td - T, 3)
    let c = 1
    if(Td>30) c = 2
    if(Td>60) c = 3
    if(Td>90) c = 5
    if(Td>120) c = 7
    if(Td>365) c = 14
    let nextT 
    let T1
    let lastytm
    if(timedisplay == "c") {
        nextT = ms.add(c, 'days').set('hour', 16).set('minute', 0).set('second', 0)
        T1 = me.diff(nextT)/(1000 * 3600 * 24)
        lastytm = 0
    }
    else {
        nextT = ms.add(c, 'days').set('hour', 9).set('minute', 30).set('second', 0)
        T1 = me.diff(nextT)/(1000 * 3600 * 24)
        lastytm = T1 % 1;
    }
    let Prices = []
    var net = (op, mkt) => mkt - op
    if (action==="write") net = (op, mkt) => op - mkt
    if(T>0.001) {
        if(offset===0){
            for (let i = A.length-1; i >=0; i--) {
                let Row = []
                const res = put(A[i], k, T, R, v, D)
                Row.push({oprice: res, ytm: T, date: ms.format('MMM DD, YY'), expiry: me.format('MMM DD, YY'), type: 'Put', qty: qty, action: action, entry: target, net: net(target, res), strike: k, message: '', time: ms.format('hh:mm A'), weekday: ms.format('ddd')})
                for(let l = T1; l>lastytm; l=l-c){
                    const res = put(A[i], k, l, R, v, D)
                    let date = ms.add(Math.ceil(T1-l+c), 'days')
                    Row.push({oprice: res, ytm: l, date: date.format('MMM DD, YY'), expiry: me.format('MMM DD, YY'), type: 'Put', qty: qty, action: action, entry: target, net: net(target, res), strike: k, message: '',  time: nextT.format('hh:mm A'), weekday: date.format('ddd')})
                }
                const res1 = put(A[i], k, lastytm, R, v, D)
                Row.push({oprice: res1, ytm: lastytm, date: me.format('MMM DD, YY'), expiry: me.format('MMM DD, YY'), type: 'Put', qty: qty, action: action, entry: target, net: net(target, res1), strike: k, message: '', time: nextT.format('hh:mm A'), weekday: me.format('ddd')}) 
                const res0 = put(A[i], k, 0, R, v, D)
                Row.push({oprice: res0, ytm: 0, date: me.add(1, 'days').format('MMM DD, YY'), expiry: me.format('MMM DD, YY'), type: 'Put', qty: qty, action: action, entry: target, net: net(target, res0), strike: k, message: 'Expired', time: nextT.format('hh:mm A'), weekday: me.add(1, 'days').format('ddd')})  
                Prices.push({price: A[i], row: Row})
            }
        }
        else if (offset>0) {
            for (let i = A.length-1; i >=0; i--) {
                let Row = []
                let num = Td
                const res = put(A[i], k, T, R, v, D)
                Row.push({oprice: res, ytm: T, date: ms.format('MMM DD, YY'), expiry: me.format('MMM DD, YY'), type: 'Put', qty: qty, action: action, entry: target, net: net(target, res), strike: k, message: '', time: ms.format('hh:mm A'), weekday: ms.format('ddd')})
                for(let l = T1; l>0; l=l-c){
                    num = num - c
                    const res = put(A[i], k, l, R, v, D)
                    let date = ms.add(Math.ceil(T1-l+c), 'days')
                    Row.push({oprice: res, ytm: l, date: date.format('MMM DD, YY'), expiry: me.format('MMM DD, YY'), type: 'Put', qty: qty, action: action, entry: target, net: net(target, res), strike: k, message: ' ', time: nextT.format('hh:mm A'), weekday: date.format('ddd')})
                }
                const res0 = put(A[i], k, 0, R, v, D)
                for(let r = num-c; r>=1; r=r-c) {
                    let date = ms.add(Math.ceil(Td-r), 'days')
                    Row.push({oprice: res0, ytm: 0, date: date.format('MMM DD, YY'), expiry: me.format('MMM DD, YY'), type: 'Put', qty: qty, action: action, entry: target, net: net(target, res0), strike: k, message: 'Expired', time: nextT.format('hh:mm A'), weekday: date.format('ddd')})
                }
                Row.push({oprice: res0, ytm: 0, date: md.format('MMM DD, YY'), expiry: me.format('MMM DD, YY'), type: 'Put', qty: qty, action: action, entry: target, net: net(target, res0), strike: k, message: 'Expired', time: nextT.format('hh:mm A'), weekday: md.format('ddd')})
                Row.push({oprice: res0, ytm: 0, date: md.add(1, 'days').format('MMM DD, YY'), expiry: me.format('MMM DD, YY'), type: 'Put', qty: qty, action: action, entry: target, net: net(target, res0), strike: k, message: 'Expired', time: nextT.format('hh:mm A'), weekday: md.add(1, 'days').format('ddd')})
                Prices.push({price: A[i], row: Row})
            }
        }
        else {
            for (let i = A.length-1; i >=0; i--) {
                let Row = []
                const res = put(A[i], k, T, R, v, D)
                Row.push({oprice: res, ytm: T, date: ms.format('MMM DD, YY'), expiry: me.format('MMM DD, YY'), type: 'Put', qty: qty, action: action, entry: target, net: net(target, res), strike: k, message: ' ', time: ms.format('hh:mm A'), weekday: ms.format('ddd')})
                for(let l = T1; l>=Math.abs(offset)+1; l=l-c){
                    const res = put(A[i], k, l, R, v, D)
                    let date = ms.add(Math.ceil(T1-l+c), 'days')
                    Row.push({oprice: res, ytm: l, date: date.format('MMM DD, YY'), expiry: me.format('MMM DD, YY'), type: 'Put', qty: qty, action: action, entry: target, net: net(target, res), strike: k, message: ' ', time: nextT.format('hh:mm A'), weekday: date.format('ddd')})
                }
                let date = md
                let ytm = Math.abs(offset)+lastytm
                let res01 = put(A[i], k, ytm, R, v, D)
                let res00 = put(A[i], k, ytm-1, R, v, D)
                Row.push({oprice: res01, ytm: ytm, date: date.format('MMM DD, YY'), expiry: me.format('MMM DD, YY'), type: 'Put', qty: qty, action: action, entry: target, net: net(target, res01), strike: k, message: '', time: nextT.format('hh:mm A'), weekday: date.format('ddd')})
                Row.push({oprice: res00, ytm: ytm-1, date: date.add(1, 'days').format('MMM DD, YY'), expiry: me.format('MMM DD, YY'), type: 'Put', qty: qty, action: action, entry: target, net: net(target, res00), strike: k, message: '', time: nextT.format('hh:mm A'), weekday: date.add(1, 'days').format('ddd')})
                Prices.push({price: A[i], row: Row})
            }
        }
    }
    if(T<0.001) {
        for (let i = A.length-1; i >=0; i--) {
            let Row = []
            const res0 = put(A[i], k, 0, R, v, D)
            Row.push({oprice: res0, ytm: 0, date: ms.format('MMM DD, YY'), expiry: me.format('MMM DD, YY'), type: 'Put', qty: qty, action: action, entry: target, net: net(target, res0), strike: k, message: 'Expired', time: ms.format('hh:mm A'), weekday: ms.format('ddd')})
            for(let l = c; l<Td-1; l=l+c){
                Row.push({oprice: res0, ytm: 0, date: ms.add(l, 'days').format('MMM DD, YY'), expiry: me.format('MMM DD, YY'), type: 'Put', qty: qty, action: action, entry: target, net: net(target, res0), strike: k, message: 'Expired', time: nextT.format('hh:mm A'), weekday: ms.add(l, 'days').format('ddd')})
            }
            Row.push({oprice: res0, ytm: 0, date: md.format('MMM DD, YY'), expiry: me.format('MMM DD, YY'), type: 'Put', qty: qty, action: action, entry: target, net: net(target, res0), strike: k, message: 'Expired', time: nextT.format('hh:mm A'), weekday: md.format('ddd')})
            Row.push({oprice: res0, ytm: 0, date: md.add(1, 'days').format('MMM DD, YY'), expiry: me.format('MMM DD, YY'), type: 'Put', qty: qty, action: action, entry: target, net: net(target, res0), strike: k, message: 'Expired', time: nextT.format('hh:mm A'), weekday: md.add(1, 'days').format('ddd')})
            Prices.push({price: A[i], row: Row})
        }
    }
    let premium = () => {
        if(action == "write") {
            return target * qty * 100
        }
        else return -target * qty * 100
    }
    let maxUp = () => {
        let stockhigh = 0
        if(action == "write") {
            const res1 = put(stockhigh, k, 0, R, v, D)
            const res2 = put(stockhigh, k, T, R, v, D)
            return {topright: target*100 * qty, bottomright: (target-res1)*100 * qty, topleft: target*100 * qty, bottomleft: (target-res2)*100 * qty, uppercheck: target*100 * qty}
        }
        else {
            const res1 = put(stockhigh, k, 0, R, v, D)
            const res2 = put(stockhigh, k, T, R, v, D)
            return {topright: target*-100 * qty, bottomright: (res1-target)*100 * qty, topleft: target*-100 * qty, bottomleft: (res2-target)*100 * qty, uppercheck: target*-100 * qty}
        }
    }
    return {id: id, P: Prices, iv: v, op: target, om: market, maxdata: maxUp(), credit: premium(), strike: k, ytm: T, timerange: {start: dayjs(To.s).format('YYYY-MM-DD'), end: dayjs(To.d).format('YYYY-MM-DD') }, expiry: me.format('MMM DD, YY'), prange: {low: A[0], high: A[A.length-1]}, type: 'put', qty: qty, action: action} 
}

