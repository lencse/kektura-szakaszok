module.exports = {
    purge: [],
    theme: {
        container: {
            center: true
        },
        fontFamily: {
            sans: [
                'Inter',
                '-apple-system',
                'BlinkMacSystemFont',
                '"Segoe UI"',
                'Roboto',
                '"Helvetica Neue"',
                'Arial',
                '"Noto Sans"',
                'sans-serif',
                '"Apple Color Emoji"',
                '"Segoe UI Emoji"',
                '"Segoe UI Symbol"',
                '"Noto Color Emoji"',
            ],
            serif: [
                "Roboto Slab",
                'Georgia',
                'Cambria',
                '"Times New Roman"',
                'Times',
                'serif'
            ],
            mono: [
                '"Cutive Mono"',
                'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'
            ]
        },
        extend: {
            colors: {
                blue: {
                    100: '#d0e5f7',
                    300: '#5c8dcd',
                    500: '#0047ab',
                    700: '#002480',
                    900: '#00075e'
                },
                orange: {
                    500: '#d9830b'
                },
                brown: {
                    500: '#d9830b'
                }
            },
            fontSize: {
                '7xl': '5rem',
                '8xl': '8rem',
            }
        },
    },
    variants: {},
    plugins: [],
}
