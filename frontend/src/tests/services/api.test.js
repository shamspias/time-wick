import {describe, it, expect, vi, beforeEach} from 'vitest';
import axios from 'axios';
import apiService from '../../services/api';

// Explicit axios mock with get/post methods
vi.mock('axios', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

beforeEach(() => {
    vi.clearAllMocks();
});

describe('ApiService', () => {
    it('gets available models', async () => {
        const mockData = {
            models: {
                'kronos-mini': {name: 'Kronos Mini'},
                'kronos-small': {name: 'Kronos Small'},
            },
            current: null,
            loaded: false,
        };

        axios.get.mockResolvedValue({data: mockData});

        const result = await apiService.getAvailableModels();
        expect(result).toEqual(mockData);
    });

    it('loads model', async () => {
        const mockResponse = {
            success: true,
            model: 'kronos-small',
            device: 'cpu',
        };

        axios.post.mockResolvedValue({data: mockResponse});

        const result = await apiService.loadModel('kronos-small', 'cpu');
        expect(result).toEqual(mockResponse);
    });

    it('handles upload data', async () => {
        const mockFile = new File(['content'], 'test.csv', {type: 'text/csv'});
        const mockResponse = {
            success: true,
            filename: 'test.csv',
            info: {rows: 1000},
        };

        axios.post.mockResolvedValue({data: mockResponse});

        const result = await apiService.uploadData(mockFile);
        expect(result).toEqual(mockResponse);
    });
});
