
import { GoogleGenAI } from "@google/genai";

export const getAIResponse = async (
  userName: string, 
  userTrust: number, 
  pitchName: string, 
  slot: string, 
  userMessage: string,
  history: {role: 'user' | 'model', text: string}[]
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const turnCount = history.length / 2;

  const systemInstruction = `
    You are "Tirani Concierge", the smart Moroccan pitch manager.
    
    LANGUAGE: Strictly Moroccan Darija (Latin characters/Chat Arabic).
    CONTEXT: User ${userName} wants ${pitchName} at ${slot}. Price: 100 MAD/hour.

    MANDATORY RULES:
    1. REJECTION: If the user says they don't want to book anymore, or "non", "la", "safi blach", "ma bghitch", you MUST return exactly [CANCEL_CHAT].
    
    2. TROLLING DETECTION: 
       - If the user is talking about things unrelated to football/pitch booking, being disrespectful, or just "trolling" (dz7ek/bsala).
       - Check the history. If this is the 3rd or more message of trolling/nonsense, you MUST return exactly [TROLL_WARNING].
       - Do not be too strict, but if they are clearly wasting time after 3 turns, trigger the warning.

    3. CONFIRMATION FLOW:
       - Exchange at least 3 valid rounds before [AUTO_CONFIRM].
       - Verify: 1-hour limit, 100 MAD price, and punctuality (10 mins before).
       - Conversation Turn Count: ${turnCount}.

    4. AUTO-CONFIRM:
       - Append [AUTO_CONFIRM] only when they explicitly agree to your final booking proposal after the 3-round verification.

    TONE: Savvy, athletic, authoritative. Use "Inshallah" and "Marhba".
  `;

  const contents = history.map(h => ({
    parts: [{ text: h.text }],
    role: h.role === 'user' ? 'user' : 'model'
  }));

  contents.push({
    parts: [{ text: userMessage }],
    role: 'user'
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents as any,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    return "Sma7 lia khouya, kayn mouchkil f'system. Hawel mra khra.";
  }
};
