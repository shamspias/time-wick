import React, {useEffect, useRef} from 'react';
import Plot from 'react-plotly.js';
import {TrendingUp, Maximize2, Download, RefreshCw} from 'lucide-react';

const PredictionChart = ({predictions, currentData}) => {
    const chartRef = useRef(null);

    const createCandlestickTrace = (data, name, colors) => ({
        type: 'candlestick',
        name,
        x: data.map(d => d.timestamp || d.index),
        open: data.map(d => d.open),
        high: data.map(d => d.high),
        low: data.map(d => d.low),
        close: data.map(d => d.close),
        increasing: {line: {color: colors.up}},
        decreasing: {line: {color: colors.down}},
    });

    const getChartData = () => {
        const traces = [];

        if (!predictions || predictions.length === 0) {
            // Show placeholder data
            const dummyData = Array.from({length: 100}, (_, i) => ({
                index: i,
                open: 100 + Math.random() * 10,
                high: 105 + Math.random() * 10,
                low: 95 + Math.random() * 10,
                close: 100 + Math.random() * 10,
            }));

            traces.push(createCandlestickTrace(
                dummyData,
                'Sample Data',
                {up: '#26A69A', down: '#EF5350'}
            ));
        } else {
            const latestPrediction = predictions[predictions.length - 1];

            // Historical data
            if (latestPrediction.chart_data?.historical) {
                traces.push(createCandlestickTrace(
                    latestPrediction.chart_data.historical,
                    'Historical',
                    {up: '#26A69A', down: '#EF5350'}
                ));
            }

            // Predictions
            if (latestPrediction.predictions) {
                traces.push(createCandlestickTrace(
                    latestPrediction.predictions,
                    'Predictions',
                    {up: '#66BB6A', down: '#FF7043'}
                ));
            }

            // Actual data for comparison
            if (latestPrediction.chart_data?.actual) {
                traces.push(createCandlestickTrace(
                    latestPrediction.chart_data.actual,
                    'Actual',
                    {up: '#FF9800', down: '#F44336'}
                ));
            }
        }

        return traces;
    };

    const layout = {
        title: 'K-Line Prediction Analysis',
        xaxis: {
            title: 'Time',
            type: 'category',
            rangeslider: {visible: false},
            gridcolor: '#e0e0e0',
        },
        yaxis: {
            title: 'Price',
            gridcolor: '#e0e0e0',
        },
        plot_bgcolor: '#fafafa',
        paper_bgcolor: '#ffffff',
        font: {
            family: 'system-ui, -apple-system, sans-serif',
            color: '#333',
        },
        showlegend: true,
        legend: {
            x: 0,
            y: 1,
            bgcolor: 'rgba(255,255,255,0.8)',
            bordercolor: '#e0e0e0',
            borderwidth: 1,
        },
        hovermode: 'x unified',
        height: 500,
        margin: {t: 50, b: 50, l: 50, r: 50},
    };

    const config = {
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['select2d', 'lasso2d'],
        toImageButtonOptions: {
            format: 'png',
            filename: 'kronos_prediction',
            height: 800,
            width: 1200,
            scale: 1,
        },
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2"/>
                    Prediction Chart
                </h3>
                <div className="flex space-x-2">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400"/>
                    </button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-400"/>
                    </button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <Download className="w-4 h-4 text-gray-600 dark:text-gray-400"/>
                    </button>
                </div>
            </div>

            <div className="relative">
                <Plot
                    data={getChartData()}
                    layout={layout}
                    config={config}
                    style={{width: '100%', height: '100%'}}
                    useResizeHandler={true}
                />
            </div>

            {predictions && predictions.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                    {predictions[predictions.length - 1].metrics && Object.entries(predictions[predictions.length - 1].metrics).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                                {key}
                            </p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {typeof value === 'number' ? value.toFixed(4) : value}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PredictionChart;
