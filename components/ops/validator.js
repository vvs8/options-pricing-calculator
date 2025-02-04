import { object, number } from 'yup';
import dayjs from 'dayjs'
var utc = require('dayjs/plugin/utc')
dayjs.extend(utc)

const clearFalsyFields = obj => Object.keys(obj).reduce((acc, key) => (obj[key] ? { ...acc, [key]: obj[key] } : { ...acc, [key]: undefined }), {});

const stockSchema = object({
    stock: 
        number()
        .typeError('Stock price must be a number')
        .max(9999999, "Stock price cannot be more than $9999999")
        .positive("Stock price must be greater than 0")
        .required('Stock price is required'),
    div: 
        number()
        .typeError('Divident must be a number')
        .min(0, "Divident cannot be negative"),
    i: 
        number()
        .typeError('Interest rate must be a number')
        .required('Interest rate is required')
        .min(0, "Interest cannot be negative"),
    stockP: 
        number()
        .typeError('Stock purchase price must be a number')
        .max(9999, "Stock purchase price cannot be more than $9999")
        .min(0, "Stock purchase price cannot be negative"),
    shares: 
        number()
        .typeError('Number of shares must be a number')
        .min(0, "Number of shares cannot be negative")
        .integer("Number of shares must be an integer"),
})

export function validatorStock(data, lastdate) {
    data = clearFalsyFields(data)
    try {
        let res = stockSchema.validateSync(data, {abortEarly: false})
        return {valid: true, error: []}
    } catch (err) {
        return {valid: false, error: err.errors, path: err.path}
    } 
}

const optionSchema = object({
    om: 
        number()
        .typeError("Option price must be a number")
        .positive("Option price must be more than 0")
        .required("Option price is required"),
    op: 
        number()
        .typeError("Option purchase price must be a number")
        .positive("Option purchase price must be more than 0")
        .required("Option purchase price is required"),
    strike: 
        number()
        .typeError("Option strike price must be a number")
        .positive("Option strike price must be more than 0")
        .required("Option strike price is required"),
    iv: 
        number()
        .typeError("Implied volatility must be a number")
        .positive("Implied volatility must be more than 0")
        .required("Implied volatility is required"),
    qty: 
        number()
        .typeError("Quantity must be a number")
        .positive("Quantity must be more than 0")
        .integer("Quantity must be an integer")
        .required("Quantity is required"),
})

export function validatorOption(array) {
    try {
        for (var i = 0; i<array.length; i++) {
            let data = array[i]
            data = clearFalsyFields(data)
            !data.ivauto ? null : data = {...data, iv: 20}
            let res = optionSchema.validateSync(data, {abortEarly: false})
        }
        return {valid: true, error: []}
    } catch (err) {
        return {valid: false, error: err.errors, path: err.path}
    }
}

const priceSchema = object({
    stock: 
        number()
        .typeError('Stock price must be a number')
        .positive("Stock price must be greater than 0")
        .required('Stock price is required'),
    iv: 
        number()
        .typeError("Implied volatility must be a number")
        .positive("Implied volatility must be more than 0")
        .required("Implied volatility is required"),
    ytm: 
        number()
        .typeError("Time to expiry must be a number")
        .positive("Time to expiry must be more than 0")
        .required("Time to expiry is required")
        .max(5, "Time to expiry cannot be more than 5 years"),
    i: 
        number()
        .typeError('Interest rate must be a number')
        .required('Interest rate is required')
        .min(0, "Interest cannot be negative"),
    strike: 
        number()
        .typeError("Option strike price must be a number")
        .positive("Option strike price must be more than 0")
        .required("Option strike price is required"),
    div: 
        number()
        .typeError('Divident must be a number')
        .min(0, "Divident cannot be negative"),
   
})

export function validatorPrice(data) {
    data = clearFalsyFields(data)
    try {
        let res = priceSchema.validateSync(data, {abortEarly: false})
        return {valid: true, error: []}
    } catch (err) {
        return {valid: false, error: err.errors, path: err.path}
    } 
}

const volSchema = object({
    om: 
        number()
        .typeError("Option price must be a number")
        .positive("Option price must be more than 0")
        .required("Option price is required"),
    stock: 
        number()
        .typeError('Stock price must be a number')
        .positive("Stock price must be greater than 0")
        .required('Stock price is required'),
    ytm: 
        number()
        .typeError("Time to expiry must be a number")
        .positive("Time to expiry must be more than 0")
        .required("Time to expiry is required")
        .max(5, "Time to expiry cannot be more than 5 years"),
    i: 
        number()
        .typeError('Interest rate must be a number')
        .required('Interest rate is required')
        .min(0, "Interest cannot be negative"),
    strike: 
        number()
        .typeError("Option strike price must be a number")
        .positive("Option strike price must be more than 0")
        .required("Option strike price is required"),
    div: 
        number()
        .typeError('Divident must be a number')
        .min(0, "Divident cannot be negative"),
   
})

export function validatorIV(data) {
    data = clearFalsyFields(data)
    try {
        let res = volSchema.validateSync(data, {abortEarly: false})
        return {valid: true, error: []}
    } catch (err) {
        return {valid: false, error: err.errors, path: err.path}
    } 
}

export function validatorPriceRange(high, low, cur) {
    try {
        if(low>high) throw 'Incorrect price range'
        if(low<0) throw 'Price cannot be negative'
        if(high>cur*10) throw 'Price exceeded its maximum 1000% from the current price. Please select lower price range.'
        return {valid: true, error: []}
    } catch (err) {
        return {valid: false, error: [err]} 
    }
}

export function validatorDatez(lastdate, d, options) {
    try {
        let date = lastdate.isValid();
        if (!date) throw 'Invalid date'
        for (var i = 0; i<options.length; i++) {
            let od = options[i].date
            let eod = od.isValid()
            if(!eod) throw 'Invalid option date'
        }
        let T = d.diff(lastdate)/(1000 * 3600 * 24)/365
        if(T>5) throw "Time to expiry cannot be more than 5 years"
        if(T<0) throw "Time to expiry cannot be negative"
        return {valid: true, error: []}
    } catch (err) {
        return {valid: false, error: [err]} 
    }
}



