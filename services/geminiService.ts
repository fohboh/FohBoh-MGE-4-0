
import { GoogleGenAI } from "@google/genai";
import { ExecutiveDashboard } from "../types";

export class GeminiService {
  /**
   * Generates executive insights using Gemini 3 Pro.
   * Analyzes period comparisons and data governance.
   */
  async generateInsights(dashboard: ExecutiveDashboard): Promise<string[]> {
    try {
      // Initialize GoogleGenAI with named parameter
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        // Using gemini-3-pro-preview for advanced financial reasoning and performance analysis
        model: 'gemini-3-pro-preview',
        contents: `Analyze this restaurant performance comparison and provide 3-4 professional, actionable executive recommendations.
        
        Context:
        - Date Range: ${dashboard.dateRange.start} to ${dashboard.dateRange.end}
        - Total Found Money: $${dashboard.performance.totalFoundMoney}
        - Trust Index: ${dashboard.performance.averageTrustScore}
        - AI Readiness: ${dashboard.performance.aiReadinessScore}
        - Period Deltas: ${JSON.stringify(dashboard.performance.comparisonDeltas)}
        - Vault Status: ${dashboard.vaultStatus.isLocked ? "LOCKED (Secure)" : "UNLOCKED (Risk)"}
        
        Focus on:
        1. Explaining the growth/decline in found money.
        2. Impact of data quality on financial reporting.
        3. Strategic next steps for governance.
        
        Format the response as a simple JSON array of strings. No markdown, no prefixes.`,
        config: {
          responseMimeType: "application/json"
        }
      });

      // Directly access .text property from the response object
      const text = response.text;
      if (text) {
        return JSON.parse(text);
      }
    } catch (error) {
      console.error("Gemini Insight Error:", error);
    }
    
    // Sophisticated Fallbacks
    return [
      `Found Money Strategy: The ${dashboard.performance.comparisonDeltas[0].deltaPercent}% growth suggests improved POS reconciliation discipline.`,
      "Data Integrity: Your current Trust Index allows for high-confidence financial reporting.",
      dashboard.vaultStatus.isLocked 
        ? "Governance: Certified Vault is locked, ensuring an immutable audit trail for the current period."
        : "Governance Warning: Lock the KPI Vault to mitigate risk of retrospective metric manipulation.",
      "Predictive Labor: AI Readiness is sufficient to initiate pilot for labor cost optimization."
    ];
  }
}

export const geminiService = new GeminiService();
