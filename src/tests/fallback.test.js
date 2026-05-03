/**
 * fallback.test.js — ElectionAssist Fallback Engine Validation
 *
 * Lightweight Node.js test (no framework required).
 * Validates that the fallback engine ALWAYS returns a valid, structured,
 * stage-aware response for any user input — including edge cases.
 *
 * Run: node src/tests/fallback.test.js
 */

import { getFallbackResponse } from '../utils/fallbackEngine.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✅ PASS: ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${label}`);
    failed++;
  }
}

function assertResponse(response, label) {
  assert(response !== null && response !== undefined, `${label} — response exists`);
  assert(typeof response.text === 'string', `${label} — text is a string`);
  assert(response.text.length > 0, `${label} — text is not empty`);
  assert(response.text.includes('Based on your current step'), `${label} — includes stage-aware prefix`);
  assert(typeof response.intent === 'string', `${label} — intent is a string`);
}

// ── Test Suites ───────────────────────────────────────────────────────────────

console.log('\nRunning fallback.test.js...\n');

// Suite 1: Standard User Journeys
console.log('📋 Suite 1: Standard User Journeys');
const journeyState = { user_stage: 'learning', first_time_voter: false, location: '' };

assertResponse(getFallbackResponse('I am at polling booth', journeyState), 'At polling booth');
assertResponse(getFallbackResponse('what next?', journeyState), 'What next (learning stage)');
assertResponse(getFallbackResponse('documents needed', journeyState), 'Documents needed');
assertResponse(getFallbackResponse('find polling booth', journeyState), 'Find polling booth');
assertResponse(getFallbackResponse('how do I vote?', journeyState), 'How to vote');
assertResponse(getFallbackResponse('I am a first time voter', journeyState), 'First time voter');

// Suite 2: Edge Cases — must never crash or return null
console.log('\n📋 Suite 2: Edge Cases');

assertResponse(getFallbackResponse('', journeyState), 'Empty input');
assertResponse(getFallbackResponse('unknown query 12345', journeyState), 'Unknown query');
assertResponse(getFallbackResponse('polling booth in mars', journeyState), 'Invalid location');
assertResponse(getFallbackResponse('what next?', journeyState), 'Repeated query');
assertResponse(getFallbackResponse('   ', journeyState), 'Whitespace-only input');
assertResponse(getFallbackResponse('!@#$%^&*()', journeyState), 'Special characters');

// Suite 3: All Stages
console.log('\n📋 Suite 3: Stage-Aware Responses');
const stages = ['learning', 'registered', 'at_polling_station', 'voting', 'completed'];
stages.forEach(stage => {
  assertResponse(
    getFallbackResponse('what should I do next?', { ...journeyState, user_stage: stage }),
    `Stage: ${stage}`
  );
});

// Suite 4: Missing Context (no location, no stage)
console.log('\n📋 Suite 4: Missing Context');
assertResponse(getFallbackResponse('find my booth', {}), 'Missing state fields');
assertResponse(getFallbackResponse('what next', { user_stage: undefined }), 'Undefined stage');

// Suite 5: First-time voter flag
console.log('\n📋 Suite 5: First-Time Voter');
const ftState = { user_stage: 'learning', first_time_voter: true, location: 'Mumbai' };
assertResponse(getFallbackResponse('what documents do I need?', ftState), 'First-time voter documents');

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n── Results: ${passed} passed, ${failed} failed ──`);
if (failed > 0) {
  process.exit(1);
}
console.log('fallback.test.js passed!\n');
