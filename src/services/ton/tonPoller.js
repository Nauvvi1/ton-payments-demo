const { createToncenterClient, getTransactions } = require('./toncenterClient');

function buildTonkeeperLink({ receiverAddress, amountNano, comment }) {
  return (
    `https://app.tonkeeper.com/transfer/${receiverAddress}` +
    `?amount=${amountNano.toString()}` +
    `&text=${encodeURIComponent(comment)}`
  );
}

function extractComment(inMsg) {
  if (!inMsg) return '';

  if (typeof inMsg.message === 'string' && inMsg.message.trim()) {
    return inMsg.message.trim();
  }

  const md = inMsg.msg_data;
  if (md && typeof md.text === 'string' && md.text.trim()) {
    return md.text.trim();
  }

  return '';
}

function computePremiumUntil({ nowMs, currentUntilMs, durationDays }) {
  const base = Math.max(nowMs, currentUntilMs || nowMs);
  return base + durationDays * 24 * 60 * 60 * 1000;
}

function startTonPoller({
  toncenterBase,
  toncenterApiKey,
  receiverAddress,
  pollIntervalMs,
  store,
  premiumDurationDays,
  orderTtlMs = 20 * 60 * 1000,
  logger = console,
}) {
  const client = createToncenterClient({ baseURL: toncenterBase, apiKey: toncenterApiKey });

  const debug = process.env.DEBUG_TON === '1';

  async function tick() {
    store.expireOldOrders(Date.now(), orderTtlMs);

    const data = await getTransactions(client, { address: receiverAddress, limit: 30 });
    if (!data || data.ok !== true || !Array.isArray(data.result)) return;

    for (const tx of data.result) {
      const txId = `${tx?.transaction_id?.lt}:${tx?.transaction_id?.hash}`;
      if (!txId) continue;
      if (store.hasProcessedTx(txId)) continue;
      store.markProcessedTx(txId);

      const inMsg = tx.in_msg || {};
      const valueNano = BigInt(inMsg.value || '0');
      const comment = extractComment(inMsg);

      if (!comment) {
        if (debug && valueNano > 0n) {
          logger.log(`[TON][DEBUG] inbound w/o comment tx=${txId} value=${valueNano}`);
        }
        continue;
      }

      const order = store.getOrder(comment);

      if (!order) {
        if (debug) {
          logger.log(`[TON][DEBUG] payment comment=${comment} tx=${txId} value=${valueNano} BUT order not found`);
        }
        continue;
      }

      if (order.status !== 'pending') continue;
      if (valueNano < order.amountNano) {
        if (debug) {
          logger.log(`[TON][DEBUG] order found but amount too low order=${order.orderId} need=${order.amountNano} got=${valueNano}`);
        }
        continue;
      }

      store.setOrderPaid(order.orderId, txId);

      const user = store.getUser(order.userId);
      const premiumUntil = computePremiumUntil({
        nowMs: Date.now(),
        currentUntilMs: user.premiumUntil,
        durationDays: premiumDurationDays,
      });
      store.grantPremium(order.userId, premiumUntil);

      logger.log(
        `✅ PREMIUM ACTIVATED | user=${order.userId} | order=${order.orderId} | until=${new Date(premiumUntil).toISOString()}`
      );
    }
  }

  const timer = setInterval(() => tick().catch((e) => logger.error('[TON POLLER]', e.message)), pollIntervalMs);

  return {
    stop() {
      clearInterval(timer);
    },
    buildTonkeeperLink,
  };
}

module.exports = { startTonPoller, buildTonkeeperLink };
