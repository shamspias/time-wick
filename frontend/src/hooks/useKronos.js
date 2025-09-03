import {useState, useEffect, useCallback} from 'react';
import apiService from '../services/api';
import wsService from '../services/websocket';

export const useKronos = () => {
    const [models, setModels] = useState([]);
    const [currentModel, setCurrentModel] = useState(null);
    const [dataFiles, setDataFiles] = useState([]);
    const [currentData, setCurrentData] = useState(null);
    const [predictions, setPredictions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Initialize WebSocket connection
    useEffect(() => {
        const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
        wsService.connect(wsUrl);

        wsService.on('prediction_update', (data) => {
            setPredictions(prev => [...prev, data]);
        });

        return () => {
            wsService.disconnect();
        };
    }, []);

    // Load available models
    const loadAvailableModels = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await apiService.getAvailableModels();
            setModels(response.models);
            setCurrentModel(response.current);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load model
    const loadModel = useCallback(async (modelKey, device = 'cpu') => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await apiService.loadModel(modelKey, device);
            if (response.success) {
                setCurrentModel(modelKey);
                return true;
            }
            return false;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load data files
    const loadDataFiles = useCallback(async () => {
        try {
            setIsLoading(true);
            const files = await apiService.listDataFiles();
            setDataFiles(files);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Upload data
    const uploadData = useCallback(async (file) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await apiService.uploadData(file);
            if (response.success) {
                setCurrentData(response.info);
                await loadDataFiles(); // Refresh file list
                return true;
            }
            return false;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [loadDataFiles]);

    // Load data
    const loadData = useCallback(async (filePath) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await apiService.loadData(filePath);
            if (response.success) {
                setCurrentData(response.info);
                return true;
            }
            return false;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Run prediction
    const predict = useCallback(async (params) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await apiService.predict(params);
            if (response.success) {
                setPredictions(prev => [...prev, response]);
                return response;
            }
            return null;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load initial data
    useEffect(() => {
        loadAvailableModels();
        loadDataFiles();
    }, [loadAvailableModels, loadDataFiles]);

    return {
        // State
        models,
        currentModel,
        dataFiles,
        currentData,
        predictions,
        isLoading,
        error,

        // Actions
        loadModel,
        uploadData,
        loadData,
        predict,
        loadAvailableModels,
        loadDataFiles,
    };
};
