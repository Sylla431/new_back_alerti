var jwt = require('jsonwebtoken');
var env = require('../config/env');

function getSigningKey() {
  var secret = env.jwtSecret || 'A0A1A2A3A4A5A6A7A8A9B0B1B2B3B4B5B6B7B8B9C0C1C2C3';
  try {
    return Buffer.from(secret, 'base64');
  } catch (error) {
    return Buffer.from(secret);
  }
}

function generateToken(subject) {
  return jwt.sign({}, getSigningKey(), {
    algorithm: 'HS256',
    subject: String(subject),
    expiresIn: '365d'
  });
}

function extractSubject(token) {
  var decoded = jwt.verify(token, getSigningKey(), { algorithms: ['HS256'] });
  return decoded.sub || decoded.subject;
}

function extractSubjectLoose(token) {
  try {
    return extractSubject(token);
  } catch (error) {
    // Compatibilité avec l'ancien extractUsername Java (clé brute)
    var secret = env.jwtSecret || 'A0A1A2A3A4A5A6A7A8A9B0B1B2B3B4B5B6B7B8B9C0C1C2C3';
    var decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
    return decoded.sub || decoded.subject;
  }
}

module.exports = {
  generateToken: generateToken,
  extractSubject: extractSubject,
  extractSubjectLoose: extractSubjectLoose
};
