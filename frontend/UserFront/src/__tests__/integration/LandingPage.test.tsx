import React from 'react';
import { render, screen } from '@testing-library/react';
import LandingPage from '@/app/page';

// Mocking useLanguage hook to return translations
jest.mock('@/context/language-context', () => ({
    useLanguage: () => ({
        t: (key: string) => {
            const trans: Record<string, string> = {
                'hero.title_prefix': 'Learn',
                'hero.title_highlight': 'DevOps',
                'hero.tagline': 'BEST PLATFORM',
                'hero.explore': 'Explore Now',
                'hero.pricing': 'View Pricing',
                'hero.join_community': 'Join 10k+ students',
                'hero.description': 'Master the cloud.'
            };
            return trans[key] || key;
        },
        dir: 'ltr'
    })
}));

// Mocking Navbar and Footer components to avoid deep rendering of their logic
jest.mock('@/components/layout/navbar', () => ({
    Navbar: () => <nav data-testid="navbar">Navbar Mock</nav>
}));

jest.mock('@/components/layout/footer', () => ({
    Footer: () => <footer data-testid="footer">Footer Mock</footer>
}));

describe('LandingPage (Integration Test)', () => {
    it('renders the navbar and footer correctly', () => {
        render(<LandingPage />);
        expect(screen.getByTestId('navbar')).toBeInTheDocument();
        expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('contains the hero section with localized content from the mock', () => {
        render(<LandingPage />);

        // Check for title components
        expect(screen.getByText('Learn')).toBeInTheDocument();
        expect(screen.getByText('DevOps')).toBeInTheDocument();

        // Check for buttons
        expect(screen.getByRole('button', { name: /explore now/i })).toBeInTheDocument();
    });

    it('renders the features section based on the layout', () => {
        render(<LandingPage />);
        // Check for the "Features" title key as per mock (falls back to key if not in trans)
        expect(screen.getByText('features.title')).toBeInTheDocument();
    });
});
