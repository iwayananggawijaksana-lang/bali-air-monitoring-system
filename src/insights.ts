import { initializeInsights } from './hooks/useDeviceData';

// Initialize insights when this module is loaded
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initializeInsights);
}

export { initializeInsights };