
document.getElementById('myH1').innerHTML = 'My Spotify Selector';
let params = (new URL(document.location)).searchParams;
let access_token = params.get('access_token');
const refresh_token = params.get('refresh_token');
let last = 0;

function buildDevices(data) {
  document.getElementById('devices').innerHTML = '';
  for (var i = 0; i < data.length; i++) {
    let newDeviceDiv = document.createElement("div");
    let newDeviceText = document.createElement("p");
    newDeviceDiv.id = data[i].is_active ? 'deviceHolderActive': 'deviceHolder';
    const deviceId = data[i].id;
    const deviceName = data[i].name;
    newDeviceDiv.onclick = function () {
      changeDevice(deviceId);
    }
    newDeviceText.id = 'deviceText';
    newDeviceText.innerHTML = data[i].name;
    newDeviceDiv.appendChild(newDeviceText);
    document.getElementById('devices').appendChild(newDeviceDiv);
    
  }
}

function calculateWidth (songData) {
  const currentTime = songData.progress_ms;
  last = currentTime;
  const length = songData.item.duration_ms;

  return Math.floor( 100 * (currentTime / length) );
}

function buildNowPlaying(data) {
  let nowPlayingHolder = document.getElementById('nowPlaying');
  nowPlayingHolder.innerHTML = '';
  const artHolder = document.createElement('div');
  artHolder.id = 'artworkHolder';
  const artwork = document.createElement("img");
  const timeDisplay = document.createElement("div");
  timeDisplay.id = 'time';
  timeDisplay.style.width = `${calculateWidth(data)}%`;
  timeDisplay.style.backgroundColor = '#1DB954';
  const title = document.createElement('h3');
  title.innerHTML = data.item.name;
  const artist = document.createElement('h4');
  artist.innerHTML = data.item.artists[0].name + ' - ' + data.item.album.name;
  artwork.src = data.item.album.images[1].url;
  artwork.id = 'artwork';
  artHolder.appendChild(artwork);
  artHolder.appendChild(timeDisplay);
  nowPlayingHolder.appendChild(artHolder);
  nowPlayingHolder.appendChild(title);
  nowPlayingHolder.appendChild(artist)
}

function setTime(data) {
  if (data.progress_ms < last) {
    last = data.progress_ms;
    getNowPlaying();
  } else {
    let time = document.getElementById('time');
    const ratio = calculateWidth(data);
    time.style.width = `${ratio}%`;
  }
}


// Set up our HTTP request
var xhr = new XMLHttpRequest();
var refreshXhr = new XMLHttpRequest();
var changeDeviceXhr = new XMLHttpRequest();
var getNowPlayingXhr = new XMLHttpRequest();
var getTimeXhr = new XMLHttpRequest();

// Setup our listener to process completed requests
xhr.onload = function () {

	// Process our return data
	if (xhr.status >= 200 && xhr.status < 300) {
		// This will run when the request is successful
    buildDevices(JSON.parse(xhr.response).devices);
	} else {
		// This will run when it's not
    refreshToken();
	}

	// This will run either way
	// All three of these are optional, depending on what you're trying to do
};

refreshXhr.onload = function () {
  if (refreshXhr.status >= 200 && refreshXhr.status < 300) {
    access_token = JSON.parse(refreshXhr.response).access_token;
    getDevices();
  } else {
    console.error('could not refresh access token :(');
  }
}

changeDeviceXhr.onload = function () {
  	// Process our return data
	if (changeDeviceXhr.status >= 200 && changeDeviceXhr.status < 300) {
		// This will run when the request is successful
    setTimeout(getDevices(),1000);
	} else {
		// This will run when it's not
	}

	// This will run either way
	// All three of these are optional, depending on what you're trying to do
}

getNowPlayingXhr.onload = function () {
  // Process our return data
if (getNowPlayingXhr.status >= 200 && getNowPlayingXhr.status < 300) {
  // This will run when the request is successful
  buildNowPlaying(JSON.parse(getNowPlayingXhr.response))
} else {
  // This will run when it's not
}

getTimeXhr.onload = function () {
  if (getTimeXhr.status >= 200 && getTimeXhr.status < 300) {
    setTime(JSON.parse(getTimeXhr.response));
  }
}

// This will run either way
// All three of these are optional, depending on what you're trying to do
}

function getDevices() {
  xhr.open('GET', 'https://api.spotify.com/v1/me/player/devices',);
  xhr.setRequestHeader('Authorization', `Bearer ${access_token}`);
  xhr.send();
}

function refreshToken() {
  refreshXhr.open('GET', `/refresh_token?refresh_token=${refresh_token}`,);
  refreshXhr.send();
}

function changeDevice(id) {
  changeDeviceXhr.open('GET', `/changeDevice?access_token=${access_token}&device=${id}`,);
  changeDeviceXhr.send();
}

function getNowPlaying() {
  getNowPlayingXhr.open('GET', 'https://api.spotify.com/v1/me/player',);
  getNowPlayingXhr.setRequestHeader('Authorization', `Bearer ${access_token}`);
  getNowPlayingXhr.send();
}

function getTime() {
  getTimeXhr.open('GET', 'https://api.spotify.com/v1/me/player',);
  getTimeXhr.setRequestHeader('Authorization', `Bearer ${access_token}`);
  getTimeXhr.send();
}

getDevices()

getNowPlaying();

const interval = setInterval(getTime, 1000);