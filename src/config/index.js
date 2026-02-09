require('dotenv').config();

function required(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name} in .env`);
  return v;
}

function toNumber(name, fallback) {
  const v = process.env[name];
  if (v == null || v === '') return fallback;
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error(`Invalid number for ${name}`);
  return n;
}

function toString(name, fallback) {
  const v = process.env[name];
  return (v == null || v === '') ? fallback : String(v);
}

module.exports = {
  PORT: toNumber('PORT', 3000),
  TON_RECEIVER_ADDRESS: required('TON_RECEIVER_ADDRESS'),
  TONCENTER_API_KEY: toString('TONCENTER_API_KEY', ''),
  TONCENTER_BASE: toString('TONCENTER_BASE', 'https://toncenter.com/api/v2'),
  POLL_INTERVAL_MS: toNumber('POLL_INTERVAL_MS', 5000),
  PREMIUM_PRICE_TON: toString('PREMIUM_PRICE_TON', '0.000001'),
  PREMIUM_DURATION_DAYS: toNumber('PREMIUM_DURATION_DAYS', 30),
};
