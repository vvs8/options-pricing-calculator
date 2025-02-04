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
import Slider from '@mui/material/Slider';

import { optionsp } from './chartssettings'

import styles from '../../components/css/OptionsChart.module.css'


const OptionChart = (df) => {
    let times = df.props.times
    const [curTime, setCurtime] = useState(0)
    const [curDate, setCurdate] = useState(times[0].date)
    let stockprices = []
    let profits = []
    let A = df.props.prices
    let T = df.props.times.length-1
    console.log(df.props)
    for(let i = 0; i<A.length; i++) {
        stockprices.push(A[i].stock)
        profits.push(A[i].row[curTime].net*100+A[i].stocknet)
    }
    const data = {
        labels: stockprices,
        datasets: [{
            label: 'Total Profit',
            id: 1,
            data: profits,
            borderColor: 'mediumvioletred',
            backgroundColor: 'mediumvioletred',
            elements: {point:{radius: 3, pointStyle: false}},
        },
       ],
    };

    function handleResubmit(e) {
        let res = (e.target.value)
        setCurtime(res)
        setCurdate(times[res].date)
    }
    
    return (
        <>
            <div className={styles.main}>
                <div className={styles.label}>
                    {curDate}
                </div>
                <br/>
                <div className={styles.slider}>
                    <Slider
                        defaultValue={0}
                        step={1}
                        marks
                        min={0}
                        max={T}
                        onChange={handleResubmit}
                        style={{color:"white"}}
                    />
                </div>
                <br/>
                <br/>
                <div>
                    <Line options={optionsp} data={data}/>
                </div>
            </div>
        </>
    )
}

export default OptionChart;