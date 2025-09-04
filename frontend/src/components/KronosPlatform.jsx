import React, {useState, useEffect} from 'react';
import {
    Upload, TrendingUp, Cpu, BarChart3, Clock, Zap, Moon, Sun, Menu, X, ChevronRight, AlertCircle, CheckCircle
} from 'lucide-react';

const KronosPlatform = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [modelStatus, setModelStatus] = useState({loaded: false, current: null});
    const [selectedModel, setSelectedModel] = useState('kronos-small');
    const [selectedDevice, setSelectedDevice] = useState('cpu');
    const [dataLoaded, setDataLoaded] = useState(false);
    const [predictionParams, setPredictionParams] = useState({
        temperature: 1.0, topP: 0.9, sampleCount: 1
    });
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    const models = {
        'kronos-mini': {name: 'Kronos Mini', params: '4.1M', speed: 'Fast'},
        'kronos-small': {name: 'Kronos Small', params: '24.7M', speed: 'Balanced'},
        'kronos-base': {name: 'Kronos Base', params: '102.3M', speed: 'Accurate'}
    };

    const showNotification = (type, message) => {
        setNotification({type, message});
        setTimeout(() => setNotification(null), 5000);
    };

    const loadModel = async () => {
        setIsLoading(true);
        try {
            // Simulated API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            setModelStatus({loaded: true, current: selectedModel});
            showNotification('success', `Model ${models[selectedModel].name} loaded successfully`);
        } catch (error) {
            showNotification('error', 'Failed to load model');
        } finally {
            setIsLoading(false);
        }
    };

    const runPrediction = async () => {
        if (!modelStatus.loaded || !dataLoaded) {
            showNotification('error', 'Please load model and data first');
            return;
        }

        setIsLoading(true);
        try {
            // Simulated prediction
            await new Promise(resolve => setTimeout(resolve, 3000));
            showNotification('success', 'Prediction completed successfully');
        } catch (error) {
            showNotification('error', 'Prediction failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (<div
        className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
        {/* Header */}
        <header
            className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-50 backdrop-blur-lg bg-opacity-90`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <TrendingUp className="w-8 h-8 text-indigo-600 mr-3"/>
                        <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Kronos Platform
                        </h1>
                    </div>

                    <nav className="hidden md:flex space-x-8">
                        {['Dashboard', 'Models', 'Data', 'Analytics'].map((item) => (<button
                            key={item}
                            onClick={() => setActiveTab(item.toLowerCase())}
                            className={`${activeTab === item.toLowerCase() ? 'text-indigo-600 border-b-2 border-indigo-600' : darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} px-3 py-2 text-sm font-medium transition-colors`}
                        >
                            {item}
                        </button>))}
                    </nav>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}
                        >
                            {darkMode ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
                        </button>

                        <button
                            className="md:hidden p-2"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (<div className={`md:hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} border-t`}>
                {['Dashboard', 'Models', 'Data', 'Analytics'].map((item) => (<button
                    key={item}
                    onClick={() => {
                        setActiveTab(item.toLowerCase());
                        setMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 ${activeTab === item.toLowerCase() ? 'bg-indigo-50 text-indigo-600' : darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                >
                    {item}
                </button>))}
            </div>)}
        </header>

        {/* Notification */}
        {notification && (<div
            className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-2 ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5"/> :
                <AlertCircle className="w-5 h-5"/>}
            <span>{notification.message}</span>
        </div>)}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Dashboard */}
            {activeTab === 'dashboard' && (<div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[{
                        title: 'Model Status',
                        value: modelStatus.loaded ? 'Loaded' : 'Not Loaded',
                        icon: Cpu,
                        color: 'blue'
                    }, {
                        title: 'Data Points',
                        value: dataLoaded ? '52,000' : '0',
                        icon: BarChart3,
                        color: 'green'
                    }, {
                        title: 'Predictions',
                        value: '124',
                        icon: TrendingUp,
                        color: 'purple'
                    }, {title: 'Accuracy', value: '94.5%', icon: Zap, color: 'yellow'}].map((stat, idx) => (<div
                        key={idx}
                        className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stat.title}</p>
                                <p className={`text-2xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {stat.value}
                                </p>
                            </div>
                            <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                                <stat.icon className={`w-6 h-6 text-${stat.color}-600`}/>
                            </div>
                        </div>
                    </div>))}
                </div>

                {/* Control Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Model Selection */}
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Model Configuration
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label
                                    className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Select Model
                                </label>
                                <select
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                >
                                    {Object.entries(models).map(([key, model]) => (
                                        <option key={key} value={key}>
                                            {model.name} ({model.params})
                                        </option>))}
                                </select>
                            </div>

                            <div>
                                <label
                                    className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Device
                                </label>
                                <select
                                    value={selectedDevice}
                                    onChange={(e) => setSelectedDevice(e.target.value)}
                                    className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                >
                                    <option value="cpu">CPU</option>
                                    <option value="cuda">CUDA (GPU)</option>
                                    <option value="mps">MPS (Apple)</option>
                                </select>
                            </div>

                            <button
                                onClick={loadModel}
                                disabled={isLoading}
                                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                            >
                                {isLoading ? 'Loading...' : 'Load Model'}
                            </button>
                        </div>
                    </div>

                    {/* Data Upload */}
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Data Management
                        </h3>

                        <div className="space-y-4">
                            <div
                                className={`border-2 border-dashed ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg p-8 text-center`}>
                                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4"/>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Drop your CSV or Feather files here
                                </p>
                                <button
                                    onClick={() => {
                                        setDataLoaded(true);
                                        showNotification('success', 'Data loaded successfully');
                                    }}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Browse Files
                                </button>
                            </div>

                            {dataLoaded && (
                                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        <span className="font-medium">Loaded:</span> BTC_USDT_5min.csv
                                    </p>
                                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        52,000 data points • 5-minute intervals
                                    </p>
                                </div>)}
                        </div>
                    </div>

                    {/* Prediction Parameters */}
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Prediction Settings
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label
                                    className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Temperature: {predictionParams.temperature}
                                </label>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="2.0"
                                    step="0.1"
                                    value={predictionParams.temperature}
                                    onChange={(e) => setPredictionParams({
                                        ...predictionParams, temperature: parseFloat(e.target.value)
                                    })}
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label
                                    className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Top-P: {predictionParams.topP}
                                </label>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="1.0"
                                    step="0.1"
                                    value={predictionParams.topP}
                                    onChange={(e) => setPredictionParams({
                                        ...predictionParams, topP: parseFloat(e.target.value)
                                    })}
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label
                                    className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Sample Count
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={predictionParams.sampleCount}
                                    onChange={(e) => setPredictionParams({
                                        ...predictionParams, sampleCount: parseInt(e.target.value)
                                    })}
                                    className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                />
                            </div>

                            <button
                                onClick={runPrediction}
                                disabled={!modelStatus.loaded || !dataLoaded || isLoading}
                                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${!modelStatus.loaded || !dataLoaded || isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                            >
                                <TrendingUp className="w-5 h-5 mr-2"/>
                                {isLoading ? 'Running...' : 'Run Prediction'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Chart Section */}
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                    <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Prediction Chart
                    </h3>
                    <div
                        className={`h-96 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-lg flex items-center justify-center`}>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Chart will appear here after prediction
                        </p>
                    </div>
                </div>
            </div>)}

            {/* Other Tabs */}
            {activeTab !== 'dashboard' && (
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
                    <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    </h2>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {activeTab === 'models' && 'Manage and configure AI models for prediction'}
                        {activeTab === 'data' && 'Upload and manage your financial datasets'}
                        {activeTab === 'analytics' && 'View detailed analytics and performance metrics'}
                    </p>
                </div>)}
        </main>
    </div>);
};

export default KronosPlatform;