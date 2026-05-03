import { processContext } from '../utils/contextEngine.js';
import { getFallbackResponse } from '../utils/fallbackEngine.js';

let state = {
  active_panel: 'timeline',
  user_stage: 'learning',
  app_view: 'chat',
};

console.log("Running context.test.js...");

// 1. "I am at polling booth" → stage change
let contextResult = processContext('at_polling_station', state, "I am at polling booth");
if (contextResult.nextStage !== 'at_polling_station') {
    throw new Error("Stage did not change to at_polling_station");
}
state.user_stage = contextResult.nextStage;

// 2. "what next?" → contextual response
let fallbackResult = getFallbackResponse("what next?", state);
if (!fallbackResult.text.includes("Based on your current step")) throw new Error("Missing prefix");

// 3. "documents needed"
fallbackResult = getFallbackResponse("documents needed", state);
if (!fallbackResult.text.includes("Based on your current step")) throw new Error("Missing prefix");

// 4. "find polling booth"
fallbackResult = getFallbackResponse("find polling booth", state);
if (!fallbackResult.text.includes("Based on your current step")) throw new Error("Missing prefix");

console.log("context.test.js passed!");
