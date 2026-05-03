/**
 * analyticsHelper.js — ElectionAssist Analytics Utility
 *
 * Centralizes all Google Analytics event tracking in one place.
 * Wraps window.gtag safely so no event tracking ever causes a crash
 * or blocks the UI — even if gtag fails to load (ad blockers, offline).
 *
 * Tracked events:
 *   - user_query       → user submits a question
 *   - map_opened       → user opens the polling booth map
 *   - checklist_used   → user opens the pre-voting checklist
 *   - guided_mode_started → user enters guided walkthrough mode
 *
 * @module analyticsHelper
 */

/**
 * Track a named event with optional metadata.
 * Safe to call at any time — fails silently if gtag is unavailable.
 *
 * @param {string} action   - Event name (e.g. "user_query")
 * @param {object} [metadata] - Additional event parameters
 */
export function trackEvent(action, metadata = {}) {
  if (!action || typeof action !== 'string') return;

  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', action, {
        ...metadata,
        app_version: '1.0.0',
        timestamp: Date.now(),
      });
    }
    // In non-browser / test environments, silently do nothing
  } catch {
    // Never let analytics errors surface to the user
  }
}
