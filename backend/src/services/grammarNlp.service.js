"use strict";

/**
 * Service để gọi API grammar-nlp-service để chấm điểm writing
 */
class GrammarNlpService {
  constructor() {
    // URL của grammar-nlp-service (có thể config từ env)
    this.baseUrl =
      process.env.GRAMMAR_NLP_SERVICE_URL || "http://localhost:8000";
    this.timeout = 30000; // 30 seconds
  }

  /**
   * Gọi API chấm điểm writing
   * @param {string} text - Text cần chấm điểm
   * @param {string} language - Language code (default: "en-US")
   * @returns {Promise<object>} Response từ API
   */
  async gradeWriting(text, language = "en-US") {
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      throw new Error("Text không được để trống");
    }

    const url = `${this.baseUrl}/api/v1/grade_text`;
    const payload = {
      text: text.trim(),
      language: language,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Grammar NLP API error: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();

      if (data.status !== "success") {
        throw new Error(`Grammar NLP API returned error: ${data.message || "Unknown error"}`);
      }

      return data;
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Grammar NLP API timeout");
      }
      console.error("Error calling grammar-nlp-service:", error);
      throw error;
    }
  }
}

module.exports = new GrammarNlpService();

