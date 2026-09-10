import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Automatically handles smooth scrolling to hash anchors (e.g. #capabilities, #workflow, #preview)
 * and scrolls to top on route change when no hash is present.
 */
export function ScrollToAnchor() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const targetId = hash.replace('#', '');
      const executeScroll = () => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };

      // Try immediately, plus a slight delay to allow route transition/rendering
      executeScroll();
      const timer = setTimeout(executeScroll, 120);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pathname, hash]);

  return null;
}

export default ScrollToAnchor;
