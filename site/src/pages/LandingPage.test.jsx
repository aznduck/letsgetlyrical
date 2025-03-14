import React from 'react';
import { render, screen } from '@testing-library/react';
import LandingPage from './LandingPage';

describe('LandingPage Component', () => {
    test('renders without crashing', () => {
        render(<LandingPage />);
    });

    test('displays the "Landing Page" heading', () => {
        render(<LandingPage />);
        const headingElement = screen.getByText('Landing Page');
        expect(headingElement).toBeInTheDocument();
    });

    test('heading has correct text and styling', () => {
        render(<LandingPage />);
        const headingElement = screen.getByText('Landing Page');

        expect(headingElement.textContent).toBe('Landing Page');

        expect(headingElement).toHaveClass('text-4xl');
        expect(headingElement).toHaveClass('font-bold');
        expect(headingElement).toHaveClass('text-pink-600');
    });

    test('container has proper styling', () => {
        const { container } = render(<LandingPage />);
        const mainDiv = container.firstChild;

        expect(mainDiv).toHaveClass('min-h-screen');
        expect(mainDiv).toHaveClass('flex');
        expect(mainDiv).toHaveClass('items-center');
        expect(mainDiv).toHaveClass('justify-center');
        expect(mainDiv).toHaveClass('bg-pink-100');
    });

    test('snapshot test', () => {
        const { container } = render(<LandingPage />);
        expect(container).toMatchSnapshot();
    });
});