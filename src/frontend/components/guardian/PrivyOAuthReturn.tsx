'use client';

import { useEffect } from 'react';

/**
 * Mounted in the root layout, and deliberately free of Privy imports so the
 * public pages do not load the Privy SDK. If Privy's Google redirect returns
 * to a page other than sign-in, forward it there with its parameters so the
 * dedicated auth page can finish the sign-in.
 */
export default function PrivyOAuthReturn() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('privy_oauth_code') && window.location.pathname !== '/login') {
      window.location.replace(`/login${window.location.search}`);
    }
  }, []);
  return null;
}
