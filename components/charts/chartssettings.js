export const optionsp = {
    responsive: true,
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            enabled:true,
            filter: function (tooltipItem) {
                return tooltipItem.datasetIndex < 2;
            }
        },
    },
    elements: {
        point:{
            radius: 3,
        },
    },
    scales: {
        y: {
           
            grid: {
              display: true,
              color: function(context) {
                    if (context.tick.value !== 0) {
                    return '#808080'
                    } 
                    return 'aliceblue';
                }
            },
            type: 'linear',
            ticks: {
                callback: function(value, index, ticks) {
                    return '$' + value;
                }
            }, 
            title: { display: true, text: 'Total Profit' }
          },
        x: {
            grid: {
                display: true,
                color: "#808080"
            },
            title: { display: true, text: 'Stock Price' },
            ticks: {
                callback: function(value, index, ticks) {
                    return '$' + value;
                }
            },
            type: 'linear',
        }, 
    }
};

export const options = {
    responsive: true,
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            enabled:true,
            filter: function (tooltipItem) {
                return tooltipItem.datasetIndex < 2;
            }
        },
    },
    elements: {
        point:{
            radius: 3,
        },
    },
    scales: {
        y: {
            grid: {
              display: false
            },
            type: 'linear',
          },
        x: {
          grid: {
            display: false
          },
          title: { display: true, text: 'Stock Price' },
          type: 'linear',   
        }, 
    }
};

export const options1 = {
    responsive: true,
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            enabled:true,
            filter: function (tooltipItem) {
                return tooltipItem.datasetIndex < 2;
            }
        },
    },
    elements: {
        point:{
            radius: 3,
        },
    },
    scales: {
        y: {
            grid: {
              display: false
            },
            type: 'linear',
          },
        x: {
          grid: {
            display: false
          },
          type: 'linear',
          title: { display: true, text: 'Days to Expiration' }, 
          reverse: true    
        }, 
    }
};

export const optionsv = {
    responsive: true,
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            enabled:true,
            filter: function (tooltipItem) {
                return tooltipItem.datasetIndex < 2;
            }
        },
    },
    elements: {
        point:{
            radius: 3,
        },
    },
    scales: {
        y: {
            grid: {
              display: false
            },
            type: 'linear',
          },
        x: {
          grid: {
            display: false
          },
          type: 'linear', 
          title: { display: true, text: 'Volatility %' },   
        }, 
    }
};

