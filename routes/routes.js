const express = require('express');
const path = require('path');
const changeDevice = require('./changeDevice.js');
const login = require('./login.js');
const profile = require('./profile.js');
const refreshAccessToken = require('./refreshAccessToken');
const spotifyCallback = require('./spotify-callback.js');

const router = express.Router();
const use = (route) => (req, res) => route(req, res);


router.get('/profile', use(profile));
router.get('/changeDevice', use(changeDevice));
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/../public/pages/index.html'));
});

router.get('/login', use(login));

router.get('/spotify-callback', use(spotifyCallback));

router.get('/refresh_token', use(refreshAccessToken));

module.exports = router;
