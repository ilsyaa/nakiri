import logger from '@nakiri/core/utils/logger';
import { searchWeb } from '#app/services/ai/tools/search.js';

export const AI_TOOLS_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'search_web',
      description:
        'Search the web for up-to-date real-time information, current news, game updates, match results, weather, or facts not in memory.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query keyword in Indonesian or English.',
          },
        },
        required: ['query'],
      },
    },
  },
];

/**
 * Truncate a tool result before appending it to the model conversation.
 *
 * @param {any} value
 * @param {number} maxChars
 * @returns {string}
 */
function truncateToolResult(value, maxChars) {
  const text = String(value ?? '');
  return text.length > maxChars
    ? `${text.slice(0, maxChars)}\n...[truncated]`
    : text;
}

/**
 * Call OpenAI-compatible chat completion endpoint via native fetch with Tool Calling support
 *
 * @param {Array<{ role: 'system' | 'user' | 'assistant' | 'tool', content?: string, tool_calls?: any[], tool_call_id?: string }>} messages
 * @param {object} [options]
 * @param {number} [options.temperature]
 * @param {number} [options.maxTokens]
 * @param {boolean} [options.enableWebSearch]
 * @param {Array<object>} [options.tools] - Additional OpenAI-compatible tool definitions
 * @param {(name: string, rawArgs: string) => Promise<string> | string} [options.executeTool]
 * @param {number} [options.maxToolRounds=3]
 * @param {number} [options.maxToolCalls=4]
 * @param {number} [options.maxToolResultChars=2000]
 * @param {boolean} [options.emptyAsNoReply=false] - Return an empty string when the provider sends no content
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
  const conversation = [...messages];
  const enableWebSearch =
    options.enableWebSearch !== false && Boolean(process.env.TAVILY_API_KEY);
  const skillTools = Array.isArray(options.tools) ? options.tools : [];
  const executeTool =
    typeof options.executeTool === 'function' ? options.executeTool : null;

  const maxToolRounds =
    Number.isInteger(options.maxToolRounds) && options.maxToolRounds > 0
      ? options.maxToolRounds
      : 3;
  const maxToolCalls =
    Number.isInteger(options.maxToolCalls) && options.maxToolCalls > 0
      ? options.maxToolCalls
      : 4;
  const maxToolResultChars =
    Number.isInteger(options.maxToolResultChars) &&
    options.maxToolResultChars > 0
      ? options.maxToolResultChars
      : 2000;
  let currentRound = 0;
  let toolCallsUsed = 0;

  while (currentRound <= maxToolRounds) {
    currentRound++;

    const bodyPayload = {
      model,
      messages: conversation,
      stream: false,
      temperature: options.temperature ?? 0.5,
    };

    if (options.maxTokens) {
      bodyPayload.max_tokens = options.maxTokens;
    }

    const tools = [
      ...(enableWebSearch ? AI_TOOLS_DEFINITIONS : []),
      ...skillTools,
    ];

    if (tools.length > 0) {
      bodyPayload.tools = tools;
      bodyPayload.tool_choice = 'auto';
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

    const choice = data.choices?.[0];
    const message = choice?.message;

    if (!message) {
      throw new Error('Empty response received from AI provider');
    }

    // Check if AI requested tool execution (search_web or a registered skill)
    if (message.tool_calls && message.tool_calls.length > 0) {
      if (currentRound >= maxToolRounds) {
        throw new Error('Exceeded maximum tool calling rounds');
      }

      const remainingCalls = maxToolCalls - toolCallsUsed;
      if (remainingCalls <= 0) {
        throw new Error('Exceeded maximum tool calls');
      }

      const toolCalls = message.tool_calls.slice(0, remainingCalls);
      if (toolCalls.length < message.tool_calls.length) {
        logger.warn(
          '[AI_CLIENT]',
          `Dropped ${message.tool_calls.length - toolCalls.length} tool call(s) over the per-request limit`
        );
      }

      conversation.push({ ...message, tool_calls: toolCalls });
      toolCallsUsed += toolCalls.length;

      for (const toolCall of toolCalls) {
        const toolName = toolCall.function?.name || '';
        const rawArgs = toolCall.function?.arguments || '{}';
        let toolResult = '';

        if (toolName === 'search_web') {
          let query = '';
          try {
            const args = JSON.parse(rawArgs || '{}');
            query = args.query;
          } catch {
            query = rawArgs || '';
          }

          logger.info('[AI_SEARCH]', `Searching web: "${query}"`);
          toolResult =
            (await searchWeb(query)) || 'No relevant information found on web.';
        } else if (executeTool) {
          try {
            toolResult = await executeTool(toolName, rawArgs);
          } catch (err) {
            logger.error(
              '[AI_CLIENT]',
              `Tool "${toolName}" failed: ${err.message}`
            );
          }
        }

        conversation.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: truncateToolResult(
            toolResult || `Tool "${toolName}" is not available.`,
            maxToolResultChars
          ),
        });
      }

      // Loop back to send tool result to LLM
      continue;
    }

    const replyContent = message.content?.trim();
    if (!replyContent) {
      if (options.emptyAsNoReply) {
        return '';
      }
      throw new Error('Empty message content received from AI provider');
    }

    return replyContent;
  }

  throw new Error('Exceeded maximum tool calling rounds');
}
