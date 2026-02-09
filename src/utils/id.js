function generateOrderId(userId) {
  return `premium_${userId}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

module.exports = { generateOrderId };
