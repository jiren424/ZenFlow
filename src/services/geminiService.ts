import { GoogleGenAI } from "@google/genai";

let aiInstance: any = null;

const getAi = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. AI features will be disabled.");
      return null;
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export interface CoachMessage {
  role: 'user' | 'model';
  text: string;
}

/**
 * Service pour interagir avec Gemini
 */
export const geminiService = {
  /**
   * Analyse les tâches et le mode actuel pour donner un conseil flash
   */
  async getQuickFocusTip(tasks: string[], currentMode: string): Promise<string> {
    const ai = getAi();
    if (!ai) return "Gardez le focus, vous avancez bien !";

    try {
      const prompt = `En tant que coach de concentration spécialisé en Deep Work, donne un conseil ultra-court (max 15 mots) et percutant pour quelqu'un qui utilise une application Pomodoro.
      Tâches actuelles: ${tasks.join(', ') || 'Aucune tâche spécifique'}
      Mode du minuteur: ${currentMode}
      Sois inspirant, minimaliste et précis.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: "Tu es un coach de concentration minimaliste et zen, inspiré par la philosophie Notion et le Deep Work.",
        }
      });

      return response.text?.trim() || "La clarté mène à l'action.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Une respiration profonde, et on repart.";
    }
  },

  /**
   * Chat interaction
   */
  async chatWithCoach(messages: CoachMessage[], tasks: any[]): Promise<string> {
    const ai = getAi();
    if (!ai) return "Je ne suis pas disponible pour le moment.";

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // On enlève le dernier message du modèle si présent pour le context
      const contextPrompt = `Voici mes tâches actuelles: ${JSON.stringify(tasks)}. Réponds de manière courte et encourageante.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...history,
          { role: 'user', parts: [{ text: contextPrompt }] }
        ],
        config: {
          systemInstruction: "Tu es 'ZenCoach', l'assistant IA intégré à ZenFlow. Ton but est d'aider l'utilisateur à rester concentré, à prioriser ses tâches et à gérer son stress. Réponse en français, ton bienveillant et expert.",
        }
      });

      return response.text?.trim() || "Je suis là pour vous aider.";
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      return "Désolé, j'ai eu une petite déconnexion. Reprenons.";
    }
  }
};
