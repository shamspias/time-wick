import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiService {
    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor
        this.client.interceptors.request.use(
            (config) => {
                // Add auth token if available
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor
        this.client.interceptors.response.use(
            (response) => response.data,
            (error) => {
                if (error.response?.status === 401) {
                    // Handle unauthorized
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }

    // Model Management
    async getAvailableModels() {
        return this.client.get('/models');
    }

    async loadModel(modelKey, device = 'cpu') {
        return this.client.post('/models/load', {model_key: modelKey, device});
    }

    async getModelStatus() {
        return this.client.get('/models/status');
    }

    // Data Management
    async listDataFiles() {
        return this.client.get('/data/files');
    }

    async uploadData(file) {
        const formData = new FormData();
        formData.append('file', file);

        return this.client.post('/data/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    async loadData(filePath) {
        return this.client.post('/data/load', {file_path: filePath});
    }

    // Predictions
    async predict(params) {
        return this.client.post('/predict', params);
    }

    async getPredictionHistory() {
        return this.client.get('/predictions/history');
    }

    // Analytics
    async getAnalytics(timeRange = '7d') {
        return this.client.get('/analytics', {params: {range: timeRange}});
    }

    async getMetrics() {
        return this.client.get('/analytics/metrics');
    }

    // WebSocket connection
    connectWebSocket() {
        const wsUrl = API_BASE_URL.replace('http', 'ws').replace('/api', '/ws');
        return new WebSocket(wsUrl);
    }
}

export default new ApiService();
