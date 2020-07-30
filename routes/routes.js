const express = require('express');
const path = require('path');
const changeDevice = require('./changeDevice.js');
const login = require('./login.js');
const profile = require('./profile.js');
const refreshAccessToken = require('./refreshAccessToken');
const spotifyCallback = require('./spotify-callback.js');
const shared = require('./shared.js');
const shareUrl = require('./shareUrl.js');
const tokens = require('./tokens.js');

const router = express.Router();
router.use(express.json());
const use = (route) => (req, res) => route(req, res);

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/../public/pages/index.html'));
});
router.get('/changeDevice', use(changeDevice));
router.get('/login', use(login));
router.get('/profile', use(profile));
router.get('/refresh_token', use(refreshAccessToken));
router.get('/spotify-callback', use(spotifyCallback));
router.get('/shared/:id', use(shared));
router.post('/shareUrl', use(shareUrl));
router.get('/tokens/:id', use(tokens));

module.exports = router;
