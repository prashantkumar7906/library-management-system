import { Variants } from 'framer-motion';

// Page transition variants
export const pageVariants: Variants = {
    initial: {
        opacity: 0,
        scale: 0.98,
    },
    animate: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: [0.6, -0.05, 0.01, 0.99],
        },
    },
    exit: {
        opacity: 0,
        scale: 0.98,
        transition: {
            duration: 0.2,
        },
    },
};

// Stagger children animation
export const staggerContainer: Variants = {
    animate: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

// Card hover effect with 3D tilt
export const cardHoverVariants: Variants = {
    rest: {
        scale: 1,
        rotateY: 0,
        rotateX: 0,
    },
    hover: {
        scale: 1.05,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        },
    },
};

// Elastic animation for buttons
export const elasticVariants: Variants = {
    tap: {
        scale: 0.95,
    },
    hover: {
        scale: 1.05,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 10,
        },
    },
};

// Shake animation for errors
export const shakeVariants: Variants = {
    shake: {
        x: [-10, 10, -10, 10, 0],
        transition: {
            duration: 0.5,
        },
    },
};

// Magnetic focus animation
export const magneticFocusVariants: Variants = {
    unfocused: {
        scale: 1,
    },
    focused: {
        scale: 1.02,
        boxShadow: '0 0 0 3px rgba(14, 165, 233, 0.3)',
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 20,
        },
    },
};

// Portal collapse animation (Tom & Jerry effect)
export const portalVariants: Variants = {
    initial: {
        scale: 1,
        opacity: 1,
    },
    collapse: (custom: { x: number; y: number }) => ({
        scale: 0,
        x: custom.x,
        y: custom.y,
        opacity: 0,
        transition: {
            duration: 0.8,
            ease: [0.6, 0.01, 0.05, 0.95],
        },
    }),
};

// Slide in from bottom (drawer)
export const drawerVariants: Variants = {
    hidden: {
        y: '100%',
        opacity: 0,
    },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            damping: 25,
            stiffness: 200,
        },
    },
    exit: {
        y: '100%',
        opacity: 0,
        transition: {
            duration: 0.2,
        },
    },
};

// Glow animation
export const glowVariants: Variants = {
    initial: {
        boxShadow: '0 0 10px rgba(14, 165, 233, 0.3)',
    },
    animate: {
        boxShadow: [
            '0 0 10px rgba(14, 165, 233, 0.3)',
            '0 0 20px rgba(14, 165, 233, 0.6)',
            '0 0 10px rgba(14, 165, 233, 0.3)',
        ],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};

// Pulse animation for availability indicator
export const pulseVariants: Variants = {
    pulse: {
        scale: [1, 1.2, 1],
        opacity: [1, 0.7, 1],
        transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};

// Carousel slide animation
export const carouselVariants: Variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 1000 : -1000,
        opacity: 0,
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0,
    }),
};

// Stepper animation
export const stepperVariants: Variants = {
    inactive: {
        scale: 0.9,
        opacity: 0.5,
    },
    active: {
        scale: 1,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 300,
        },
    },
    complete: {
        scale: 1,
        opacity: 1,
        backgroundColor: 'rgb(14, 165, 233)',
    },
};

// SVG draw animation
export const svgDrawVariants: Variants = {
    hidden: {
        pathLength: 0,
        opacity: 0,
    },
    visible: {
        pathLength: 1,
        opacity: 1,
        transition: {
            pathLength: {
                duration: 1.5,
                ease: 'easeInOut',
            },
            opacity: {
                duration: 0.3,
            },
        },
    },
};

// Float animation
export const floatVariants: Variants = {
    float: {
        y: [-10, 10, -10],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};
