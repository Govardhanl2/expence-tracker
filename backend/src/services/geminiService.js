const fs = require('fs');
const Groq = require('groq-sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    this.groq = process.env.GROQ_API_KEY
      ? new Groq({ apiKey: process.env.GROQ_API_KEY })
      : null;
    this.groqTextModel = process.env.GROQ_TEXT_MODEL || 'llama-3.3-70b-versatile';
    this.groqVisionModel = process.env.GROQ_VISION_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct';

    this.gemini = process.env.GEMINI_API_KEY
      ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
      : null;
    this.geminiModelName = 'gemini-1.5-flash';
  }

  _parseJson(rawText, label) {
    const text = (rawText || '').trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error(`No JSON found in ${label} response`);
    return JSON.parse(jsonMatch[0]);
  }

  _getGeminiModel() {
    if (!this.gemini) throw new Error('No AI API key configured');
    return this.gemini.getGenerativeModel({ model: this.geminiModelName });
  }

  async _groqJson(messages, model) {
    if (!this.groq) throw new Error('GROQ_API_KEY is not configured');

    const completion = await this.groq.chat.completions.create({
      model,
      messages,
      temperature: 0.2,
      max_completion_tokens: 2048,
      response_format: { type: 'json_object' },
    });

    return this._parseJson(completion.choices?.[0]?.message?.content, 'Groq');
  }

  async extractInvoiceData(filePath, mimetype) {
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

    try {
      const fileBuffer = fs.readFileSync(filePath);
      const base64Data = fileBuffer.toString('base64');

      let parsed;
      if (this.groq && mimetype.startsWith('image/')) {
        parsed = await this._groqJson(
          [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: { url: `data:${mimetype};base64,${base64Data}` },
                },
              ],
            },
          ],
          this.groqVisionModel
        );
      } else {
        const model = this._getGeminiModel();
        const result = await model.generateContent([
          {
            inlineData: {
              mimeType: mimetype,
              data: base64Data,
            },
          },
          prompt,
        ]);
        parsed = this._parseJson(result.response.text(), 'Gemini');
      }

      return {
        name: parsed.name || 'Unknown Invoice',
        vendor: parsed.vendor || 'Unknown Vendor',
        amount: parseFloat(parsed.amount) || 0,
        date: parsed.date ? new Date(parsed.date) : new Date(),
        category: ['Food', 'Utility', 'Subscriptions', 'Others'].includes(parsed.category)
          ? parsed.category
          : 'Others',
        currency: parsed.currency || 'USD',
        notes: parsed.notes || '',
      };
    } catch (error) {
      console.error('AI extraction error:', error);
      throw new Error(`AI extraction failed: ${error.message}`);
    }
  }

  async generateInsights(expenses) {
    try {
      if (!expenses || expenses.length === 0) {
        return { insights: [], summary: 'No expense data available for analysis.' };
      }

      const expenseSummary = expenses.map((e) => ({
        name: e.name,
        vendor: e.vendor,
        amount: e.amount,
        category: e.category,
        date: e.date,
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

      if (this.groq) {
        return await this._groqJson(
          [{ role: 'user', content: prompt }],
          this.groqTextModel
        );
      }

      const model = this._getGeminiModel();
      const result = await model.generateContent(prompt);
      return this._parseJson(result.response.text(), 'Gemini insights');
    } catch (error) {
      console.error('AI insights error:', error);
      throw new Error(`Insights generation failed: ${error.message}`);
    }
  }
}

module.exports = new AIService();
