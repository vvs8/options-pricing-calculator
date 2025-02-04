import { createContext, useState } from 'react';

export const PriceContext = createContext();

export const PriceProvider = ({ children }) => {
    const [values, setValues] = useState({
        stock: 100,
        strike: 100,
        i: "0",
        iv: 20,
        div: 0,
        type: "c",
        ytm: 1,
        ytmtype: "ytm",
    });

    return (
        <PriceContext.Provider value={{ values, setValues }}>
            {children}
        </PriceContext.Provider>
    );
};