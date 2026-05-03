/**
 * Rule-based fallback engine for ElectionAssist
 * Provides intelligent guidance when the AI service is unavailable.
 */

export function getFallbackResponse(message, state) {
  const msgLower = message.toLowerCase();
  const stage = state.user_stage;

  // 1. Generic Help / What next
  if (msgLower.includes('what next') || msgLower.includes('now what') || msgLower.includes('help')) {
    return getStageAdvice(stage);
  }

  // 2. Keyword based responses
  if (msgLower.includes('document') || msgLower.includes('checklist') || msgLower.includes('bring')) {
    return {
      text: "👉 Based on your current step, you should review your document checklist. Essential items usually include a Government Photo ID (like Aadhaar, PAN, or Passport) and your Voter ID card.",
      intent: 'requirements_inquiry'
    };
  }

  if (msgLower.includes('where') || msgLower.includes('location') || msgLower.includes('booth') || msgLower.includes('station')) {
    return {
      text: "👉 Based on your current step, you can find your nearest polling booth by switching to the 'Map' panel. If you provide your zip code or area name, I can help you locate it.",
      intent: 'location_inquiry'
    };
  }

  if (msgLower.includes('how') || msgLower.includes('process') || msgLower.includes('machine') || msgLower.includes('evm')) {
    return {
      text: "👉 Based on your current step, the voting process involves: 1. Identity verification at the entrance, 2. Getting your finger inked, 3. Signing the register, and 4. Casting your vote on the EVM in private.",
      intent: 'voting_process'
    };
  }

  if (msgLower.includes('candidate') || msgLower.includes('who') || msgLower.includes('contesting')) {
    return {
      text: "👉 Based on your current step, you can view the list of contesting candidates in your area by opening the 'Candidates' panel. It's important to research their backgrounds before Election Day.",
      intent: 'candidates_inquiry'
    };
  }

  // Default stage-based response
  return getStageAdvice(stage);
}

function getStageAdvice(stage) {
  const prefix = "👉 Based on your current step...";
  
  switch (stage) {
    case 'learning':
      return {
        text: `${prefix} you are in the Preparation phase. You should focus on researching your local candidates and confirming your registration status on the official voter portal.`,
        intent: 'timeline_inquiry'
      };
    case 'registered':
      return {
        text: `${prefix} you are Registered! Your next goal is to locate your polling booth and prepare your documents. Check the 'Documents Needed' list to ensure you're ready.`,
        intent: 'requirements_inquiry'
      };
    case 'at_polling_station':
      return {
        text: `${prefix} you are at the Polling Station. Please have your ID ready, follow the queue, and cooperate with the election officials for a smooth experience.`,
        intent: 'at_polling_station'
      };
    case 'voting':
      return {
        text: `${prefix} you are in the process of Voting. Once inside the booth, select your preferred candidate on the EVM, wait for the beep/slip, and ensure your vote is recorded correctly.`,
        intent: 'voting_process'
      };
    case 'completed':
      return {
        text: `${prefix} you have successfully Voted! Thank you for participating in the democratic process. You can now track result updates through official channels.`,
        intent: 'timeline_inquiry'
      };
    default:
      return {
        text: "👉 Based on your current step, I recommend exploring the interactive timeline to see where you are in the voting journey.",
        intent: 'general_question'
      };
  }
}
