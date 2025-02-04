import { createContext, useState } from 'react';
import { initStartingDay, opdate } from '../ops/support';
import dayjs from 'dayjs'
var utc = require('dayjs/plugin/utc')
dayjs.extend(utc)

export const ProfitContext = createContext();

export const ProfitProvider = ({ children }) => {
    const [values, setValues] = useState({
        stock: 95,
        stockP: 95,
        shares: 0,
        i: 3.5,
        div: 0,
        action: 'long',
        date: initStartingDay(),
        time: initStartingDay(),
        stockFlag: false
    });
    
    const [timedisplay, setTimeDisplay] = useState('o');
    
    const [options, setOptions] = useState([{
        id: 'opt1',
        om: 1.05,
        op: 1.05,
        type: 'c',
        strike: 95,
        iv: false,
        ivauto: true,
        qty: 1,
        date: opdate,
        action: 'buy'
    }]);

    const [stockFlag, setStockflag] = useState(false)

    return (
        <ProfitContext.Provider value={{ values, options, timedisplay, stockFlag, setStockflag, setValues, setOptions, setTimeDisplay}}>
            {children}
        </ProfitContext.Provider>
    );
};