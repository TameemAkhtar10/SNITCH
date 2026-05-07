import { useState } from 'react';

const themeTokens = {
    dark: {
        '--bg-primary': '#0a0a0a',
        '--bg-secondary': '#141414',
        '--text-primary': '#ffffff',
        '--text-secondary': '#a3a3a3',
        '--accent': '#d4af37',
        '--accent-strong': '#b8860b',
        '--border': '#262626',
        '--danger': '#ef4444',
        '--success': '#10b981',
        '--info': '#3b82f6',
        '--warning': '#facc15',
        '--purple': '#a855f7',
    },
    light: {
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#f5f5f5',
        '--text-primary': '#000000',
        '--text-secondary': '#525252',
        '--accent': '#b8860b',
        '--accent-strong': '#8a6508',
        '--border': '#e5e5e5',
        '--danger': '#ef4444',
        '--success': '#10b981',
        '--info': '#2563eb',
        '--warning': '#eab308',
        '--purple': '#9333ea',
    },
};

const useDarkMode = () => {
    const [isDark, setIsDark] = useState(() => {
        const storedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return storedTheme === 'dark' || (!storedTheme && prefersDark);
    });

    const toggleDark = () => {
        setIsDark((prev) => {
            const next = !prev;
            localStorage.setItem('theme', next ? 'dark' : 'light');
            return next;
        });
    };

    const themeVars = isDark ? themeTokens.dark : themeTokens.light;

    return { isDark, toggleDark, themeVars };
};

export default useDarkMode;
