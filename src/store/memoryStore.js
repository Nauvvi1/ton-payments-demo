const orders = new Map();
const users = new Map();
const processedTxIds = new Set();

function createOrder(order) {
  orders.set(order.orderId, order);
  return order;
}

function getOrder(orderId) {
  return orders.get(orderId) || null;
}

function setOrderPaid(orderId, txId) {
  const o = orders.get(orderId);
  if (!o) return null;
  o.status = 'paid';
  o.txId = txId;
  orders.set(orderId, o);
  return o;
}

function expireOldOrders(nowMs, ttlMs) {
  for (const o of orders.values()) {
    if (o.status === 'pending' && nowMs - o.createdAt > ttlMs) {
      o.status = 'expired';
      orders.set(o.orderId, o);
    }
  }
}

function getUser(userId) {
  return users.get(userId) || { premium: false, premiumUntil: null };
}

function grantPremium(userId, premiumUntil) {
  users.set(userId, { premium: true, premiumUntil });
}

function hasProcessedTx(txId) {
  return processedTxIds.has(txId);
}

function markProcessedTx(txId) {
  processedTxIds.add(txId);
}

module.exports = {
  createOrder,
  getOrder,
  setOrderPaid,
  expireOldOrders,
  getUser,
  grantPremium,
  hasProcessedTx,
  markProcessedTx,
};
