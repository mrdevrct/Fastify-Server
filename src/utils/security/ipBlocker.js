// utils/security/ipBlocker.js
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const BLOCK_TIME = 10 * 60 * 1000; // 10 دقیقه

function isBlocked(ip) {
  const attempt = loginAttempts.get(ip);
  // باید attempt وجود داشته باشه و blockedUntil هم ست شده باشه
  return attempt && attempt.blockedUntil && Date.now() < attempt.blockedUntil;
}

function recordFailedAttempt(ip) {
  let attempt = loginAttempts.get(ip) || { count: 0 };
  attempt.count += 1;
  if (attempt.count >= MAX_ATTEMPTS) {
    attempt.blockedUntil = Date.now() + BLOCK_TIME;
    console.log(`❗ Blocked IP: ${ip} until ${new Date(attempt.blockedUntil).toLocaleString()}`);
  }
  loginAttempts.set(ip, attempt);
}

function resetAttempts(ip) {
  loginAttempts.delete(ip);
}

module.exports = { isBlocked, recordFailedAttempt, resetAttempts };