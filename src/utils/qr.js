const QRCode = require('qrcode');

async function makeQrDataUrl(text) {
  return QRCode.toDataURL(text);
}

module.exports = { makeQrDataUrl };
