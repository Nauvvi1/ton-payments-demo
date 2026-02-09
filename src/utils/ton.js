function tonToNano(ton) {
  const s = String(ton).trim();
  if (!/^\d+(\.\d+)?$/.test(s)) throw new Error('Invalid TON amount');

  const [whole, frac = ''] = s.split('.');
  const fracPadded = (frac + '000000000').slice(0, 9); // 9 decimals
  return BigInt(whole) * 1000000000n + BigInt(fracPadded);
}

module.exports = { tonToNano };
