export function getInfos(choice) {
    switch(choice){
        case 'iv':
            return alert("Leave IV auto if you want it to be calculated automatically. Toggle the switch to enter IV manually. You can always toggle it back to auto to recalculate it automatically again.")
        case 'i':
            return alert("A risk-free interest rate is the theoretical rate of return on an investment that carries no risk of default. The U.S. 10-year Treasury bond yield is often used as a benchmark for the risk-free rate.")
        case 'om':
            return alert("Enter the current market price of the option.")
        case 'op':
            return alert("Enter the purchase price of the option. It equals the market price by default. If it's different from the market price, click on the lock on the right to unlock the field and enter it.")
        case 'startdate':
            return alert("Select the last trading date of the stock (underlying). By default, it can't fall on the weekend. If you are using the calendar icon, it won't allow you to select the weekends. However, you can still manually enter the date that falls on the weekend by typing it in the field in the following format mm/dd/yyyy.")
        case 'starttime':
            return alert("Select the last trading time of the stock (underlying). Default: Market Close or 4:00 pm ET.")
        case 'displaytime':
            return alert("Select the time that will be used to price the option for the days in the matrix. Market open - 9:30, market close - 16:00.")   
        case 'exp':
            return alert("Select the expiry date of the contract. By default, it can't fall on the weekend. If you are using the calendar icon, it won't allow you to select the weekends. However, you can still manually enter the date that falls on the weekend by typing it in the field in the following format mm/dd/yyyy.")
        case 'ivadj':
            return alert("Adjust the implied volatility for the underlying.")
        case 'switch':
            return alert("Switch to display total profit or loss, or percentage gain or loss on the max risk.")
        case 'stockP':
            return alert("Enter the stock purchase price, the number of shares purchased and whether it's long or short. This is not required and can be entered if you want to include a stock position in the calculation.")
    }
}

export function getStrategyInfos(choice) {
    switch(choice){
        case 'longcall':
            return ("A long call option is a bullish strategy where the trader buys a call option, expecting the underlying asset's price to rise.")
        case 'shortput':
            return ("A short put option is a bullish strategy where the trader sells a put option, expecting the underlying asset's price to rise or stay stable.")
        case 'bullcs':
            return ("A bull call spread is a bullish options strategy that involves buying a call option with a lower strike price and selling a call option with a higher strike price.")
        case 'bullps':
            return ("A bull put spread is a bullish options strategy that involves selling a put option with a higher strike price and buying a put option with a lower strike price.")
        case 'longput':
            return ("A long put is a bearish options strategy where an investor purchases a put option in the hope of profiting from a decline in the price of the underlying asset.")
        case 'shortcall':
            return ("A short call is a bearish options strategy that involves selling a call option with the expectation that the underlying stock price will decrease or remain below the strike price of the call option.")
        case 'bearcs':
            return ("A bear call spread is a bearish options strategy that involves selling a call option with a lower strike price and buying a call option with a higher strike price.")
        case 'bearps':
            return ("A bear put spread is a bearish options strategy that involves buying a put option with a higher strike price and selling a put option with a lower strike price.")
        case 'butterfly':
            return ("A butterfly is a neutral options strategy that involves buying two options at the same strike price and selling two options at a higher and lower strike price.")
        case 'collar':
            return ("A collar is a strategy that involves owning a stock, buying a put option to limit downside risk, and selling a call option to generate income.")
        case 'ic':
            return ("An iron condor is a neutral options strategy that involves selling an out-of-the-money call option and an out-of-the-money put option, while also simultaneously buying a farther out-of-the-money call option and a farther out-of-the-money put option.")
        case 'straddle':
            return ("A straddle is an options trading strategy that involves simultaneously buying a call option and a put option at the same strike price and expiration date.")
        case 'strangle':
            return ("A strangle is an options strategy that involves buying a call option and a put option with the same expiration date, but with different strike prices.")
    }
}


