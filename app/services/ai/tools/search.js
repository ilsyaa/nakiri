import logger from '@nakiri/core/utils/logger';

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

  const maxResults = options.maxResults || 4;

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        query,
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
      results.push(`Summary: ${data.answer}`);
    }

    if (Array.isArray(data.results)) {
      for (const item of data.results) {
        if (item.title && item.content) {
          results.push(`- Title: ${item.title}\n  Snippet: ${item.content}`);
        }
      }
    }

    return results.join('\n\n');
  } catch (err) {
    logger.error('[TAVILY_SEARCH]', `Search request error: ${err.message}`);
    return '';
  }
}

