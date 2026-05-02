/**
 * Processes the intent extracted from the user's message and the current state,
 * and determines the next logical UI state/panel to show, and updates to the user stage.
 */
export function processContext(extractedIntent, currentState, rawMessage) {
  let nextPanel = currentState.active_panel;
  let nextStage = currentState.user_stage;
  let systemAction = null; // Can be used to inject a system message if needed

  const msgLower = rawMessage.toLowerCase();

  // Handle ambiguous "what next" queries explicitly based on current stage
  if (msgLower.includes("what next") || msgLower.includes("now what")) {
    if (nextStage === 'learning' || nextStage === 'registered') {
      nextPanel = 'checklist';
    } else if (nextStage === 'at_polling_station') {
      nextPanel = 'simulator';
      nextStage = 'voting';
    } else if (nextStage === 'voting') {
      nextStage = 'completed';
      nextPanel = 'timeline'; // Or some completion screen
    }
    return { nextPanel, nextStage, systemAction };
  }

  let nextAppView = currentState.app_view;

  // Map intents to panels
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
    default:
      break;
  }

  // Fallbacks based on explicit keywords if intent extraction missed it
  if (msgLower.includes("help me vote") || msgLower.includes("guided mode")) {
    nextAppView = 'guided';
  } else if (msgLower.includes("first time") || msgLower.includes("requirements") || msgLower.includes("need to bring")) {
    nextPanel = 'checklist';
  } else if (msgLower.includes("where do i vote") || msgLower.includes("find polling booth") || msgLower.includes("location")) {
    nextPanel = 'map';
  } else if (msgLower.includes("how does voting work") || msgLower.includes("phases") || msgLower.includes("when is")) {
    nextPanel = 'timeline';
  } else if (msgLower.includes("at the booth") || msgLower.includes("at the polling station")) {
    nextStage = 'at_polling_station';
  }

  return { nextPanel, nextStage, nextAppView, systemAction };
}
