// Simple route helpers - can be replaced with Ziggy routes later
export const dashboard = '/dashboard';
export const login = '/login';
export const register = '/register';
export const logout = '/logout';

// Profile routes
export const profile = {
    edit: '/profile',
};

// Password routes
export const password = {
    request: '/forgot-password',
    confirm: '/password/confirm',
};

// Two-factor routes
export const twoFactor = {
    qrCode: '/user/two-factor-qr-code',
    secretKey: '/user/two-factor-secret-key',
    recoveryCodes: '/user/two-factor-recovery-codes',
    confirm: '/user/confirm-two-factor-authentication',
    disable: '/user/two-factor-authentication',
    enable: '/user/two-factor-authentication',
    regenerateRecoveryCodes: '/user/two-factor-recovery-codes',
    login: {
        store: '/two-factor-challenge',
    },
};

// Verification routes
export const verification = {
    send: '/email/verification-notification',
};

// Appearance routes
export const appearance = {
    edit: '/appearance',
};