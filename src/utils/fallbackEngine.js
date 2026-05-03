/**
 * ElectionAssist Fallback Intelligence Engine
 * 
 * Acts as the PRIMARY response system. Provides instant, context-aware
 * guidance without any external API dependency.
 */

// ─── Intent Detection ─────────────────────────────────────────────────────────

const INTENT_PATTERNS = [
  { intent: 'what_next',     keywords: ['what next', 'now what', 'what should i do', 'next step', 'what do i do', 'guide me', 'help me'] },
  { intent: 'documents',     keywords: ['document', 'id', 'proof', 'carry', 'bring', 'need', 'checklist', 'what to take', 'aadhaar', 'passport', 'voter id'] },
  { intent: 'location',      keywords: ['where', 'booth', 'polling station', 'find', 'locate', 'near me', 'address', 'map', 'directions', 'how far'] },
  { intent: 'how_to_vote',   keywords: ['how to vote', 'voting process', 'evm', 'machine', 'press', 'button', 'cast', 'ballot', 'mark', 'lever'] },
  { intent: 'first_time',    keywords: ['first time', 'new voter', 'never voted', 'beginner', 'how do i start', 'just registered'] },
  { intent: 'registration',  keywords: ['register', 'enroll', 'voter list', 'roll', 'apply', 'form 6', 'epic'] },
  { intent: 'candidates',    keywords: ['candidate', 'party', 'who is', 'contest', 'election', 'manifesto', 'vote for'] },
  { intent: 'result',        keywords: ['result', 'outcome', 'winner', 'won', 'count', 'announce'] },
  { intent: 'time',          keywords: ['time', 'when', 'date', 'open', 'close', 'hours', 'schedule', 'timing'] },
]

export function detectIntent(message) {
  const lower = message.toLowerCase()
  for (const { intent, keywords } of INTENT_PATTERNS) {
    if (keywords.some(kw => lower.includes(kw))) return intent
  }
  return 'general'
}

// ─── Stage-Aware Responses ─────────────────────────────────────────────────────

const STAGE_CONTEXT = {
  learning: {
    label: 'Preparation',
    summary: 'you are preparing to vote',
    tip: 'Start by verifying your voter registration and learning about your local candidates.',
  },
  registered: {
    label: 'Registration Complete',
    summary: 'you are registered and getting ready',
    tip: 'Great! Now prepare your documents and find your nearest polling booth.',
  },
  at_polling_station: {
    label: 'At the Polling Station',
    summary: 'you are at the polling station',
    tip: 'Have your ID ready, join the queue, and follow the officer\'s instructions.',
  },
  voting: {
    label: 'Casting Your Vote',
    summary: 'you are in the process of voting',
    tip: 'Press the button next to your candidate on the EVM. Wait for the beep.',
  },
  completed: {
    label: 'Voted Successfully',
    summary: 'you have completed voting',
    tip: 'Thank you for voting! You can now track election results on official channels.',
  },
}

// ─── Intent Response Library ───────────────────────────────────────────────────

function getWhatNext(stage, isFirstTime) {
  const stageMap = {
    learning: `Based on your current step, here is what to do next:\n\n` +
      `1. ✅ Verify your name is on the voter roll (visit voters.eci.gov.in)\n` +
      `2. 📋 Gather your required documents (Voter ID + Photo ID)\n` +
      `3. 📍 Find your polling booth location\n` +
      `4. 📅 Note the election date and booth timings\n\n` +
      (isFirstTime ? `Since you're a first-time voter, I recommend checking the "Documents Needed" panel for a full checklist! 🎉` : ''),

    registered: `Based on your current step, you're registered — great!\n\n` +
      `1. 🗺️ Find your exact polling booth address\n` +
      `2. 🪪 Keep Voter ID + one Photo ID ready\n` +
      `3. ⏰ Check booth hours (usually 7 AM – 6 PM)\n` +
      `4. 🚗 Plan your route in advance`,

    at_polling_station: `Based on your current step, you're at the booth! Here's what to do:\n\n` +
      `1. 🪪 Show your Voter ID + Photo ID at the entrance\n` +
      `2. 📋 Your name will be verified in the voter register\n` +
      `3. 🖊️ Sign or put your thumb impression in the register\n` +
      `4. 💧 Your left index finger will be inked\n` +
      `5. 🗳️ Proceed to the EVM to cast your vote`,

    voting: `Based on your current step, here's how to cast your vote:\n\n` +
      `1. 🔍 Identify your candidate on the EVM panel\n` +
      `2. 👆 Press the blue button next to their name/symbol\n` +
      `3. 🔔 Wait for a long beep — your vote is recorded!\n` +
      `4. 🧾 Check the VVPAT slip (visible for 7 seconds)\n` +
      `5. 🚪 Exit the booth`,

    completed: `Based on your current step, you've voted — thank you! 🎉\n\n` +
      `1. 📸 Share your "I Voted!" experience\n` +
      `2. 📺 Follow election results on official channels\n` +
      `3. 📅 Results are usually declared 1-2 days after polling\n` +
      `4. 📞 Report any irregularities to ECI helpline: 1950`,
  }
  return stageMap[stage] || stageMap.learning
}

function getDocuments(stage, isFirstTime) {
  const base = `Based on your current step, here are the documents you need:\n\n` +
    `✅ **Essential (Must Have):**\n` +
    `• Voter ID Card (EPIC)\n` +
    `• Any valid Photo ID (Aadhaar / PAN / Passport / Driving Licence)\n\n`

  const firstTime = isFirstTime
    ? `📋 **First-Time Voter Tips:**\n` +
      `• If you don't have a Voter ID yet, use Aadhaar + Form 12D\n` +
      `• Download your digital Voter ID from voters.eci.gov.in\n\n`
    : ''

  return base + firstTime +
    `❌ **NOT Allowed Inside:**\n` +
    `• Mobile phones\n` +
    `• Camera or recording devices\n` +
    `• Food or drinks`
}

function getLocation(location) {
  if (location) {
    return `Based on your current step, you've set your location to **${location}**.\n\n` +
      `📍 Use the Map panel to find the nearest polling booth.\n\n` +
      `You can also:\n` +
      `• Visit voters.eci.gov.in → "Find Polling Station"\n` +
      `• Call ECI helpline: 1950\n` +
      `• Search "polling booth near me" on Google Maps`
  }
  return `Based on your current step, to find your polling booth:\n\n` +
    `1. 🌐 Visit **voters.eci.gov.in**\n` +
    `2. Click "Know Your Polling Station"\n` +
    `3. Enter your Voter ID number\n\n` +
    `💡 Or tell me your area: e.g., "I'm in Andheri, Mumbai"`
}

function getHowToVote() {
  return `Based on your current step, here's the complete voting process:\n\n` +
    `**At the Booth:**\n` +
    `1. 🚶 Join the queue outside\n` +
    `2. 🪪 Show ID at verification desk\n` +
    `3. 📋 Officer confirms your name in register\n` +
    `4. 🖊️ You sign the voter register\n` +
    `5. 💧 Left index finger gets inked\n\n` +
    `**Inside the Voting Booth:**\n` +
    `6. 🔍 Find your candidate on the EVM\n` +
    `7. 👆 Press the blue button next to their symbol\n` +
    `8. 🔔 Hear the beep — vote recorded!\n` +
    `9. 🧾 VVPAT shows your vote for 7 seconds\n` +
    `10. ✅ Leave the booth`
}

function getFirstTimeVoter() {
  return `Based on your current step, welcome as a first-time voter! 🎉\n\n` +
    `Here's your quick-start guide:\n\n` +
    `**Step 1: Verify Registration**\n` +
    `• Visit voters.eci.gov.in → Search your name\n\n` +
    `**Step 2: Get Your Voter ID**\n` +
    `• Download digital copy from the same site\n\n` +
    `**Step 3: Know Your Booth**\n` +
    `• Use "Find Polling Station" on the ECI website\n\n` +
    `**Step 4: On Election Day**\n` +
    `• Carry Voter ID + Aadhaar/PAN\n` +
    `• Arrive at booth between 7 AM – 6 PM\n` +
    `• Follow the officer's instructions\n\n` +
    `You've got this! 💪`
}

function getRegistration() {
  return `Based on your current step, here's how to check/complete your registration:\n\n` +
    `1. 🌐 Visit **voters.eci.gov.in**\n` +
    `2. Click **"Search in Electoral Roll"**\n` +
    `3. Enter your name + state + district\n\n` +
    `**Not on the list?**\n` +
    `• Fill **Form 6** online at the same site\n` +
    `• You can also use the **Voter Helpline App** (Android/iOS)\n\n` +
    `📞 Helpline: **1950** (toll-free)`
}

function getCandidates() {
  return `Based on your current step, here's how to research candidates:\n\n` +
    `1. 🌐 Visit **affidavit.eci.gov.in** for official candidate affidavits\n` +
    `2. 📋 Check the "Candidates" panel in this app\n` +
    `3. 📰 Follow your local news for candidate profiles\n` +
    `4. 📱 Use the **Voter Helpline App** for constituency-wise candidates\n\n` +
    `💡 Tip: Always verify information from the official Election Commission website.`
}

function getTiming() {
  return `Based on your current step, here are typical election timings:\n\n` +
    `⏰ **Polling Hours:**\n` +
    `• Generally **7:00 AM to 6:00 PM**\n` +
    `• Some booths may have different hours — check with your local officer\n\n` +
    `📅 **Key Dates:**\n` +
    `• Polling date: Check your local election notification\n` +
    `• Results: Usually 1-2 days after polling day\n\n` +
    `📞 Call ECI: **1950** for accurate date and time for your constituency`
}

function getGeneral(stage) {
  const ctx = STAGE_CONTEXT[stage] || STAGE_CONTEXT.learning
  return `Based on your current step (${ctx.label}), I'm here to guide you.\n\n` +
    `${ctx.tip}\n\n` +
    `Try asking me about:\n` +
    `• "What documents do I need?"\n` +
    `• "Where is my polling booth?"\n` +
    `• "How do I cast my vote?"\n` +
    `• "What should I do next?"`
}

// ─── Main Export ───────────────────────────────────────────────────────────────

/**
 * Generate a context-aware fallback response.
 * @param {string} message - Raw user message
 * @param {object} state   - App state (user_stage, first_time_voter, location)
 * @returns {{ text: string, intent: string, extracted_location?: string, is_first_time?: boolean }}
 */
export function getFallbackResponse(message, state) {
  const { user_stage = 'learning', first_time_voter = false, location = '' } = state
  const intent = detectIntent(message)

  // Extract location if user mentioned one (basic extraction)
  const locationMatch = message.match(
    /(?:in|near|at|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/
  )
  const extractedLocation = locationMatch ? locationMatch[1] : null

  // Detect first-time mention
  const msgLower = message.toLowerCase()
  const mentionsFirstTime = msgLower.includes('first time') || msgLower.includes('new voter') || msgLower.includes('never voted')

  let text
  let panel = null

  switch (intent) {
    case 'what_next':
      text = getWhatNext(user_stage, first_time_voter)
      break
    case 'documents':
      text = getDocuments(user_stage, first_time_voter)
      panel = 'checklist'
      break
    case 'location':
      text = getLocation(extractedLocation || location)
      panel = 'map'
      break
    case 'how_to_vote':
      text = getHowToVote()
      panel = 'simulator'
      break
    case 'first_time':
      text = getFirstTimeVoter()
      panel = 'checklist'
      break
    case 'registration':
      text = getRegistration()
      break
    case 'candidates':
      text = getCandidates()
      panel = 'candidates'
      break
    case 'time':
      text = getTiming()
      break
    default:
      text = getGeneral(user_stage)
  }

  return {
    text,
    intent,
    extracted_intent: mapIntentToEnum(intent),
    extracted_location: extractedLocation,
    is_first_time: mentionsFirstTime || null,
    suggestedPanel: panel,
  }
}

function mapIntentToEnum(intent) {
  const map = {
    what_next: 'general_question',
    documents: 'requirements_inquiry',
    location: 'location_inquiry',
    how_to_vote: 'voting_process',
    first_time: 'requirements_inquiry',
    registration: 'general_question',
    candidates: 'candidates_inquiry',
    time: 'timeline_inquiry',
    general: 'general_question',
  }
  return map[intent] || 'general_question'
}
