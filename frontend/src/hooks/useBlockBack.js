import { useEffect } from 'react';

/**
 * Prevents the user from navigating back (browser back button / swipe).
 * Use this on game pages where going back would allow cheating.
 */
export default function useBlockBack() {
  useEffect(() => {
    // Push a duplicate state so there's always something to "pop" into
    window.history.pushState(null, '', window.location.href);
    const handler = () => {
      window.history.pushState(null, '', window.location.href);
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);
}
