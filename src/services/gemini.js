import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

let ai = null;
if (apiKey) {
  ai = new GoogleGenerativeAI(apiKey);
}

export async function generateChatResponse(message, state) {
  if (!ai) {
    return {
      text: "Error: Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env file.",
      intent: "error"
    };
  }

  const systemPrompt = `
You are ElectionAssist, a helpful, neutral, and precise election assistant.
Current user language: ${state.user_language}. YOU MUST RESPOND IN THIS LANGUAGE.
User Context:
- Stage: ${state.user_stage}
- First time voter: ${state.first_time_voter}
- Location: ${state.location || 'Unknown'}
- Simple Mode Active: ${state.simple_mode}

Rules:
1. Provide short, structured, step-by-step responses.
2. Do not hallucinate local laws, but you MAY provide general knowledge about who is contesting or what election is happening if asked.
3. If Simple Mode Active is true, you MUST use very simple vocabulary, short sentences, and be extremely easy to understand.
4. Prefix your conversational response with "Based on your current step..." if giving instructions.

Return your response in a JSON format:
{
  "text": "Your conversational response here",
  "extracted_intent": "one of: general_question, location_inquiry, requirements_inquiry, timeline_inquiry, at_polling_station, voting_process, local_awareness_inquiry, guided_mode_request",
  "extracted_location": "location if the user mentions one, else null",
  "is_first_time": true/false if they mentioned it, else null
}
Ensure the output is strictly valid JSON without markdown wrapping.`;

  try {
    const model = ai.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    });

    const result = await model.generateContent(message);
    const responseText = result.response.text();

    if (responseText) {
        try {
            const parsed = JSON.parse(responseText);
            return parsed;
        } catch (e) {
             console.error("Failed to parse Gemini JSON output", e, responseText);
             return {
                 text: "I encountered an error processing my response. " + responseText,
                 intent: "general_question"
             }
        }
    }
    
    return { text: "I'm sorry, I couldn't process that.", intent: "general_question" };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      text: "Sorry, I'm having trouble connecting to my service right now.",
      intent: "error"
    };
  }
}
