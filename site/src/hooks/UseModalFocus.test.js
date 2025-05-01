import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useModalFocus } from './useModalFocus';

/**
 * Helper component to test the useModalFocus hook
 */
function TestModal({ isVisible, onClose }) {
    const ref = useModalFocus(isVisible, onClose);
    return (
        isVisible && (
            <div data-testid="modal" tabIndex="-1" ref={ref}>
                Modal Content
            </div>
        )
    );
}

describe('useModalFocus', () => {
    let onClose;

    beforeEach(() => {
        onClose = jest.fn();
    });

    it('should focus the modal when it becomes visible', () => {
        const { rerender } = render(<TestModal isVisible={false} onClose={onClose} />);

        // Show the modal
        rerender(<TestModal isVisible={true} onClose={onClose} />);

        const modal = screen.getByTestId('modal');
        expect(modal).toHaveFocus();
    });

    it('should call onClose when Escape key is pressed', () => {
        render(<TestModal isVisible={true} onClose={onClose} />);
        const modal = screen.getByTestId('modal');

        // Press Escape
        fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should restore focus to the last focused element when modal closes', () => {
        // Render a button that will receive initial focus
        render(<button data-testid="trigger">Trigger</button>);
        const trigger = screen.getByTestId('trigger');
        trigger.focus();
        expect(trigger).toHaveFocus();

        // Render modal visible
        const { rerender } = render(<TestModal isVisible={true} onClose={onClose} />);
        const modal = screen.getByTestId('modal');
        expect(modal).toHaveFocus();

        // Hide the modal
        rerender(<TestModal isVisible={false} onClose={onClose} />);

        // Focus should return to trigger
        expect(trigger).toHaveFocus();
    });

    it('should not error when hiding modal without prior focus element', () => {
        // Render modal without any prior focus
        const { rerender } = render(<TestModal isVisible={true} onClose={onClose} />);
        expect(screen.getByTestId('modal')).toBeInTheDocument();

        // Hide modal
        expect(() => {
            rerender(<TestModal isVisible={false} onClose={onClose} />);
        }).not.toThrow();
    });
});