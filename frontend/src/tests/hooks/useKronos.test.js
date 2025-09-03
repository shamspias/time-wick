import {renderHook, act} from '@testing-library/react-hooks';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {useKronos} from '../../hooks/useKronos';
import apiService from '../../services/api';

// Explicitly mock the api module and its methods
vi.mock('../../services/api', () => ({
    default: {
        getAvailableModels: vi.fn(),
        loadModel: vi.fn(),
        predict: vi.fn(),
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
        });

        const {result, waitForNextUpdate} = renderHook(() => useKronos());

        await waitForNextUpdate();

        expect(result.current.models).toEqual(mockModels);
        expect(result.current.currentModel).toBeNull();
    });

    it('loads model successfully', async () => {
        apiService.loadModel.mockResolvedValue({success: true});

        const {result} = renderHook(() => useKronos());

        let success: boolean | undefined;
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

        apiService.predict.mockResolvedValue(mockPrediction);

        const {result} = renderHook(() => useKronos());

        let prediction: typeof mockPrediction | undefined;
        await act(async () => {
            prediction = await result.current.predict({lookback: 400});
        });

        expect(prediction).toEqual(mockPrediction);
    });
});
