const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

class GeminiService {
  constructor() {
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.modelName = 'gemini-1.5-flash';
  }

  _getModel() {
    return this.client.getGenerativeModel({ model: this.modelName });
  }

  async extractInvoiceData(filePath, mimetype) {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const base64Data = fileBuffer.toString('base64');

      const prompt = `You are a financial document parser. Analyze this invoice, bill, or receipt and extract the following information.

Return ONLY a valid JSON object with these exact fields:
{
  "name": "the invoice/bill name or description (e.g., 'Electricity Bill', 'Restaurant Receipt', 'Netflix Invoice')",
  "vendor": "the merchant, company, or vendor name",
  "amount": <numeric value only, no currency symbols>,
  "date": "date in YYYY-MM-DD format, use today if not found",
  "category": "one of: Food, Utility, Subscriptions, Others",
  "currency": "3-letter currency code (e.g., USD, EUR, INR)",
  "notes": "any additional relevant details"
}

Category guidelines:
- Food: restaurants, grocery stores, food delivery, cafes
- Utility: electricity, water, gas, internet, phone bills
- Subscriptions: Netflix, Spotify, software, magazines, memberships
- Others: everything else

Be precise with amounts. If multiple amounts exist, use the final total.
Return ONLY the JSON object, no markdown, no explanation.`;

      const model = this._getModel();
      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: mimetype,
            data: base64Data,
          },
        },
        prompt,
      ]);

      const rawText = result.response.text().trim();
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in AI response');

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        name:     parsed.name     || 'Unknown Invoice',
        vendor:   parsed.vendor   || 'Unknown Vendor',
        amount:   parseFloat(parsed.amount) || 0,
        date:     parsed.date ? new Date(parsed.date) : new Date(),
        category: ['Food', 'Utility', 'Subscriptions', 'Others'].includes(parsed.category)
          ? parsed.category
          : 'Others',
        currency: parsed.currency || 'USD',
        notes:    parsed.notes    || '',
      };
    } catch (error) {
      console.error('Gemini extraction error:', error);
      throw new Error(`AI extraction failed: ${error.message}`);
    }
  }

  async generateInsights(expenses) {
    try {
      if (!expenses || expenses.length === 0) {
        return { insights: [], summary: 'No expense data available for analysis.' };
      }

      const expenseSummary = expenses.map((e) => ({
        name:     e.name,
        vendor:   e.vendor,
        amount:   e.amount,
        category: e.category,
        date:     e.date,
      }));

      const prompt = `You are a personal finance advisor. Analyze the following expense data and provide actionable financial insights.

Expense Data:
${JSON.stringify(expenseSummary, null, 2)}

Return ONLY a valid JSON object with this structure:
{
  "summary": "2-3 sentence overall financial health summary",
  "totalAnalyzed": <number of expenses>,
  "insights": [
    {
      "type": "warning|info|success|tip",
      "title": "short insight title",
      "description": "detailed actionable description (2-3 sentences)",
      "category": "relevant category or 'Overall'",
      "impact": "high|medium|low"
    }
  ],
  "topCategory": "highest spending category name",
  "topCategoryAmount": <amount>,
  "recommendations": [
    "specific actionable recommendation string"
  ]
}

Provide 4-6 insights. Be specific, data-driven, and practical. Return ONLY the JSON.`;

      const model = this._getModel();
      const result = await model.generateContent(prompt);

      const rawText = result.response.text().trim();
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON in insights response');

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Gemini insights error:', error);
      throw new Error(`Insights generation failed: ${error.message}`);
    }
  }
}

module.exports = new GeminiService();
