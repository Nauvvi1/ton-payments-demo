const path = require('path');
const express = require('express');

const config = require('./config');
const store = require('./store/memoryStore');
const { startTonPoller } = require('./services/ton/tonPoller');
const { premiumRoutes } = require('./routes/premium.routes');
const { userRoutes } = require('./routes/user.routes');

const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/health', (req, res) => res.json({ ok: true }));

const poller = startTonPoller({
  toncenterBase: config.TONCENTER_BASE,
  toncenterApiKey: config.TONCENTER_API_KEY,
  receiverAddress: config.TON_RECEIVER_ADDRESS,
  pollIntervalMs: config.POLL_INTERVAL_MS,
  store,
  premiumDurationDays: config.PREMIUM_DURATION_DAYS,
  logger: console,
});

app.use('/api', premiumRoutes({ config, store, poller }));
app.use('/api', userRoutes({ store }));

app.listen(config.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${config.PORT}`);
  console.log(`💰 TON receiver: ${config.TON_RECEIVER_ADDRESS}`);
});
