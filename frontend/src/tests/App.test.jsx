import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import App from '../App';

describe('App', () => {
    it('renders without crashing', () => {
        render(<App/>);
        expect(screen.getByText(/kronos platform/i)).toBeInTheDocument();
    });

    it('has navigation menu', () => {
        render(<App/>);
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
        expect(screen.getByText(/models/i)).toBeInTheDocument();
        expect(screen.getByText(/data/i)).toBeInTheDocument();
        expect(screen.getByText(/analytics/i)).toBeInTheDocument();
    });

    it('shows dark mode toggle', () => {
        render(<App/>);
        // Prefer role-based query; uses the button's accessible name (from aria-label)
        expect(screen.getByRole('button', {name: /toggle dark mode/i})).toBeInTheDocument();
    });
});
