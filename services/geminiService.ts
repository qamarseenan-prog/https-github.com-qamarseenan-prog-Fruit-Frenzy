import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

try {
  if (process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
} catch (error) {
  console.error("Failed to initialize Gemini client", error);
}

export const generateGameCommentary = async (
  score: number,
  caught: number,
  missed: number
): Promise<string> => {
  if (!ai) {
    return "Great job! (Enable API Key for AI commentary)";
  }

  try {
    const prompt = `
      I just played a simple fruit catching game.
      Here are my stats:
      - Score: ${score}
      - Fruits Caught: ${caught}
      - Fruits Missed: ${missed}

      Act as a witty, slightly sarcastic, but encouraging game announcer.
      Give me a 1-sentence rank (e.g., "Rank: Fruit Ninja Master") and a short 1-2 sentence comment on my performance.
      Keep it fun and under 50 words total.
    `;

    // Fix: Remove maxOutputTokens to avoid "response blocked" issues or requirement to set thinkingBudget.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.8,
      }
    });

    return response.text || "You played so well, I'm speechless!";
  } catch (error) {
    console.error("Error generating commentary:", error);
    return "Well played! (AI unavailable currently)";
  }
};