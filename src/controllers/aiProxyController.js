var env = require('../config/env');

async function forwardToPython(req, res) {
  var targetBase = String(env.pythonAiBaseUrl || '').replace(/\/$/, '');
  if (!targetBase) {
    return res.status(503).json({
      success: false,
      error: 'PYTHON_AI_BASE_URL non configurée'
    });
  }

  var requestPath = req.originalUrl;
  if (requestPath.indexOf('/api/ai/health') === 0) {
    requestPath = requestPath.replace('/api/ai/health', '/api/health');
  }

  var targetUrl = targetBase + requestPath;
  var headers = {
    Accept: req.headers.accept || 'application/json'
  };

  if (req.headers['content-type']) {
    headers['Content-Type'] = req.headers['content-type'];
  }
  if (req.headers.authorization) {
    headers.Authorization = req.headers.authorization;
  }

  var init = {
    method: req.method,
    headers: headers
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = JSON.stringify(req.body || {});
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
  }

  try {
    var response = await fetch(targetUrl, init);
    var contentType = response.headers.get('content-type') || '';
    var payload;

    if (contentType.includes('application/json')) {
      payload = await response.json();
      return res.status(response.status).json(payload);
    }

    payload = await response.text();
    return res.status(response.status).type(contentType || 'text/plain').send(payload);
  } catch (error) {
    return res.status(502).json({
      success: false,
      error: 'Python AI service unreachable',
      message: error.message,
      target: targetUrl
    });
  }
}

module.exports = {
  forwardToPython: forwardToPython
};
