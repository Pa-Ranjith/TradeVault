const NVIDIA_API_KEY = "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";
const API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

export interface PortfolioItem {
    symbol: string;
    quantity: number;
    avgPrice: number;
    sector?: string;
    currentPrice?: number;
    value?: number;
}

export async function analyzePortfolio(portfolio: PortfolioItem[]) {
    const portfolioString = portfolio
        .map(item => `${item.symbol}: ${item.quantity} units @ ₹${item.avgPrice} (${item.sector || 'Unknown Sector'})`)
        .join("\n");

    const systemPrompt = `You are an elite Portfolio Strategist and Market Analyst at TradeVault. 
Your goal is to provide institutional-grade analysis of a user's stock portfolio. 
Analyze the following portfolio in all aspects:
- Sector distribution (Overweight/Underweight).
- Concentration risk.
- Alpha potential (What's working).
- Reallocation suggestions (What needs moving).
- Specific sector-level suggestions with professional reasoning.

Format your response in a CLEAN JSON-like structure that can be easily parsed or directly rendered.
Structure:
{
  "summary": "Overall health of the portfolio",
  "highlights": ["point 1", "point 2"],
  "reallocations": [
    { "from": "Sector/Stock", "to": "Sector/Stock", "reason": "Why?" }
  ],
  "sectorAnalysis": [
    { "sector": "Name", "status": "Overweight/Underweight", "suggestion": "Action" }
  ],
  "alphaScore": 0-100
}`;

    const userPrompt = `Analyze this portfolio:\n${portfolioString}`;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${NVIDIA_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "meta/llama-3.1-405b-instruct", // High capacity model for complex reasoning
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.2,
                max_tokens: 2000,
            }),
        });

        if (!response.ok) {
            throw new Error(`NVIDIA API Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("AI Analysis Failed:", error);
        throw error;
    }
}
