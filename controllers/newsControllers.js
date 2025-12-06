const { fetchNewsForPreferences } = require('../services/newsService');
const { getUserPreferences } = require('./usersControllers');

async function getNewsForUser(req, res) {
  try {
    const email = req.user?.email;
    if (!email) {
      return res.status(401).json({
        success: false,
        status: 401,
        message: 'Unauthorized: missing user email'
      });
    }

    const prefResult = await getUserPreferences(email);

    if (!prefResult.success) {
      return res
        .status(prefResult.status || 500)
        .json(prefResult);
    }

    const preferences = prefResult.preferences || [];

    const newsResult = await fetchNewsForPreferences(preferences);

    if (!newsResult.success) {
      return res
        .status(newsResult.status || 500)
        .json({
          success: false,
          status: newsResult.status || 500,
          message: newsResult.message
        });
    }
    
    return res.status(200).json({
      success: true,
      status: 200,
      news: newsResult.articles
    });

  } catch (err) {
    console.error('Error in getNewsForUser:', err);
    return res.status(500).json({
      success: false,
      status: 500,
      message: 'Server error while fetching news'
    });
  }
}

module.exports = { getNewsForUser };
