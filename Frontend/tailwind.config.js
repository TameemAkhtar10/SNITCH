export default {
    theme: {
        extend: {
            animation: {
                fadeInUp: 'fadeInUp 0.6s ease-out 0.3s both',
            },
            keyframes: {
                fadeInUp: {
                    'from': {
                        opacity: '0',
                        transform: 'translateY(30px)',
                    },
                    'to': {
                        opacity: '1',
                        transform: 'translateY(0)',
                    },
                },
            },
        },
    },
}
