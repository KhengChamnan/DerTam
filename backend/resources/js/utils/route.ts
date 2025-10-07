import { route as ziggyRoute } from 'ziggy-js';

// Re-export route function to make it available globally
export const route = ziggyRoute;

// Make route available on window for global access
if (typeof window !== 'undefined') {
    (window as any).route = ziggyRoute;
}