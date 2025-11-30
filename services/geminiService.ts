import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateMotivation = async (
  user1Name: string,
  user1Score: number,
  user2Name: string,
  user2Score: number
): Promise<string> => {
  const client = getClient();
  if (!client) return "Keep going! You're doing great!";

  try {
    const prompt = `
      You are a high-energy, super fun fitness coach for two sisters, ${user1Name} and ${user2Name}.
      ${user1Name} has ${user1Score} points.
      ${user2Name} has ${user2Score} points.
      
      Give them a short, punchy, 2-sentence motivational quote. 
      If scores are close, fuel the friendly rivalry. 
      If one is far ahead, encourage the other to catch up.
      Use emojis!
    `;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "You got this! 💪";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Stay consistent and results will come! ✨";
  }
};

export const generateChallenge = async (): Promise<{ title: string; description: string }> => {
  const client = getClient();
  if (!client) return { title: "Plank Challenge", description: "Hold a plank for 1 minute!" };

  try {
    const prompt = `
      Generate a fun, one-off mini fitness or healthy eating challenge for today for two sisters.
      Examples: "No Sugar Challenge", "100 Squats", "Drink 3L Water".
      Return ONLY a JSON object with "title" and "description". Do not use markdown code blocks.
    `;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Challenge Error:", error);
    return { title: "Walk it out", description: "Go for a 30 minute brisk walk together!" };
  }
};

export const askCoach = async (question: string): Promise<string> => {
  const client = getClient();
  if (!client) return "I can't answer right now, but drink your water! 💧";

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a supportive, knowledgeable fitness and nutrition expert. Answer this question briefly (max 50 words) and encouragingly: "${question}"`,
    });
    return response.text || "Focus on consistency!";
  } catch (error) {
    return "Something went wrong, but keep pushing! 💪";
  }
};
