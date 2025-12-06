const axios = require('axios');
require('dotenv').config();
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_BASE = 'https://newsapi.org/v2';

if (!NEWS_API_KEY) {
  console.warn('WARNING: NEWS_API_KEY not set. /news endpoint will return an error until this is configured.');
}


function buildQueryFromPreferences(preferences = []) {
  if (!Array.isArray(preferences) || preferences.length === 0) {
    return '';
  }
  const tokens = preferences
    .map(p => String(p || '').trim())
    .filter(Boolean);
  return tokens.join(' OR ');
}

async function fetchNewsForPreferences(preferences = [], opts = {}) {
  if (!NEWS_API_KEY) {
    return { success: false, status: 500, message: 'News API key not configured' };
  }

  const query = buildQueryFromPreferences(preferences);

  if (!query) {
    return { success: true, status: 200, articles: [] };
  }

  const params = {
    q: query,
    language: opts.language || 'en',
    pageSize: opts.pageSize || 10,
    sortBy: opts.sortBy || 'publishedAt',
    apiKey: NEWS_API_KEY
  };

  const timeoutMs = opts.timeoutMs || 10000;

  try {
    const res = await axios.get(`${NEWS_API_BASE}/everything`, {
      params,
      timeout: timeoutMs
    });

    if (!res || !res.data || res.data.status !== 'ok') {
      return {
        success: false,
        status: 502,
        message: 'News provider returned non-ok status',
        raw: res?.data
      };
    }

    const articles = (res.data.articles || []).map(a => ({
      title: a.title || null,
      description: a.description || null,
      url: a.url || null,
      source: a.source?.name || null,
      publishedAt: a.publishedAt || null,
      urlToImage: a.urlToImage || null
    }));

    return { success: true, status: 200, articles };
  } catch (err) {
    if (err.response) {
      const status = err.response.status || 502;
      const message = err.response.data?.message || 'News API error';
      if (status === 429) {
        return { success: false, status: 429, message: 'News API rate limit exceeded', raw: err.response.data };
      }
      return { success: false, status, message: `News API error: ${message}`, raw: err.response.data };
    }

    if (err.code === 'ECONNABORTED') {
      return { success: false, status: 504, message: 'News API request timed out' };
    }
    return { success: false, status: 500, message: 'Failed to fetch news', error: err.message };
  }
}

module.exports = { fetchNewsForPreferences };
