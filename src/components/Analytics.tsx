'use client';
// Uses the main @vercel/analytics entry (no sub-path) to avoid
// Turbopack resolution issues with /next and /react sub-paths.
import { inject } from '@vercel/analytics';
import { useEffect } from 'react';

export function Analytics() {
  useEffect(() => {
    inject();
  }, []);
  return null;
}
