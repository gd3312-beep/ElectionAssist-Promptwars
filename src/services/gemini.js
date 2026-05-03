import { apiChat } from './api.js'
import { getFallbackResponse } from '../utils/fallbackEngine'

// Fallback insights for offline mode or when API fails
const LOCAL_TIPS = {
  Delhi: [
    '📋 Delhi uses EVM machines — all booths are fully equipped.',
    '⏰ Polling hours: 7 AM – 6 PM across all constituencies.',
    '🚇 Delhi Metro stations are near most major polling zones.'
  ],
  Mumbai: [
    '🌧️ Mumbai coastal humidity can make queues faster — arrive early.',
    '⏰ Polling hours: 7 AM – 6 PM.',
    '🚌 BEST bus routes updated for easier booth access.'
  ],
  default: [
    '✅ Always verify your name on the voter roll before election day.',
    '🪪 Carry both your Voter ID and an alternate Photo ID.',
    '⏰ Typical polling hours: 7:00 AM – 6:00 PM.'
  ]
};

export async function generateResponse(message, state) {
  const systemPrompt = `
You are ElectionAssist, a helpful, neutral, and precise election assistant.
Current user language: ${state.user_language}. YOU MUST RESPOND IN THIS LANGUAGE.
User Context:
- Stage: ${state.user_stage}
- First time voter: ${state.first_time_voter}
- Location: ${state.location || 'Unknown'}
- Easy Mode Active: ${state.simple_mode}

Rules:
1. Provide short, structured, step-by-step responses.
2. If Easy Mode Active is true, use very simple vocabulary.
3. YOU MUST prefix your conversational response with "Based on your current step..." if giving instructions.

Return your response in a JSON format:
{
  "text": "Your conversational response here",
  "extracted_intent": "one of: general_question, location_inquiry, requirements_inquiry, timeline_inquiry, at_polling_station, voting_process, local_awareness_inquiry, guided_mode_request, candidates_inquiry",
  "extracted_location": "location if mentioned, else null",
  "is_first_time": true/false if mentioned, else null
}`;

  try {
    const response = await apiChat(message, systemPrompt);
    if (response && response.text) {
      if (!response.text.startsWith("Based on your current step")) {
        response.text = "Based on your current step... " + response.text;
      }
      return response;
    }
    throw new Error('Invalid response');
  } catch (error) {
    console.warn('AI Unavailable, using fallback engine:', error.message);
    const fallback = getFallbackResponse(message, state);
    return { ...fallback, isFallback: true };
  }
}

export async function summarizeIntent(text) {
  try {
    const response = await apiChat(text, "Summarize the user's intent in 2-3 words. Return as plain text.");
    return response.text || "general_inquiry";
  } catch (error) {
    return "general_inquiry";
  }
}

export async function getLocationInsights(location) {
  try {
    const prompt = `Provide 3 short, emoji-rich voting tips for ${location}. Return as JSON: { "tips": ["tip1", "tip2", "tip3"] }`;
    const response = await apiChat(prompt, "You are a helpful election assistant.");
    const data = JSON.parse(response.text);
    return { tips: data.tips || [], source: 'gemini' };
  } catch (error) {
    console.warn("getLocationInsights failed, using local fallback");
    const city = Object.keys(LOCAL_TIPS).find(c => location?.toLowerCase().includes(c.toLowerCase())) || 'default';
    return { tips: LOCAL_TIPS[city], source: 'local' };
  }
}
