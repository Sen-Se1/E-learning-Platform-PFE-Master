import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Admin Button Component (Unit Test)', () => {
    it('renders the admin button correctly', () => {
        render(<Button>Admin Click</Button>);
        expect(screen.getByRole('button', { name: /admin click/i })).toBeInTheDocument();
    });

    it('triggers an onClick event for admin actions', () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Post</Button>);
        fireEvent.click(screen.getByText('Post'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });
});
