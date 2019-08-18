const requests = require('superagent');

const buildAuthOptions = (url, accessToken) => ({
  url,
  headers: { Authorization: `Bearer ${accessToken}` },
  json: true,
});

const changeDevice = async (req, res) => {
  const { accessToken, device } = req.query;
  const authOptions = buildAuthOptions('https://api.spotify.com/v1/me/player', accessToken);
  console.log(`Switching to ${device}`);
  authOptions.body = { device_ids: [device] };
  try {
    const changeResponse = await requests
      .put(authOptions.url)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(authOptions.body);
    res.send(changeResponse);
  } catch (error) {
    console.log(error.response ? error.response : error);
    res.status(400).send(error);
  }
};

module.exports = changeDevice;
