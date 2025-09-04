import '@testing-library/jest-dom';
import {vi} from 'vitest';

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock WebSocket
class WebSocketMock {
    constructor(url) {
        this.url = url;
        this.readyState = WebSocket.OPEN;
        this.onopen = null;
        this.onclose = null;
        this.onerror = null;
        this.onmessage = null;
    }

    send(data) {
        // Mock implementation
    }

    close() {
        this.readyState = WebSocket.CLOSED;
        if (this.onclose) {
            this.onclose();
        }
    }
}

global.WebSocket = WebSocketMock;

// Mock fetch
global.fetch = vi.fn();

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    constructor() {
    }

    disconnect() {
    }

    observe() {
    }

    unobserve() {
    }

    takeRecords() {
        return [];
    }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    constructor() {
    }

    disconnect() {
    }

    observe() {
    }

    unobserve() {
    }
};

// Suppress console errors in tests
const originalError = console.error;
beforeAll(() => {
    console.error = (...args) => {
        if (
            typeof args[0] === 'string' &&
            args[0].includes('Warning: ReactDOM.render')
        ) {
            return;
        }
        originalError.call(console, ...args);
    };
});

afterAll(() => {
    console.error = originalError;
});