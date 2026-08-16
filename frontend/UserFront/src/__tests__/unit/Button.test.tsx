import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component (Unit Test)', () => {
    it('renders the button with text content', () => {
        render(<Button>Click Me</Button>);
        expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('applies the correct classes for the "outline" variant', () => {
        render(<Button variant="outline">Outline Button</Button>);
        const button = screen.getByRole('button', { name: /outline button/i });
        // Verify that the outline class from buttonVariants is present
        expect(button.className).toContain('border');
        expect(button.className).toContain('bg-background');
    });

    it('triggers an onClick event when clicked', () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Clickable</Button>);
        const button = screen.getByRole('button', { name: /clickable/i });
        fireEvent.click(button);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('is disabled when the "disabled" prop is true', () => {
        render(<Button disabled>Disabled Button</Button>);
        const button = screen.getByRole('button', { name: /disabled button/i });
        expect(button).toBeDisabled();
        expect(button.className).toContain('opacity-50');
    });
});
