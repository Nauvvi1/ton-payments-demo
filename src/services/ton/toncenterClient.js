const axios = require('axios');

function createToncenterClient({ baseURL, apiKey }) {
  const headers = {};
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
    headers['X-Api-Key'] = apiKey;
  }

  return axios.create({
    baseURL,
    timeout: 10_000,
    headers,
  });
}

async function getTransactions(client, { address, limit = 20 }) {
  const resp = await client.get('/getTransactions', {
    params: { address, limit },
  });
  return resp.data;
}

module.exports = { createToncenterClient, getTransactions };
