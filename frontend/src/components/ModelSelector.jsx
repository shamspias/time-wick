import React, {useState} from 'react';
import {Cpu, Download, CheckCircle, AlertCircle, Loader} from 'lucide-react';

const ModelSelector = ({models, currentModel, onLoadModel, isLoading}) => {
    const [selectedModel, setSelectedModel] = useState('kronos-small');
    const [selectedDevice, setSelectedDevice] = useState('cpu');

    const modelSpecs = {
        'kronos-mini': {
            name: 'Kronos Mini',
            params: '4.1M',
            speed: 'Fast',
            accuracy: 'Good',
            icon: '🚀',
            color: 'blue'
        },
        'kronos-small': {
            name: 'Kronos Small',
            params: '24.7M',
            speed: 'Balanced',
            accuracy: 'Better',
            icon: '⚖️',
            color: 'green'
        },
        'kronos-base': {
            name: 'Kronos Base',
            params: '102.3M',
            speed: 'Slower',
            accuracy: 'Best',
            icon: '🎯',
            color: 'purple'
        }
    };

    const devices = [
        {value: 'cpu', label: 'CPU', icon: '💻'},
        {value: 'cuda', label: 'CUDA (NVIDIA)', icon: '🎮'},
        {value: 'mps', label: 'MPS (Apple)', icon: '🍎'}
    ];

    const handleLoadModel = async () => {
        const success = await onLoadModel(selectedModel, selectedDevice);
        if (success) {
            console.log('Model loaded successfully');
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Cpu className="w-5 h-5 mr-2"/>
                    Model Configuration
                </h3>
                {currentModel && (
                    <span className="flex items-center text-sm text-green-600 dark:text-green-400">
            <CheckCircle className="w-4 h-4 mr-1"/>
            Loaded
          </span>
                )}
            </div>

            <div className="space-y-4">
                {/* Model Selection Cards */}
                <div className="grid grid-cols-1 gap-3">
                    {Object.entries(modelSpecs).map(([key, spec]) => (
                        <div
                            key={key}
                            onClick={() => setSelectedModel(key)}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedModel === key
                                    ? `border-${spec.color}-500 bg-${spec.color}-50 dark:bg-${spec.color}-900/20`
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl">{spec.icon}</span>
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                            {spec.name}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {spec.params} params • {spec.speed} • {spec.accuracy}
                                        </p>
                                    </div>
                                </div>
                                {selectedModel === key && (
                                    <CheckCircle className="w-5 h-5 text-blue-500"/>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Device Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Computing Device
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {devices.map((device) => (
                            <button
                                key={device.value}
                                onClick={() => setSelectedDevice(device.value)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    selectedDevice === device.value
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                <span className="mr-1">{device.icon}</span>
                                {device.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Load Button */}
                <button
                    onClick={handleLoadModel}
                    disabled={isLoading}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center ${
                        isLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg'
                    }`}
                >
                    {isLoading ? (
                        <>
                            <Loader className="w-5 h-5 mr-2 animate-spin"/>
                            Loading Model...
                        </>
                    ) : (
                        <>
                            <Download className="w-5 h-5 mr-2"/>
                            Load Model
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ModelSelector;
