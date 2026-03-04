import { useEffect, useRef } from 'react';
import gsap from 'gsap';

// Fade-in and slide-up animation for page content
export const usePageEnter = (deps = []) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            gsap.fromTo(
                containerRef.current,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
            );
        }
    }, deps);

    return containerRef;
};

// Stagger animation for list items (cards, menu items, etc.)
export const useStaggerEnter = (selector, deps = []) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            const items = containerRef.current.querySelectorAll(selector);
            gsap.fromTo(
                items,
                { opacity: 0, y: 20, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.5,
                    stagger: 0.08,
                    ease: 'power2.out',
                    delay: 0.1
                }
            );
        }
    }, deps);

    return containerRef;
};

// Scale-up animation for individual elements
export const useScaleEnter = (deps = []) => {
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current) {
            gsap.fromTo(
                ref.current,
                { opacity: 0, scale: 0.9 },
                { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
            );
        }
    }, deps);

    return ref;
};

// Slide-in from left for sidebar
export const useSidebarEnter = () => {
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current) {
            gsap.fromTo(
                ref.current,
                { x: -260, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
            );

            // Stagger nav links
            const links = ref.current.querySelectorAll('nav a');
            gsap.fromTo(
                links,
                { x: -30, opacity: 0 },
                {
                    x: 0,
                    opacity: 1,
                    duration: 0.4,
                    stagger: 0.06,
                    ease: 'power2.out',
                    delay: 0.3
                }
            );
        }
    }, []);

    return ref;
};

// Chart fade-in animation
export const useChartEnter = (deps = []) => {
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current) {
            gsap.fromTo(
                ref.current,
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.3 }
            );
        }
    }, deps);

    return ref;
};
