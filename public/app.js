const buyBtn = document.getElementById('buyBtn');
const checkBtn = document.getElementById('checkBtn');
const userIdInput = document.getElementById('userId');

const orderOut = document.getElementById('orderOut');
const userOut = document.getElementById('userOut');

const payBox = document.getElementById('payBox');
const payLink = document.getElementById('payLink');
const qr = document.getElementById('qr');

let lastUserId = userIdInput.value;
let lastOrderId = null;

async function buyPremium(userId) {
  const resp = await fetch('/api/buy-premium', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error || 'Request failed');
  return data;
}

async function getUser(userId) {
  const resp = await fetch(`/api/user/${encodeURIComponent(userId)}`);
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error || 'Request failed');
  return data;
}

async function getOrder(orderId) {
  const resp = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error || 'Request failed');
  return data;
}

async function pollUntilPaid(orderId, userId) {
  for (;;) {
    const order = await getOrder(orderId);
    if (order.status === 'paid') return;
    const u = await getUser(userId);
    if (u.premium) return;
    await new Promise(r => setTimeout(r, 2000));
  }
}

buyBtn.addEventListener('click', async () => {
  try {
    const userId = userIdInput.value.trim();
    if (!userId) return;

    lastUserId = userId;
    orderOut.textContent = 'Creating...';

    const data = await buyPremium(userId);
    lastOrderId = data.orderId;

    orderOut.textContent = JSON.stringify(data, null, 2);

    payBox.classList.remove('hidden');
    payLink.href = data.tonkeeperLink;
    qr.src = data.qrDataUrl;

    userOut.textContent = 'Waiting for payment...';
    pollUntilPaid(lastOrderId, lastUserId)
      .then(async () => {
        const u = await getUser(lastUserId);
        userOut.textContent = JSON.stringify(u, null, 2);
      })
      .catch(() => {});
  } catch (e) {
    orderOut.textContent = String(e.message || e);
  }
});

checkBtn.addEventListener('click', async () => {
  try {
    const userId = userIdInput.value.trim();
    if (!userId) return;
    const u = await getUser(userId);
    userOut.textContent = JSON.stringify(u, null, 2);
  } catch (e) {
    userOut.textContent = String(e.message || e);
  }
});
