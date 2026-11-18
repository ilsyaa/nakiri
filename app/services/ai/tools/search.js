import logger from '@nakiri/core/utils/logger';

const MAX_QUERY_CHARS = 300;
const MAX_SNIPPET_CHARS = 500;
const MAX_RESULT_CHARS = 1800;

/**
 * Perform a web search using Tavily Search API
 *
 * @param {string} query
 * @param {object} [options]
 * @param {number} [options.maxResults]
 * @returns {Promise<string>} Clean text summary of search results for LLM
 */
export async function searchWeb(query, options = {}) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    logger.warn('[TAVILY_SEARCH]', 'TAVILY_API_KEY is not configured in .env');
    return '';
  }

  const cleanQuery = String(query || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_QUERY_CHARS);
  if (!cleanQuery) return '';

  const maxResults = options.maxResults || 4;

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: cleanQuery,
        search_depth: 'basic',
        include_answer: true,
        max_results: maxResults,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      logger.error(
        '[TAVILY_SEARCH]',
        `Tavily search failed: ${response.status} - ${errText}`
      );
      return '';
    }

    const data = await response.json();
    const results = [];

    if (data.answer) {
      results.push(
        `Summary: ${String(data.answer).slice(0, MAX_SNIPPET_CHARS)}`
      );
    }

    if (Array.isArray(data.results)) {
      for (const item of data.results) {
        if (item.title && item.content) {
          const snippet = String(item.content)
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, MAX_SNIPPET_CHARS);
          results.push(`- Title: ${item.title}\n  Snippet: ${snippet}`);
        }
      }
    }

    return results.join('\n\n').slice(0, MAX_RESULT_CHARS);
  } catch (err) {
    logger.error('[TAVILY_SEARCH]', `Search request error: ${err.message}`);
    return '';
  }
}
