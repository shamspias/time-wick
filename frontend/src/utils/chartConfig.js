export const candlestickLayout = {
    title: 'Financial Prediction Chart',
    xaxis: {
        title: 'Time',
        type: 'date',
        rangeslider: {visible: false},
    },
    yaxis: {
        title: 'Price',
        fixedrange: false,
    },
    template: 'plotly_dark',
    height: 600,
    showlegend: true,
    hovermode: 'x unified',
};

export const createCandlestickTrace = (data, name, color) => ({
    type: 'candlestick',
    name,
    x: data.map(d => d.timestamp),
    open: data.map(d => d.open),
    high: data.map(d => d.high),
    low: data.map(d => d.low),
    close: data.map(d => d.close),
    increasing: {line: {color: color.up}},
    decreasing: {line: {color: color.down}},
});

export const chartColors = {
    historical: {up: '#26A69A', down: '#EF5350'},
    predicted: {up: '#66BB6A', down: '#FF7043'},
    actual: {up: '#FF9800', down: '#F44336'},
};