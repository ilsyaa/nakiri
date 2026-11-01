import logger from '@nakiri/core/utils/logger';

/**
 * Call OpenAI-compatible chat completion endpoint via native fetch
 *
 * @param {Array<{ role: 'system' | 'user' | 'assistant', content: string }>} messages
 * @param {object} [options]
 * @param {number} [options.temperature]
 * @param {number} [options.maxTokens]
 * @returns {Promise<string>}
 */
export async function createChatCompletion(messages, options = {}) {
  const baseUrl = (
    process.env.AI_BASE_URL || 'https://api.openai.com/v1'
  ).replace(/\/+$/, '');
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || 'gpt-4o-mini';

  if (!apiKey) {
    throw new Error('AI_API_KEY is not configured in .env');
  }

  const endpoint = `${baseUrl}/chat/completions`;

  const bodyPayload = {
    model,
    messages,
    stream: false,
    temperature: options.temperature ?? 0.5,
  };

  if (options.maxTokens) {
    bodyPayload.max_tokens = options.maxTokens;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(bodyPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error(
      '[AI_CLIENT]',
      `API request failed: ${response.status} ${response.statusText} - ${errorText}`
    );
    throw new Error(
      `AI API Error (${response.status}): ${response.statusText}`
    );
  }

  const rawBodyText = await response.text();

  let data;
  try {
    data = JSON.parse(rawBodyText);
  } catch (parseErr) {
    // Check if provider returned Server-Sent Events (SSE / streaming) format:
    // data: {...} \n\n data: {...}
    if (rawBodyText.includes('data:')) {
      const lines = rawBodyText.split('\n');
      let combinedContent = '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const payloadStr = trimmed.slice(5).trim();
        if (payloadStr === '[DONE]') continue;

        try {
          const chunk = JSON.parse(payloadStr);
          const delta =
            chunk.choices?.[0]?.delta?.content ||
            chunk.choices?.[0]?.message?.content ||
            '';
          combinedContent += delta;
        } catch {}
      }

      if (combinedContent.trim()) {
        return combinedContent.trim();
      }
    }

    // Attempt to extract the first valid JSON block
    const jsonMatch = rawBodyText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        data = JSON.parse(jsonMatch[0]);
      } catch {}
    }

    if (!data) {
      logger.error(
        '[AI_CLIENT]',
        `JSON Parse Error (${parseErr.message}). Raw response:\n${rawBodyText.slice(0, 500)}`
      );
      throw parseErr;
    }
  }

  const replyContent = data.choices?.[0]?.message?.content?.trim();

  if (!replyContent) {
    throw new Error('Empty response received from AI provider');
  }

  return replyContent;
}
