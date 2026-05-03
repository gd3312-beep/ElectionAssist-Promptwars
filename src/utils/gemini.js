/**
 * ElectionAssist — Gemini Integration Utility
 *
 * Provides optional AI-enhanced responses using Google Gemini 2.0 Flash.
 * All functions are fail-safe: if Gemini is unavailable, local fallbacks
 * are returned instantly with zero user-visible errors.
 *
 * @module gemini
 */

// ─── Local Fallback Tips Library ──────────────────────────────────────────────

const LOCATION_TIPS = {
  Delhi: [
    '📋 Delhi uses EVM machines — all booths are fully equipped.',
    '⏰ Polling hours: 7 AM – 6 PM across all constituencies.',
    '🚇 Delhi Metro stations are near most major polling zones.',
    '📱 Download the Voter Helpline App for real-time Delhi booth info.',
  ],
  Mumbai: [
    '🌧️ Mumbai coastal humidity can make queues faster — arrive early.',
    '⏰ Polling hours: 7 AM – 6 PM. Last queues form before 5:30 PM.',
    '🚌 BEST bus routes updated during elections for easier booth access.',
    '📱 Check BMC voter portal for Mumbai-specific booth addresses.',
  ],
  Bengaluru: [
    '💻 Bengaluru has a high digital voter registration rate — verify online.',
    '🚦 Traffic is usually managed near polling stations; allow extra time.',
    '📱 BBMP election portal lists Bengaluru-specific booth locations.',
    '⏰ Polling hours: 7 AM – 6 PM. Some areas may have extended hours.',
  ],
  Chennai: [
    '☀️ Chennai heat: carry water and use shade near the booth.',
    '🚌 MTC buses often run extra services on election day.',
    '📱 Tamil Nadu voter helpline: 1950 for booth-specific queries.',
    '⏰ Polling hours: 7 AM – 6 PM in most Chennai constituencies.',
  ],
  Kolkata: [
    '🌿 Kolkata booths are typically in local schools and community halls.',
    '🚍 Kolkata Metro and bus services run on schedule on election day.',
    '⏰ Polling hours: 7 AM – 6 PM. Senior queue lanes are available.',
    '📱 West Bengal CEO portal for Kolkata-specific voter information.',
  ],
  default: [
    '✅ Always verify your name on the voter roll before election day.',
    '🪪 Carry both your Voter ID and an alternate Photo ID (Aadhaar/PAN).',
    '⏰ Typical polling hours: 7:00 AM – 6:00 PM. Arrive by 5:30 PM.',
    '📞 ECI Helpline: 1950 (toll-free) for any election-day queries.',
    '🌐 Official portal: voters.eci.gov.in — Find booth, check roll, download ID.',
  ],
}

/**
 * Returns local fallback insights for a given location.
 * @param {string} location
 * @returns {{ tips: string[], source: 'local' }}
 */
function getLocalInsights(location) {
  const key = Object.keys(LOCATION_TIPS).find(
    (city) => location && location.toLowerCase().includes(city.toLowerCase())
  )
  return {
    tips: LOCATION_TIPS[key] || LOCATION_TIPS.default,
    source: 'local',
  }
}

/**
 * Fetches AI-enhanced location insights from the Gemini-backed server endpoint.
 * Falls back to local data immediately if the request fails or times out.
 *
 * @param {string} location - User's area or city name
 * @returns {Promise<{ tips: string[], source: 'gemini'|'local' }>}
 */
export async function getLocationInsights(location) {
  if (!location) return getLocalInsights('')

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)

    const res = await fetch('/api/location-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location }),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!res.ok) throw new Error('Server unavailable')
    const data = await res.json()
    return { tips: data.tips || [], source: 'gemini' }
  } catch {
    // Silent failure — always return useful local data
    return getLocalInsights(location)
  }
}

/**
 * Describes a voting process step using Gemini.
 * Used in the VotingSimulator for accessible explanations.
 * Falls back to the provided default text if unavailable.
 *
 * @param {string} stepDescription - Short description of the step
 * @param {string} [fallbackText]  - Always-available fallback
 * @returns {Promise<string>}
 */
export async function describeStep(stepDescription, fallbackText = '') {
  try {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 2500)

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Explain this voting step in simple, friendly language for a first-time Indian voter: "${stepDescription}". Keep it under 2 sentences.`,
        systemPrompt: 'You are a helpful civic assistant. Respond with a plain JSON object: { "text": "your explanation" }',
      }),
      signal: controller.signal,
    })

    if (!res.ok) throw new Error('Server unavailable')
    const data = await res.json()
    return data.text || fallbackText
  } catch {
    return fallbackText
  }
}
