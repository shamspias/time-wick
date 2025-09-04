import {renderHook, act} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {useKronos} from '../../hooks/useKronos';
import apiService from '../../services/api';
import wsService from '../../services/websocket';

// Mock the api and websocket services
vi.mock('../../services/api', () => ({
    default: {
        getAvailableModels: vi.fn(),
        loadModel: vi.fn(),
        listDataFiles: vi.fn(),
        uploadData: vi.fn(),
        loadData: vi.fn(),
        predict: vi.fn(),
    },
}));

vi.mock('../../services/websocket', () => ({
    default: {
        connect: vi.fn(),
        disconnect: vi.fn(),
        on: vi.fn(),
        off: vi.fn(),
        send: vi.fn(),
    },
}));

beforeEach(() => {
    vi.clearAllMocks();
});

describe('useKronos', () => {
    it('loads available models on mount', async () => {
        const mockModels = {
            'kronos-mini': {name: 'Kronos Mini'},
            'kronos-small': {name: 'Kronos Small'},
        };

        apiService.getAvailableModels.mockResolvedValue({
            models: mockModels,
            current: null,
            loaded: false,
        });

        apiService.listDataFiles.mockResolvedValue([]);

        const {result, waitForNextUpdate} = renderHook(() => useKronos());

        await waitForNextUpdate();

        expect(result.current.models).toEqual(mockModels);
        expect(result.current.currentModel).toBeNull();
    });

    it('loads model successfully', async () => {
        apiService.getAvailableModels.mockResolvedValue({
            models: {},
            current: null,
            loaded: false,
        });
        apiService.listDataFiles.mockResolvedValue([]);
        apiService.loadModel.mockResolvedValue({success: true});

        const {result, waitForNextUpdate} = renderHook(() => useKronos());

        await waitForNextUpdate(); // Wait for initial load

        let success;
        await act(async () => {
            success = await result.current.loadModel('kronos-small', 'cpu');
        });

        expect(success).toBe(true);
        expect(result.current.currentModel).toBe('kronos-small');
    });

    it('handles prediction', async () => {
        const mockPrediction = {
            success: true,
            predictions: [],
            metrics: {mae: 0.1},
        };

        apiService.getAvailableModels.mockResolvedValue({
            models: {},
            current: null,
            loaded: false,
        });
        apiService.listDataFiles.mockResolvedValue([]);
        apiService.predict.mockResolvedValue(mockPrediction);

        const {result, waitForNextUpdate} = renderHook(() => useKronos());

        await waitForNextUpdate(); // Wait for initial load

        let prediction;
        await act(async () => {
            prediction = await result.current.predict({lookback: 400});
        });

        expect(prediction).toEqual(mockPrediction);
        expect(result.current.predictions).toContainEqual(mockPrediction);
    });

    it('handles data upload', async () => {
        const mockFile = new File(['content'], 'test.csv', {type: 'text/csv'});
        const mockResponse = {
            success: true,
            info: {rows: 1000, columns: ['open', 'high', 'low', 'close']},
        };

        apiService.getAvailableModels.mockResolvedValue({
            models: {},
            current: null,
            loaded: false,
        });
        apiService.listDataFiles.mockResolvedValue([]);
        apiService.uploadData.mockResolvedValue(mockResponse);

        const {result, waitForNextUpdate} = renderHook(() => useKronos());

        await waitForNextUpdate(); // Wait for initial load

        let success;
        await act(async () => {
            success = await result.current.uploadData(mockFile);
        });

        expect(success).toBe(true);
        expect(result.current.currentData).toEqual(mockResponse.info);
    });

    it('handles errors gracefully', async () => {
        const errorMessage = 'Failed to load model';
        apiService.getAvailableModels.mockResolvedValue({
            models: {},
            current: null,
            loaded: false,
        });
        apiService.listDataFiles.mockResolvedValue([]);
        apiService.loadModel.mockRejectedValue(new Error(errorMessage));

        const {result, waitForNextUpdate} = renderHook(() => useKronos());

        await waitForNextUpdate(); // Wait for initial load

        await act(async () => {
            await result.current.loadModel('kronos-small', 'cpu');
        });

        expect(result.current.error).toBe(errorMessage);
    });
});