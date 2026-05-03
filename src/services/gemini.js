import { apiChat } from './api.js'
import { getFallbackResponse } from '../utils/fallbackEngine'

export async function generateChatResponse(message, state) {
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
2. Do not hallucinate local laws, but you MUST provide general knowledge about who is contesting or what election is happening if asked.
3. If Easy Mode Active is true, you MUST use very simple vocabulary, short sentences, and be extremely easy to understand.
4. YOU MUST prefix your conversational response with "Based on your current step..." if giving instructions or answering questions about the process.
5. If the user seems unsure or hesitant about voting, provide encouragement and explain the importance of voting in simple terms.
6. ACT LIKE YOU REMEMBER PREVIOUS CONTEXT. If the user mentioned they are a first-timer, or their location, use that in your response (e.g., "Since you are a first-time voter in ${state.location || 'your area'}...").

Return your response in a JSON format:
{
  "text": "Your conversational response here",
  "extracted_intent": "one of: general_question, location_inquiry, requirements_inquiry, timeline_inquiry, at_polling_station, voting_process, local_awareness_inquiry, guided_mode_request, candidates_inquiry",
  "extracted_location": "location if the user mentions one, else null",
  "is_first_time": true/false if they mentioned it, else null
}
Ensure the output is strictly valid JSON without markdown wrapping.`

  try {
    const response = await apiChat(message, systemPrompt)
    if (response && response.text && !response.error) {
      if (!response.text.startsWith("Based on your current step")) {
        response.text = "Based on your current step... " + response.text;
      }
      return response
    }
    throw new Error(response.error || 'Invalid response')
  } catch (error) {
    console.warn('AI Unavailable, using fallback engine:', error.message)
    
    // Get a smart fallback response based on keywords and stage
    const fallback = getFallbackResponse(message, state)
    
    return {
      ...fallback,
      text: `AI is temporarily unavailable. I’ll guide you using built-in assistance.\n\n${fallback.text}`,
      isFallback: true
    }
  }
}

export async function generateContent(prompt, state) {
  try {
    const response = await apiChat(prompt, "You are a helpful assistant.");
    return response.text || "No content generated.";
  } catch (error) {
    console.warn("generateContent failed, using fallback:", error);
    return "Based on your current step, I'm unable to generate dynamic content right now.";
  }
}

export async function summarizeIntent(text) {
  try {
    const response = await apiChat(text, "Summarize the user's intent in 2-3 words.");
    return response.text || "general_inquiry";
  } catch (error) {
    console.warn("summarizeIntent failed, using fallback:", error);
    return "general_inquiry";
  }
}
