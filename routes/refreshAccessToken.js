const request = require('request');
const fs = require('fs');
const path = require('path');
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

const updateAccessToken = (refreshToken, newAccessToken) => {
  const filePath = path.join(__dirname, '../data/database.json');
  try {
    let map = fs.readFileSync(filePath, { flag: 'r' });
    if (!map) {
      map = {};
    } else {
      map = JSON.parse(map.toString());
      const [mapKey] = Object.entries(map).find(([key, value]) => value.refreshToken === refreshToken);
      if (mapKey) {
        map[mapKey].accessToken = newAccessToken;
	fs.writeFile(filePath, Buffer.from(JSON.stringify(map)), () => {});
        console.log('wrote new access token');
      }
      
    }

  } catch (err) {
    console.log(err);
    return err;
  }
}

const refreshAccessToken = (req, res) => {
  // requesting access token from refresh token
  const { refreshToken } = req.query;
  console.log('refreshing, refreshToken:', refreshToken);
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}` },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    },
    json: true,
  };
  request.post(authOptions, (error, response, body) => {
    console.log(response);
    if (!error && response.statusCode === 200) {
      const { access_token } = body;
      updateAccessToken(refreshToken, access_token);
      res.send({
        access_token,
      });
    } else {
      console.log('Failed to refresh access token, error:', error);
      console.log('Status code is:', response.statusCode);
      res.status(response.statusCode).send(error || 'Failed');
    }
  });
};

module.exports = refreshAccessToken;
