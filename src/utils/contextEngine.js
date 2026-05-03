export function processContext(extractedIntent, currentState, rawMessage) {
  let nextPanel = currentState.active_panel;
  let nextStage = currentState.user_stage;
  let nextAppView = currentState.app_view;
  let systemAction = null;

  const msgLower = rawMessage.toLowerCase();

  // 1. Explicit Intent Mapping
  switch (extractedIntent) {
    case 'guided_mode_request':
      nextAppView = 'guided';
      break;
    case 'requirements_inquiry':
      nextPanel = 'checklist';
      break;
    case 'timeline_inquiry':
      nextPanel = 'timeline';
      break;
    case 'location_inquiry':
      nextPanel = 'map';
      break;
    case 'at_polling_station':
      nextStage = 'at_polling_station';
      nextPanel = 'simulator';
      break;
    case 'voting_process':
      nextPanel = 'simulator';
      break;
    case 'candidates_inquiry':
      nextPanel = 'candidates';
      break;
    default:
      break;
  }

  // 2. Keyword & Stage-based Fallbacks (Smart Behavior)
  // Only apply if intent is general or unrecognized
  if (!extractedIntent || extractedIntent === 'general_question') {
    if (msgLower.includes("what next") || msgLower.includes("now what") || msgLower.includes("help me vote") || msgLower.includes("what should i do")) {
      if (nextStage === 'learning' || nextStage === 'registered') {
        nextPanel = 'checklist';
      } else if (nextStage === 'at_polling_station') {
        nextPanel = 'simulator';
        nextStage = 'voting';
      } else if (nextStage === 'voting') {
        nextStage = 'completed';
        nextPanel = 'timeline';
      }
    } else if (msgLower.includes("where") || msgLower.includes("find polling") || msgLower.includes("location") || msgLower.includes("booth")) {
      nextPanel = 'map';
    } else if (msgLower.includes("document") || msgLower.includes("requirements") || msgLower.includes("id card")) {
      nextPanel = 'checklist';
    } else if (/\bhow\b/.test(msgLower) || msgLower.includes("process") || msgLower.includes("machine")) {
      nextPanel = 'simulator';
    } else if (msgLower.includes("candidate") || msgLower.includes("contesting")) {
      nextPanel = 'candidates';
    }
  }

  return { nextPanel, nextStage, nextAppView, systemAction };
}
