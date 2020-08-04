# Democratise Your Party's Playlist!

Log on to [party.conal.tech](https://party.conal.tech), click to get a sharable link and let anyone with the link add songs to your Spotify queue!

# Set up locally: 

- Clone this repo
- Go to [https://developer.spotify.com/dashboard](https://developer.spotify.com/dashboard), log in and create an application. Note the client id and client secret.
- In your terminal, `cd` into spotify-playback-picker and run `npm install` 
- Set the environment variables: 
  - `export CLIENT_ID=<your app's client id>`
  - `export CLIENT_SECRET=<your app's client secret>`
  - `export PORT=<whatever port you want to run on>`
  - `export CALLBACK_URL=http://localhost:<PORT>/spotify-callback` - replace <PORT> with whatever port you specified in the previous variable.
  
  ## Important! 
  In order for your redirect URI to be valid, you must specify it in your application on [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard).
  Go to your application on developer.spotify.com/dashboard, click the "edit settings" button, and add your redirect uri complete with http:// at the start and the port, and `/spotify-callback` at the end. Eg. `http://localhost:8000/spotify-callback`
