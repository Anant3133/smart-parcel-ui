import { useEffect } from 'react';
import LocomotiveScroll from 'locomotive-scroll';
import 'locomotive-scroll/dist/locomotive-scroll.css';

export const useLocomotiveScroll = (enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const scrollContainer = document.querySelector('[data-scroll-container]');
    if (!scrollContainer) return;

    let scroll;
    try {
      scroll = new LocomotiveScroll({
        el: scrollContainer,
        smooth: true,
        lerp: 0.07,
        multiplier: 1,
        // 👇 explicitly pass an empty object if you're not using smoothElements
        smoothElements: {},
      });
    } catch (err) {
      console.error('Locomotive Scroll failed to init:', err);
    }

    return () => {
      try {
        if (scroll) scroll.destroy();
      } catch (err) {
        console.warn('Error during scroll cleanup:', err);
      }
    };
  }, [enabled]);
};
