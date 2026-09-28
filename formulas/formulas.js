const mathjs = require('mathjs')

function cdfNormal(x, mean, std) {
    return (1 + mathjs.erf((x-mean) / (Math.sqrt(2) * std))) / 2
}

function pdfNormal(x) {
    return 1/Math.sqrt(2*Math.PI)*Math.exp(-Math.pow(x, 2)/2)
}

function callGreeks(d1, d2, s, k, r, t, v, q) {
    let delta = Math.exp(-q*t) * cdfNormal(d1, 0, 1)
    let gamma = Math.exp(-q*t) * (pdfNormal(d1) / (s*v*Math.sqrt(t)))
    let vega = Math.exp(-q*t) * s * Math.sqrt(t) * pdfNormal(d1) / 100
    let theta = (1/365) * ((-1*(Math.exp(-q*t) * s * v * pdfNormal(d1)) / (2*Math.sqrt(t))) + q*Math.exp(-q*t)*s*cdfNormal(d1, 0, 1) - r*k*Math.exp(-r*t)*cdfNormal(d2, 0, 1)) 
    let oprice = s * Math.exp(-q*t) * cdfNormal(d1, 0, 1) - k * Math.exp(-r*t)*cdfNormal(d2, 0, 1) 
    return [delta, gamma, vega, theta, oprice.toFixed(4)]
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

export function callData(s, k, T, R, V, D) {
    let t = (T)/(365)
    let v = V*0.01
    let r = R*0.01
    let q = D*0.01
    let d1 = (Math.log(s/k) + (r-q + Math.pow(v, 2)/2)*t) / (v*Math.sqrt(t))
    let d2 = d1 - v * Math.sqrt(t)
    return callGreeks(d1, d2, s, k, r, t, v, q)
}

export function callDataset(s, k, T, R, V, D) {
    let low = s * 0.75
    let high = s * 1.25
    let diff = high - low
    let pt = diff/100
    let A = []
    for (let i = 0; i < 100; i++) {
        let strike = low+(pt*i)
        A.push(strike) 
    }
    let deltas = []
    let gammas = []
    let vegas = []
    let thetas = []
    let oprices = []
    for (var i = 0; i < A.length; i++) {
        let Res = callData(A[i], k, T, R, V, D)
        deltas.push(Res[0])
        gammas.push(Res[1])
        vegas.push(Res[2])
        thetas.push(Res[3])
        oprices.push(Res[4])
    }
    let curdelta = callData(s, k, T, R, V, D)
    let highdelta = 1
    let highgamma = Math.max(...gammas)
    let highvega = Math.max(...vegas)
    let hightheta = Math.min(...thetas)
    let highoprice = Math.max(...oprices)
    return {
        curprice: s, 
        strike: k, 
        highdelta: highdelta, 
        curdelta: curdelta[0], 
        deltas: deltas, 
        curgamma: curdelta[1], 
        highgamma: highgamma, 
        gammas: gammas,  
        curvega: curdelta[2], 
        highvega: highvega, 
        vegas: vegas,  
        curtheta: curdelta[3], 
        hightheta: hightheta, 
        thetas: thetas,  
        curoprice: curdelta[4],
        highoprice: highoprice,
        oprices: oprices,
        prices: A
    }
}

export function callTimeDataset(s, k, T, R, V, D) {
    let pt = T/100
    let A = []
    for (let i = 0; i < 100; i++) {
        let time = (pt*i)
        A.push(time)
    }
    let deltas = []
    let gammas = []
    let vegas = []
    let thetas = []
    let oprices = []
    for (var i = 0; i < A.length; i++) {
        let Res = callData(s, k, A[i], R, V, D)
        deltas.push(Res[0])
        gammas.push(Res[1])
        vegas.push(Res[2])
        thetas.push(Res[3])
        oprices.push(Res[4])
    }
    return {
        curprice: T,  
        deltas: deltas, 
        gammas: gammas,  
        vegas: vegas,  
        thetas: thetas, 
        oprices: oprices, 
        prices: A
    }
}

export function callVDataset(s, k, T, R, V, D) {
    let low = V * 0.75
    let high = V * 1.25
    let diff = high - low
    let pt = diff/100
    let A = []
    for (let i = 0; i < 100; i++) {
        let strike = low+pt*i
        A.push(strike)
    }
    let deltas = []
    let gammas = []
    let vegas = []
    let thetas = []
    let oprices = []
    for (var i = 0; i < A.length; i++) {
        let Res = callData(s, k, T, R, A[i], D)
        deltas.push(Res[0])
        gammas.push(Res[1])
        vegas.push(Res[2])
        thetas.push(Res[3])
        oprices.push(Res[4])
    }
    let curdelta = callData(s, k, T, R, V, D)
    return {
        curprice: V, 
        strike: k, 
        curdelta: curdelta[0], 
        deltas: deltas, 
        curgamma: curdelta[1], 
        gammas: gammas,  
        curvega: curdelta[2], 
        vegas: vegas,  
        curtheta: curdelta[3], 
        thetas: thetas,  
        curoprice: curdelta[4],
        oprices: oprices,
        prices: A
    }
}

function putGreeks(d1, d2, s, k, r, t, v, q) {
    let delta = -1*Math.exp(-q*t) * cdfNormal(-d1, 0, 1)
    let gamma = Math.exp(-q*t) * (pdfNormal(d1) / (s*v*Math.sqrt(t)))
    let vega = Math.exp(-q*t) * s * Math.sqrt(t) * pdfNormal(d1) / 100
    let theta = (1/365) * ((-1*(Math.exp(-q*t) * s * v * pdfNormal(d1)) / (2*Math.sqrt(t))) - q*Math.exp(-q*t)*s*cdfNormal(-d1, 0, 1) + r*k*Math.exp(-r*t)*cdfNormal(-d2, 0, 1)) 
    let oprice = k * Math.exp(-r*t)*cdfNormal(-d2, 0, 1) - s * Math.exp(-q*t) * cdfNormal(-d1, 0, 1) 
    return [delta, gamma, vega, theta, oprice.toFixed(4)]
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

export function putData(s, k, T, R, V, D) {
    let t = (T)/365
    let v = V*0.01
    let r = R*0.01
    let q = D*0.01
    let d1 = (Math.log(s/k) + (r-q + Math.pow(v, 2)/2)*t) / (v*Math.sqrt(t))
    let d2 = d1 - v * Math.sqrt(t)
    return putGreeks(d1, d2, s, k, r, t, v, q)
}

export function putDataset(s, k, T, R, V, D) {
    let low = s * 0.75
    let high = s * 1.25
    let diff = high - low
    let pt = diff/100
    let A = []
    for (let i = 0; i < 100; i++) {
        let strike = low+(pt*i)
        A.push(strike) 
    }
    let deltas = []
    let gammas = []
    let vegas = []
    let thetas = []
    let oprices = []
    for (var i = 0; i < A.length; i++) {
        let Res = putData(A[i], k, T, R, V, D)
        deltas.push(Res[0])
        gammas.push(Res[1])
        vegas.push(Res[2])
        thetas.push(Res[3])
        oprices.push(Res[4])
    }
    let curdelta = putData(s, k, T, R, V, D)
    let highdelta = -1
    let highgamma = Math.max(...gammas)
    let highvega = Math.max(...vegas)
    let hightheta = Math.min(...thetas)
    let highoprice = Math.max(...oprices)
    return {
        curprice: s, 
        strike: k, 
        curdelta: curdelta[0], 
        highdelta: highdelta, 
        deltas: deltas, 
        curgamma: curdelta[1], 
        highgamma: highgamma, 
        gammas: gammas,  
        curvega: curdelta[2], 
        highvega: highvega, 
        vegas: vegas,  
        curtheta: curdelta[3], 
        hightheta: hightheta, 
        thetas: thetas,  
        curoprice: curdelta[4],
        highoprice: highoprice,
        oprices: oprices,
        prices: A
    }
}

export function putTimeDataset(s, k, T, R, V, D) {
    let pt = T/100
    let A = []
    for (let i = 0; i < 100; i++) {
        let time = (pt*i)
        A.push(time)
    }
    let deltas = []
    let gammas = []
    let vegas = []
    let thetas = []
    let oprices = []
    for (var i = 0; i < A.length; i++) {
        let Res = putData(s, k, A[i], R, V, D)
        deltas.push(Res[0])
        gammas.push(Res[1])
        vegas.push(Res[2])
        thetas.push(Res[3])
        oprices.push(Res[4])
    }
    return {
        curprice: T,  
        deltas: deltas, 
        gammas: gammas,  
        vegas: vegas,  
        thetas: thetas, 
        oprices: oprices, 
        prices: A
    }
}

export function putVDataset(s, k, T, R, V, D) {
    let low = V * 0.75
    let high = V * 1.25
    let diff = high - low
    let pt = diff/100
    let A = []
    for (let i = 0; i < 100; i++) {
        let strike = low+pt*i
        A.push(strike)
    }
    let deltas = []
    let gammas = []
    let vegas = []
    let thetas = []
    let oprices = []
    for (var i = 0; i < A.length; i++) {
        let Res = putData(s, k, T, R, A[i], D)
        deltas.push(Res[0])
        gammas.push(Res[1])
        vegas.push(Res[2])
        thetas.push(Res[3])
        oprices.push(Res[4])
    }
    let curdelta = putData(s, k, T, R, V, D)
    return {
        curprice: V, 
        strike: k, 
        curdelta: curdelta[0], 
        deltas: deltas, 
        curgamma: curdelta[1], 
        gammas: gammas,  
        curvega: curdelta[2], 
        vegas: vegas,  
        curtheta: curdelta[3], 
        thetas: thetas,  
        curoprice: curdelta[4],
        oprices: oprices,
        prices: A
    }
}

function callIV(s, k, R, t, v, D) {
    let r = R*0.01
    let q = D*0.01
    let d1 = (Math.log(s/k) + (r-q + Math.pow(v, 2)/2)*t) / (v*Math.sqrt(t))
    let d2 = d1 - v * Math.sqrt(t)
    let res = s * Math.exp(-q*t) * cdfNormal(d1, 0, 1) - k * Math.exp(-r*t)*cdfNormal(d2, 0, 1)
    let vega = Math.exp(-q*t) * s * Math.sqrt(t) * pdfNormal(d1)
    return [res, vega]
}

export function impliedVolatilityCall(target, s, k, To, R, D) {
    let T = To/365
    let max = 200
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

function putIV(s, k, R, t, v, D) {
    let r = R*0.01
    let q = D*0.01
    let d1 = (Math.log(s/k) + (r-q + Math.pow(v, 2)/2)*t) / (v*Math.sqrt(t))
    let d2 = d1 - v * Math.sqrt(t)
    let res = k * Math.exp(-r*t)*cdfNormal(-d2, 0, 1) - s * Math.exp(-q*t)*cdfNormal(-d1, 0, 1)
    let vega = Math.exp(-q*t) * s * Math.sqrt(t) * pdfNormal(d1)
    return [res, vega]
}

export function impliedVolatilityPut(target, s, k, To, R, D) {
    let T = To/365
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