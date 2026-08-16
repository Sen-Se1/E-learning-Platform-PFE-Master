import React from 'react';
import { render, screen } from '@testing-library/react';
import AuthPage from '@/app/auth/page';

// Mocking useLanguage
jest.mock('@/context/language-context', () => ({
    useLanguage: () => ({
        t: (key: string) => {
            const trans: Record<string, string> = {
                'auth.hero_login_title': 'Admin Login',
                'auth.hero_login_desc': 'Welcome back, admin!',
                'auth.welcome_back': 'Welcome Back',
                'auth.login_desc': 'Enter your credentials.'
            };
            return trans[key] || key;
        },
        dir: 'ltr'
    })
}));

// Mocking LoginForm as it has complex state and API logic
jest.mock('@/app/auth/login/login-form', () => {
    return function MockLoginForm() {
        return <form data-testid="login-form">Mocked Login Form</form>;
    }
});

// Mocking LanguageSwitcher
jest.mock('@/components/language-switcher', () => ({
    LanguageSwitcher: () => <div data-testid="lang-switcher">Lang Switcher Mock</div>
}));

describe('Admin AuthPage (Integration Test)', () => {
    it('renders the branding section correctly', () => {
        render(<AuthPage />);
        expect(screen.getByText('CloudMaster DevOps')).toBeInTheDocument();
    });

    it('renders the mocked login form', () => {
        render(<AuthPage />);
        expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });

    it('displays localized text for the auth page', () => {
        render(<AuthPage />);
        expect(screen.getByText(/admin login/i)).toBeInTheDocument();
        // Use getAllByText as the same text might appear in hero and form sections
        const welcomeMsgs = screen.getAllByText(/welcome back/i);
        expect(welcomeMsgs.length).toBeGreaterThan(0);
    });

    it('contains the language switcher', () => {
        render(<AuthPage />);
        expect(screen.getByTestId('lang-switcher')).toBeInTheDocument();
    });
});
