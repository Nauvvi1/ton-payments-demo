const express = require('express');

function userRoutes({ store }) {
  const router = express.Router();

  router.get('/user/:userId', (req, res) => {
    const user = store.getUser(req.params.userId);
    return res.json(user);
  });

  return router;
}

module.exports = { userRoutes };
