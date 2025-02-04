import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarController,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

import { options, optionsv, options1 } from './chartssettings'

import styles from '../../components/css/Price.module.css'

const LineChart = (df) => {
    const data0 = {
        labels: df.props.prices,
        datasets: [{
            label: 'Current Option Price',
            id: 3,
            type: 'line',
            data: [{x: df.props.curprice, y: df.props.curoprice}],
            backgroundColor: 'rgb(0, 102, 255)',
            elements: {point:{radius: 3.9}}
        }, {
            label: 'Option Price',
            id: 1,
            data: df.props.oprices,
            borderColor: 'rgb(0, 153, 153)',
            backgroundColor: 'rgb(0, 153, 153)',
            elements: {point:{radius: 3, pointStyle: false}},
        }, (df.props.prices[0] <= df.props.strike && df.props.prices[df.props.prices.length-1] >= df.props.strike) && {
            label: 'Strike',
            id: 2,
            type: 'bar',
            data: [{x: df.props.strike, y: df.props.highoprice}],
            barThickness: 1,
            backgroundColor: 'gray',
        }],
    };

    const data = {
        labels: df.props.prices,
        datasets: [{
            label: 'Current Delta',
            id: 3,
            type: 'line',
            data: [{x: df.props.curprice, y: df.props.curdelta}],
            backgroundColor: 'rgb(0, 102, 255)',
            elements: {point:{radius: 3.9}}
        }, {
            label: 'Delta',
            id: 1,
            data: df.props.deltas,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgb(255, 99, 132)',
            elements: {point:{radius: 3, pointStyle: false}},
        }, (df.props.prices[0] <= df.props.strike && df.props.prices[df.props.prices.length-1] >= df.props.strike) && {
            label: 'Strike',
            id: 2,
            type: 'bar',
            data: [{x: df.props.strike, y: df.props.highdelta}],
            barThickness: 1,
            backgroundColor: 'gray',
        }],
    };
    
    const datagamma = {
        labels: df.props.prices,
        datasets: [{
            label: 'Current Gamma',
            id: 3,
            type: 'line',
            data: [{x: df.props.curprice, y: df.props.curgamma}],
            backgroundColor: 'rgb(0, 102, 255)',
            elements: {point:{radius: 3.9}}
        }, {
            label: 'Gamma',
            id: 1,
            data: df.props.gammas,
            borderColor: 'rgb(204, 0, 153)',
            backgroundColor: 'rgb(204, 0, 153)',
            elements: {point:{radius: 3,pointStyle: false}},
        }, (df.props.prices[0] <= df.props.strike && df.props.prices[df.props.prices.length-1] >= df.props.strike) && {
            label: 'Strike',
            id: 2,
            type: 'bar',
            data: [{x: df.props.strike, y: df.props.highgamma}],
            barThickness: 1,
            backgroundColor: 'gray',
        }],
    };
    
    const datavega = {
        labels: df.props.prices,
        datasets: [{
            label: 'Current Vega',
            id: 3,
            type: 'line',
            data: [{x: df.props.curprice, y: df.props.curvega}],
            backgroundColor: 'rgb(0, 102, 255)',
            elements: {point:{radius: 3.9}}
        }, {
            label: 'Vega',
            id: 1,
            data: df.props.vegas,
            borderColor: 'gray',
            backgroundColor: 'gray',
            elements: {point:{radius: 3, pointStyle: false}},
        }, (df.props.prices[0] <= df.props.strike && df.props.prices[df.props.prices.length-1] >= df.props.strike) && {
            label: 'Strike',
            id: 2,
            type: 'bar',
            data: [{x: df.props.strike, y: df.props.highvega}],
            barThickness: 1,
            backgroundColor: 'gray',
        }],
    };
    
    const datatheta = {
        labels: df.props.prices,
        datasets: [{
            label: 'Current Theta',
            id: 3,
            type: 'line',
            data: [{x: df.props.curprice, y: df.props.curtheta}],
            backgroundColor: 'rgb(0, 102, 255)',
            elements: {point:{radius: 3.9}}
        }, {
            label: 'Theta',
            id: 1,
            data: df.props.thetas,
            borderColor: 'green',
            backgroundColor: 'green',
            elements: {point:{radius: 3, pointStyle: false}},
        }, (df.props.prices[0] <= df.props.strike && df.props.prices[df.props.prices.length-1] >= df.props.strike) && {
            label: 'Strike',
            id: 2,
            type: 'bar',
            data: [{x: df.props.strike, y: df.props.hightheta}],
            barThickness: 1,
            backgroundColor: 'gray',
        }],
    };

    const datav0 = {
        labels: df.propsv.prices,
        datasets: [{
            label: 'Current Option Price',
            id: 3,
            type: 'line',
            data: [{x: df.propsv.curprice, y: df.propsv.curoprice}],
            backgroundColor: 'rgb(0, 102, 255)',
            elements: {point:{radius: 3.9}}
        }, {
            label: 'Option Price',
            id: 1,
            data: df.propsv.oprices,
            borderColor: 'rgb(0, 153, 153)',
            backgroundColor: 'rgb(0, 153, 153)',
            elements: {point:{radius: 3, pointStyle: false}},
        },],
    };

    const datav = {
        labels: df.propsv.prices,
        datasets: [{
            label: 'Current Delta',
            id: 3,
            type: 'line',
            data: [{x: df.propsv.curprice, y: df.propsv.curdelta}],
            backgroundColor: 'rgb(0, 102, 255)',
            elements: {point:{radius: 3.9}}
        }, {
            label: 'Delta',
            id: 1,
            data: df.propsv.deltas,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgb(255, 99, 132)',
            elements: {point:{radius: 3, pointStyle: false}},
        },],
    };
    
    const datagammav = {
        labels: df.propsv.prices,
        datasets: [{
            label: 'Current Gamma',
            id: 3,
            type: 'line',
            data: [{x: df.propsv.curprice, y: df.propsv.curgamma}],
            backgroundColor: 'rgb(0, 102, 255)',
            elements: {point:{radius: 3.9}}
        }, {
            label: 'Gamma',
            id: 1,
            data: df.propsv.gammas,
            borderColor: 'rgb(204, 0, 153)',
            backgroundColor: 'rgb(204, 0, 153)',
            elements: {point:{radius: 3,pointStyle: false}},
        }],
    };
    
    const datavegav = {
        labels: df.propsv.prices,
        datasets: [{
            label: 'Current Vega',
            id: 3,
            type: 'line',
            data: [{x: df.propsv.curprice, y: df.propsv.curvega}],
            backgroundColor: 'rgb(0, 102, 255)',
            elements: {point:{radius: 3.9}}
        }, {
            label: 'Vega',
            id: 1,
            data: df.propsv.vegas,
            borderColor: 'grey',
            backgroundColor: 'gray',
            elements: {point:{radius: 3, pointStyle: false}},
        }],
    };
    
    const datathetav = {
        labels: df.propsv.prices,
        datasets: [{
            label: 'Current Theta',
            id: 3,
            type: 'line',
            data: [{x: df.propsv.curprice, y: df.propsv.curtheta}],
            backgroundColor: 'rgb(0, 102, 255)',
            elements: {point:{radius: 3.9}}
        }, {
            label: 'Theta',
            id: 1,
            data: df.propsv.thetas,
            borderColor: 'green',
            backgroundColor: 'green',
            elements: {point:{radius: 3, pointStyle: false}},
        }],
    };


    const dataT0 = {
        labels: df.props1.prices,
        datasets: [{
            label: 'Option Price',
            id: 1,
            data: df.props1.oprices,
            borderColor: 'rgb(0, 153, 153)',
            backgroundColor: 'rgb(0, 153, 153)',
            elements: {point:{radius: 3, pointStyle: false}},
        }],
    };

    const dataT = {
        labels: df.props1.prices,
        datasets: [{
            label: 'Delta',
            id: 1,
            data: df.props1.deltas,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgb(255, 99, 132)',
            elements: {point:{radius: 3, pointStyle: false}},
        }],
    };
    
    const datagammaT = {
        labels: df.props1.prices,
        datasets: [{
            label: 'Gamma',
            id: 1,
            data: df.props1.gammas,
            borderColor: 'rgb(204, 0, 153)',
            backgroundColor: 'rgb(204, 0, 153)',
            elements: {point:{radius: 3,pointStyle: false}},
        }],
    };
    
    const datavegaT = {
        labels: df.props1.prices,
        datasets: [{
            label: 'Vega',
            id: 1,
            data: df.props1.vegas,
            borderColor: 'grey',
            backgroundColor: 'grey',
            elements: {point:{radius: 3, pointStyle: false}},
        }],
    };
    
    const datathetaT = {
        labels: df.props1.prices,
        datasets: [{
            label: 'Theta',
            id: 1,
            data: df.props1.thetas,
            borderColor: 'green',
            backgroundColor: 'green',
            elements: {point:{radius: 3, pointStyle: false}},
        }],
    };

    const [flag0, setFlag0] = useState(0)
    const [flag1, setFlag1] = useState(0)
    const [flag2, setFlag2] = useState(0)
    const [flag3, setFlag3] = useState(0)
    const [flag4, setFlag4] = useState(0)

    const [graph, setGraph] = useState(0)

    const returnGraph = (o) => {
        switch (o) {
            case 0:
                return (
                    <>
                        {flag0===0 && <Line options={options} data={data0} />}
                        {flag0===1 && <Line options={options1} data={dataT0} />}
                        {flag0===2 && <Line options={optionsv} data={datav0} />}
                        <div className={styles.switcher}>
                            <div className={styles.b_container}>
                                <a className={flag0!==0 ? styles.switch : styles.switch_a} onClick={()=>setFlag0(0)}>Stock Price</a>
                            </div>
                            <div className={styles.b_container}>
                                <a className={flag0!==2 ? styles.switch : styles.switch_a} onClick={()=>setFlag0(2)}>Volatility</a>
                            </div>
                            <div className={styles.b_container}>
                                <a className={flag0!==1 ? styles.switch : styles.switch_a} onClick={()=>setFlag0(1)}>Time</a>
                            </div>
                        </div>
                    </>
                )
            case 1:
                return (
                    <>
                        {flag1===0 && <Line options={options} data={data} />}
                        {flag1===1 && <Line options={options1} data={dataT} />}
                        {flag1===2 && <Line options={optionsv} data={datav} />}
                        <div className={styles.switcher}>
                            <div className={styles.b_container}>
                                <a className={flag1!==0 ? styles.switch : styles.switch_a} onClick={()=>setFlag1(0)}>Stock Price</a>
                            </div>
                            <div className={styles.b_container}>
                                <a className={flag1!==2 ? styles.switch : styles.switch_a} onClick={()=>setFlag1(2)}>Volatility</a>
                            </div>
                            <div className={styles.b_container}>
                                <a className={flag1!==1 ? styles.switch : styles.switch_a} onClick={()=>setFlag1(1)}>Time</a>
                            </div>
                        </div>
                    </>
                )
            case 2:
                return (
                    <>
                        {flag2===0 && <Line options={options} data={datagamma} />}
                        {flag2===1 && <Line options={options1} data={datagammaT} />}
                        {flag2===2 && <Line options={optionsv} data={datagammav} />}
                        <div className={styles.switcher}>
                            <div className={styles.b_container}>
                                <a className={flag2!==0 ? styles.switch : styles.switch_a} onClick={()=>setFlag2(0)}>Stock Price</a>
                            </div>
                            <div className={styles.b_container}>
                                <a className={flag2!==2 ? styles.switch : styles.switch_a} onClick={()=>setFlag2(2)}>Volatility</a>
                            </div>
                            <div className={styles.b_container}>
                                <a className={flag2!==1 ? styles.switch : styles.switch_a} onClick={()=>setFlag2(1)}>Time</a>
                            </div>
                        </div>
                    </>
                )
            case 3:
                return (
                    <>
                        {flag3===0 && <Line options={options} data={datavega} />}
                        {flag3===1 && <Line options={options1} data={datavegaT} />}
                        {flag3===2 && <Line options={optionsv} data={datavegav} />}
                        <div className={styles.switcher}>
                            <div className={styles.b_container}>
                                <a className={flag3!==0 ? styles.switch : styles.switch_a} onClick={()=>setFlag3(0)}>Stock Price</a>
                            </div>
                            <div className={styles.b_container}>
                                <a className={flag3!==2 ? styles.switch : styles.switch_a} onClick={()=>setFlag3(2)}>Volatility</a>
                            </div>
                            <div className={styles.b_container}>
                                <a className={flag3!==1 ? styles.switch : styles.switch_a} onClick={()=>setFlag3(1)}>Time</a>
                            </div>
                        </div>
                    </>
                )
            case 4:
                return (
                    <>
                        {flag4===0 && <Line options={options} data={datatheta} />}
                        {flag4===1 && <Line options={options1} data={datathetaT} />}
                        {flag4===2 && <Line options={optionsv} data={datathetav} />} 
                        <div className={styles.switcher}>
                            <div className={styles.b_container}>
                                <a className={flag4!==0 ? styles.switch : styles.switch_a} onClick={()=>setFlag4(0)}>Stock Price</a>
                            </div>
                            <div className={styles.b_container}>
                                <a className={flag4!==2 ? styles.switch : styles.switch_a} onClick={()=>setFlag4(2)}>Volatility</a>
                            </div>
                            <div className={styles.b_container}>
                                <a className={flag4!==1 ? styles.switch : styles.switch_a} onClick={()=>setFlag4(1)}>Time</a>
                            </div>
                        </div>
                    </>  
                )
        }
    }


    return (
        <div>
            <div>
            <div className={styles.swi_container}>
                <div className={styles.b_container}>
                    <a className={graph!==0 ? styles.swi : styles.swi_a} onClick={()=>setGraph(0)}>$ Option Price</a>
                </div>
                <div className={styles.b_container}>
                    <a className={graph!==1 ? styles.swi : styles.swi_a} onClick={()=>setGraph(1)}>Δ Delta</a>
                </div>
                <div className={styles.b_container}>
                    <a className={graph!==2 ? styles.swi : styles.swi_a} onClick={()=>setGraph(2)}>Γ Gamma</a>
                </div>
                <div className={styles.b_container}>
                    <a className={graph!==3 ? styles.swi : styles.swi_a} onClick={()=>setGraph(3)}>v Vega</a>
                </div>
                <div className={styles.b_container}>
                    <a className={graph!==4 ? styles.swi : styles.swi_a} onClick={()=>setGraph(4)}>Θ Theta</a>
                </div>
            </div>
            <br/>
            </div>
            {returnGraph(graph)}
        </div>
    )
}

export default LineChart;
