const express = require('express');
const { tonToNano } = require('../utils/ton');
const { generateOrderId } = require('../utils/id');
const { makeQrDataUrl } = require('../utils/qr');

function premiumRoutes({ config, store, poller }) {
  const router = express.Router();

  router.post('/buy-premium', async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: 'userId is required' });

      const amountNano = tonToNano(config.PREMIUM_PRICE_TON);
      const orderId = generateOrderId(userId);

      store.createOrder({
        orderId,
        userId: String(userId),
        amountNano,
        status: 'pending',
        createdAt: Date.now(),
      });

      const tonkeeperLink = poller.buildTonkeeperLink({
        receiverAddress: config.TON_RECEIVER_ADDRESS,
        amountNano,
        comment: orderId,
      });

      const qrDataUrl = await makeQrDataUrl(tonkeeperLink);

      return res.json({
        orderId,
        amountTon: config.PREMIUM_PRICE_TON,
        tonkeeperLink,
        qrDataUrl,
        message: 'Оплатите из кошелька, который сохраняет comment/text. Комментарий менять нельзя.',
      });
    } catch (e) {
      return res.status(500).json({ error: e.message || 'unknown error' });
    }
  });

  router.get('/orders/:orderId', (req, res) => {
    const order = store.getOrder(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'order not found' });

    return res.json({
      ...order,
      amountNano: order.amountNano.toString(),
    });
  });

  return router;
}

module.exports = { premiumRoutes };
