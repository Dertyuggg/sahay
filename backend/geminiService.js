const { GoogleGenAI, Type, Schema } = require('@google/genai');

// Initialize the Google Gen AI SDK
// The SDK automatically picks up GEMINI_API_KEY from the environment
const ai = new GoogleGenAI();
const MODEL = 'gemini-3.6-flash';

/**
 * Basic text generation wrapper.
 * @param {string} prompt - The text prompt to send to the model.
 * @returns {Promise<string>} The generated text response.
 */
async function generateText(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error('[Gemini Service] generateText Error:', error.message);
    throw error;
  }
}

/**
 * Streaming response generator.
 * @param {string} prompt - The text prompt to send to the model.
 * @returns {AsyncGenerator<string, void, unknown>} An async generator yielding chunks of text.
 */
async function* streamText(prompt) {
  try {
    const responseStream = await ai.models.generateContentStream({
      model: MODEL,
      contents: prompt,
    });
    
    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error('[Gemini Service] streamText Error:', error.message);
    throw error;
  }
}

/**
 * Parses user input into a structured banking intent using Gemini.
 * @param {string} userInput - The natural language command (e.g., "send 500 to Dhyanesh").
 * @returns {Promise<object>} A strictly typed JSON object representing the intent and parameters.
 */
async function parseBankingIntent(userInput) {
  const schema = {
    type: Type.OBJECT,
    properties: {
      intent: {
        type: Type.STRING,
        description: 'The banking intent inferred from the user input. Must be exactly "send_money", "check_balance", or "unknown".',
      },
      params: {
        type: Type.OBJECT,
        description: 'Parameters extracted for the intent. May be empty if not applicable.',
        properties: {
          amount: {
            type: Type.NUMBER,
            description: 'The monetary amount to send, if applicable.',
          },
          contact_name: {
            type: Type.STRING,
            description: 'The recipient name, if applicable.',
          }
        }
      }
    },
    required: ['intent', 'params']
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `You are a helpful banking assistant. Parse the following user command into the requested JSON schema. Command: "${userInput}"`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: 0.1, // Low temperature for more deterministic structured output
      }
    });

    const parsedData = JSON.parse(response.text);
    return parsedData;
  } catch (error) {
    console.error('[Gemini Service] parseBankingIntent Error:', error.message);
    throw error;
  }
}

module.exports = {
  generateText,
  streamText,
  parseBankingIntent
};
