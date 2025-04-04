import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer Component', () => {
    beforeEach(() => {
        render(<Footer />);
    });

    test('renders footer with team logo', () => {
        expect(screen.getByAltText('TEAM 23')).toBeInTheDocument();
    });

    test('renders about section with correct heading', () => {
        expect(screen.getByText('ABOUT')).toBeInTheDocument();
        expect(screen.getByText('USC Spring 2025')).toBeInTheDocument();
        expect(screen.getByText('For CSCI 310')).toBeInTheDocument();
        expect(screen.getByText('Professor William Halfond')).toBeInTheDocument();
    });

    test('renders made by section with team members', () => {
        expect(screen.getByText('MADE BY')).toBeInTheDocument();
        expect(screen.getByText('Malia Hotan')).toBeInTheDocument();
        expect(screen.getByText('David Han')).toBeInTheDocument();
        expect(screen.getByText('Vito Zhou')).toBeInTheDocument();
        expect(screen.getByText('Felix Chen')).toBeInTheDocument();
        expect(screen.getByText('Johnson Gao')).toBeInTheDocument();
    });

    test('renders created with section with technologies', () => {
        expect(screen.getByText('CREATED WITH')).toBeInTheDocument();
        expect(screen.getByText('Figma')).toBeInTheDocument();
        expect(screen.getByText('React JS')).toBeInTheDocument();
        expect(screen.getByText('Java')).toBeInTheDocument();
        expect(screen.getByText('Genius API')).toBeInTheDocument();
    });

    test('has the correct structure with three sections', () => {
        const sections = screen.getAllByRole('heading', { level: 3 });
        expect(sections).toHaveLength(3);
        expect(sections[0]).toHaveTextContent('ABOUT');
        expect(sections[1]).toHaveTextContent('MADE BY');
        expect(sections[2]).toHaveTextContent('CREATED WITH');
    });
});