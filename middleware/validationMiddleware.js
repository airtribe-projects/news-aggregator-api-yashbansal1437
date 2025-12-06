const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegister(req, res, next) {
  const { email, password, name, preferences } = req.body;

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'Invalid or missing email'
    });
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'Password is required and must be at least 8 characters long'
    });
  }

  if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'If provided, name must be a non-empty string'
    });
  }

  if (preferences !== undefined) {
    if (!Array.isArray(preferences)) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'Preferences must be an array'
      });
    }
    for (const p of preferences) {
      if (typeof p !== 'string' || !p.trim()) {
        return res.status(400).json({
          success: false,
          status: 400,
          message: 'Each preference must be a non-empty string'
        });
      }
    }
  }
  req.body.email = email.trim();
  req.body.password = password;
  if (name) req.body.name = name.trim();
  if (preferences) req.body.preferences = preferences.map(p => p.trim());

  return next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'Invalid or missing email'
    });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'Password is required'
    });
  }

  req.body.email = email.trim();
  return next();
}

function validatePreferencesUpdate(req, res, next) {
  const { preferences } = req.body;

  if (!preferences || !Array.isArray(preferences)) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'Missing preferences array'
    });
  }

  for (const p of preferences) {
    if (typeof p !== 'string' || !p.trim()) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'Each preference must be a non-empty string'
      });
    }
  }

  req.body.preferences = preferences.map(p => p.trim());
  return next();
}

module.exports = { validateRegister, validateLogin, validatePreferencesUpdate };
