import React, {useState} from 'react';
import {Sliders, Play, Info, Save} from 'lucide-react';

const ControlPanel = ({params, onParamsChange, onPredict, isDisabled}) => {
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleParamChange = (key, value) => {
        onParamsChange({...params, [key]: value});
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Sliders className="w-5 h-5 mr-2"/>
                    Prediction Settings
                </h3>
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                    {showAdvanced ? 'Hide' : 'Show'} Advanced
                </button>
            </div>

            <div className="space-y-4">
                {/* Temperature */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Temperature
                        </label>
                        <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {params.temperature}
            </span>
                    </div>
                    <input
                        type="range"
                        min="0.1"
                        max="2.0"
                        step="0.1"
                        value={params.temperature}
                        onChange={(e) => handleParamChange('temperature', parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Conservative</span>
                        <span>Creative</span>
                    </div>
                </div>

                {/* Top-P */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Nucleus Sampling (Top-P)
                        </label>
                        <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {params.top_p}
            </span>
                    </div>
                    <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        value={params.top_p}
                        onChange={(e) => handleParamChange('top_p', parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                {/* Sample Count */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Sample Count
                        </label>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handleParamChange('sample_count', Math.max(1, params.sample_count - 1))}
                                className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                            >
                                -
                            </button>
                            <span
                                className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded min-w-[40px] text-center">
                {params.sample_count}
              </span>
                            <button
                                onClick={() => handleParamChange('sample_count', Math.min(5, params.sample_count + 1))}
                                className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>

                {/* Advanced Settings */}
                {showAdvanced && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Lookback Window
                            </label>
                            <input
                                type="number"
                                value={params.lookback}
                                onChange={(e) => handleParamChange('lookback', parseInt(e.target.value))}
                                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                min="100"
                                max="1000"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Prediction Length
                            </label>
                            <input
                                type="number"
                                value={params.pred_len}
                                onChange={(e) => handleParamChange('pred_len', parseInt(e.target.value))}
                                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                min="10"
                                max="500"
                            />
                        </div>
                    </div>
                )}

                {/* Info Box */}
                <div
                    className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <div className="flex items-start">
                        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0"/>
                        <p className="text-xs text-blue-800 dark:text-blue-300">
                            Higher temperature and top-p values increase prediction diversity but may reduce accuracy.
                            Multiple samples improve robustness.
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                    <button
                        onClick={onPredict}
                        disabled={isDisabled}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center ${
                            isDisabled
                                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-lg'
                        }`}
                    >
                        <Play className="w-5 h-5 mr-2"/>
                        Run Prediction
                    </button>
                    <button
                        className="px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        title="Save Configuration"
                    >
                        <Save className="w-5 h-5 text-gray-600 dark:text-gray-400"/>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ControlPanel;