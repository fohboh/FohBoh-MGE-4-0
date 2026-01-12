import { GoogleGenAI } from "@google/genai";
import { ExecutiveDashboard } from "../types.ts";

export class GeminiService {
  async generateInsights(dashboard: ExecutiveDashboard): Promise<string[]> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Analyze restaurant performance for period ${dashboard.dateRange.start} to ${dashboard.dateRange.end}. Total Found: $${dashboard.performance.totalFoundMoney}. Provide 3 actionable executive recommendations as a JSON array of strings.`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text;
      if (text) {
        return JSON.parse(text);
      }
    } catch (error) {
      console.error("Gemini Insight Error:", error);
    }
    
    return [
      "Governance: Ensure the KPI Vault is locked to finalize the period's audit trail.",
      "Revenue: Focus on delivery platform fee reconciliation to reduce variance.",
      "Operations: AI Readiness index suggests automating labor-to-sales detection."
    ];
  }
}

export const geminiService = new GeminiService();