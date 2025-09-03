import React, {useState} from 'react';
import {useKronos} from '../hooks/useKronos';
import ModelSelector from './ModelSelector';
import DataUploader from './DataUploader';
import PredictionChart from './PredictionChart';
import ControlPanel from './ControlPanel';

const Dashboard = () => {
    const {
        models,
        currentModel,
        dataFiles,
        currentData,
        predictions,
        isLoading,
        error,
        loadModel,
        uploadData,
        loadData,
        predict,
    } = useKronos();

    const [predictionParams, setPredictionParams] = useState({
        lookback: 400,
        pred_len: 120,
        temperature: 1.0,
        top_p: 0.9,
        sample_count: 1,
    });

    const handlePredict = async () => {
        if (!currentModel || !currentData) {
            alert('Please load a model and data first');
            return;
        }

        const result = await predict(predictionParams);
        if (result) {
            console.log('Prediction successful:', result);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
                    Kronos Financial Prediction Platform
                </h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <ModelSelector
                            models={models}
                            currentModel={currentModel}
                            onLoadModel={loadModel}
                            isLoading={isLoading}
                        />

                        <DataUploader
                            dataFiles={dataFiles}
                            currentData={currentData}
                            onUploadData={uploadData}
                            onLoadData={loadData}
                            isLoading={isLoading}
                        />

                        <ControlPanel
                            params={predictionParams}
                            onParamsChange={setPredictionParams}
                            onPredict={handlePredict}
                            isDisabled={!currentModel || !currentData || isLoading}
                        />
                    </div>

                    <div className="lg:col-span-2">
                        <PredictionChart
                            predictions={predictions}
                            currentData={currentData}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

// frontend/src/utils/chartConfig.js
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