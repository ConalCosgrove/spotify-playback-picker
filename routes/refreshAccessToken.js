const request = require('request');

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

const refreshAccessToken = (req, res) => {
  // requesting access token from refresh token
  const { refreshToken } = req.query;
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}` },
    form: {
      grant_type: 'refresh_token',
      refreshToken,
    },
    json: true,
  };
  request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const { accessToken } = body;
      res.send({
        accessToken,
      });
    } else {
      console.log('Failed to refresh access token, error:', error);
      res.status(response.statusCode).send(error || 'Failed');
    }
  });
};

module.exports = refreshAccessToken;
