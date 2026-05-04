import Colors from './Colors';

export const theme = {
    colors: {
        primary: '#007AFF',
        secondary: '#5856D6',
        background: '#FFFFFF',
        text: '#000000',
        textSecondary: '#8E8E93',
        border: '#C7C7CC',
        error: '#FF3B30',
        success: '#34C759',
        warning: '#FF9500',
        ...Colors,
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
    },
    borderRadius: {
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
    },
    fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
    },
};

export default theme;
