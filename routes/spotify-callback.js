const querystring = require('querystring');
const request = require('request');

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;
const stateKey = 'spotify_auth_state';

const spotifyCallback = (req, res) => {
  // your application requests refresh and access tokens
  // after checking the state parameter
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect(`/#${
      querystring.stringify({
        error: 'state_mismatch',
      })}`);
  } else {
    res.clearCookie(stateKey);
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      },
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      json: true,
    };

    request.post(authOptions, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const accessToken = body.access_token;
        const refreshToken = body.refresh_token;

        // we can also pass the token to the browser to make requests from there
        res.redirect(`/profile?${
          querystring.stringify({
            accessToken,
            refreshToken,
          })}`);
      } else {
        res.redirect(`/#${
          querystring.stringify({
            error: 'invalid_token',
          })}`);
      }
    });
  }
};

module.exports = spotifyCallback;
