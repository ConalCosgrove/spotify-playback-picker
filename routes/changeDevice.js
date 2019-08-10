const express = require('express');
const router = express.Router();

const buildAuthOptions = (url, access_token) => {
  return {
    url,
    headers: { 'Authorization': `Bearer ${access_token}` },
    json: true
  }
}

router.get('/changeDevices', async (req, res) => {
  const { access_token, device } = req.query;
  const authOptions = buildAuthOptions('https://api.spotify.com/v1/me/player', access_token);
  console.log(`Switching to ${device}`);
  authOptions.body = {device_ids:[device]};
  try {
    const changeResponse = await requests
    .put(authOptions.url)
    .set('Authorization', `Bearer ${access_token}`)
    .send(authOptions.body)
    res.send(changeResponse);
  } catch(error) {
    console.log(error.response ? error.response : error);
    res.status(400).send(error);
  }
});

module.exports = router;