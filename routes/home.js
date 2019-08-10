const express = require('express');
const router = express.Router();

router.use(express.static('/public'));
router.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/pages/index.html');
});

module.exports = router;