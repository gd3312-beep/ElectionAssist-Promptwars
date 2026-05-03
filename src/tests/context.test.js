/**
 * context.test.js — ElectionAssist Context Engine Validation
 *
 * Lightweight Node.js test (no framework required).
 * Simulates complete user journeys and validates that the context engine
 * produces correct intent routing, stage transitions, and panel assignments.
 *
 * Run: node src/tests/context.test.js
 */

import { processContext } from '../utils/contextEngine.js';
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

// ── Test Suites ───────────────────────────────────────────────────────────────

console.log('\nRunning context.test.js...\n');

// Suite 1: Full Journey Simulation
console.log('📋 Suite 1: Full Voting Journey');

let state = { active_panel: 'timeline', user_stage: 'learning', app_view: 'chat' };

// Step 1: User arrives at polling booth
let result = processContext('at_polling_station', state, 'I am at polling booth');
assert(result.nextStage === 'at_polling_station', 'Stage → at_polling_station');
assert(result.nextPanel === 'simulator', 'Panel → simulator');
state = { ...state, user_stage: result.nextStage, active_panel: result.nextPanel };

// Step 2: User asks what next (should advance)
let fallback = getFallbackResponse('what next?', state);
assert(typeof fallback.text === 'string' && fallback.text.length > 0, '"what next?" returns text');
assert(fallback.text.includes('Based on your current step'), '"what next?" has stage prefix');

// Step 3: User asks for documents
fallback = getFallbackResponse('documents needed', state);
assert(fallback.text.includes('Based on your current step'), '"documents needed" has prefix');
assert(fallback.suggestedPanel === 'checklist', '"documents needed" suggests checklist panel');

// Step 4: User asks for polling booth
result = processContext('location_inquiry', state, 'find polling booth');
assert(result.nextPanel === 'map', '"find polling booth" → map panel');

// Suite 2: Intent Routing
console.log('\n📋 Suite 2: Intent Routing');
const baseState = { active_panel: 'timeline', user_stage: 'learning', app_view: 'chat' };

const routingTests = [
  { intent: 'requirements_inquiry', msg: 'what do I need', expectedPanel: 'checklist' },
  { intent: 'location_inquiry',     msg: 'where is my booth', expectedPanel: 'map' },
  { intent: 'voting_process',       msg: 'how do I vote', expectedPanel: 'simulator' },
  { intent: 'candidates_inquiry',   msg: 'who is contesting', expectedPanel: 'candidates' },
  { intent: 'timeline_inquiry',     msg: 'show me the timeline', expectedPanel: 'timeline' },
  { intent: 'guided_mode_request',  msg: 'guide me', expectedPanel: 'timeline' },
];

routingTests.forEach(({ intent, msg, expectedPanel }) => {
  const r = processContext(intent, baseState, msg);
  if (intent === 'guided_mode_request') {
    assert(r.nextAppView === 'guided', `Intent "${intent}" → guided app view`);
  } else {
    assert(r.nextPanel === expectedPanel, `Intent "${intent}" → panel "${expectedPanel}"`);
  }
});

// Suite 3: Keyword-Based Routing (no explicit intent)
console.log('\n📋 Suite 3: Keyword Fallback Routing');

const keywordTests = [
  { msg: 'where is my polling station', expectedPanel: 'map' },
  { msg: 'what documents do I need', expectedPanel: 'checklist' },
  { msg: 'how does the machine work', expectedPanel: 'simulator' },
  { msg: 'who is the candidate', expectedPanel: 'candidates' },
];

keywordTests.forEach(({ msg, expectedPanel }) => {
  const r = processContext('general_question', baseState, msg);
  assert(r.nextPanel === expectedPanel, `Keyword "${msg}" → panel "${expectedPanel}"`);
});

// Suite 4: Edge Cases
console.log('\n📋 Suite 4: Edge Cases');

// Empty message
let edgeResult = processContext('', baseState, '');
assert(edgeResult !== null && edgeResult !== undefined, 'Empty message — no crash');
assert(typeof edgeResult.nextPanel === 'string', 'Empty message — nextPanel is string');

// Unknown intent
edgeResult = processContext('unknown_xyz', baseState, 'some random text');
assert(edgeResult !== null, 'Unknown intent — no crash');

// Missing context
edgeResult = processContext('location_inquiry', {}, 'find booth');
assert(edgeResult !== null, 'Missing state — no crash');

// Suite 5: Fallback always responds
console.log('\n📋 Suite 5: Fallback Reliability');
const noContextState = {};
const noContextResponse = getFallbackResponse('anything', noContextState);
assert(noContextResponse.text.includes('Based on your current step'), 'No context — fallback responds');
assert(noContextResponse.text.length > 0, 'No context — text is non-empty');

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n── Results: ${passed} passed, ${failed} failed ──`);
if (failed > 0) {
  process.exit(1);
}
console.log('context.test.js passed!\n');
