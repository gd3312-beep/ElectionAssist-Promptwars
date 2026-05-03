import { getFallbackResponse } from '../utils/fallbackEngine.js';

const state = { user_stage: 'learning' };

console.log("Running fallback.test.js...");

const responses = [
  getFallbackResponse("I am at polling booth", state),
  getFallbackResponse("what next?", state),
  getFallbackResponse("documents needed", state),
  getFallbackResponse("find polling booth", state)
];

responses.forEach(response => {
  if (!response.text.includes("Based on your current step")) {
    throw new Error("Response must include 'Based on your current step'");
  }
});

console.log("fallback.test.js passed!");
