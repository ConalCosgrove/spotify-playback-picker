
let params = (new URL(document.location)).searchParams;
let access_token = params.get('access_token');
let refresh_token = params.get('refresh_token');
let playing = true;
// Set up our HTTP request
var xhr = new XMLHttpRequest();
var refreshXhr = new XMLHttpRequest();
var changeDeviceXhr = new XMLHttpRequest();
var getNowPlayingXhr = new XMLHttpRequest();
var getTimeXhr = new XMLHttpRequest();
let stateRequest = new XMLHttpRequest();

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

if (access_token) {
  document.cookie = `access_token=${access_token}`;
} else {
  access_token = getCookie('access_token');
}

if (refresh_token) {
  document.cookie = `refresh_token=${refresh_token}`;
} else {
  refresh_token = getCookie('refresh_token');
}

window.history.pushState("object or string", "Title", "/"+window.location.href.substring(window.location.href.lastIndexOf('/') + 1).split("?")[0]);
let last = 0;

function buildDevices(data) {
  document.getElementById('devices').innerHTML = '';
  for (var i = 0; i < data.length; i++) {
    let newDeviceDiv = document.createElement("div");
    let newDeviceText = document.createElement("p");
    newDeviceDiv.id = data[i].is_active ? 'deviceHolderActive': 'deviceHolder';
    const deviceId = data[i].id;
    newDeviceDiv.onclick = function () {
      changeDevice(deviceId);
    }
    newDeviceText.id = 'deviceText';
    newDeviceText.innerHTML = data[i].name;
    newDeviceDiv.appendChild(newDeviceText);
    document.getElementById('devices').appendChild(newDeviceDiv);
    
  }
}

function buildControls() {
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  const volumeSlider = document.getElementById('volumeSlider');
  const playPause = document.getElementById('playPause');
  next.onclick = function () {
    console.log('click')
    stateRequest.open('POST','https://api.spotify.com/v1/me/player/next');
    stateRequest.setRequestHeader('Authorization', `Bearer ${access_token}`);
    stateRequest.send();
  }
  prev.onclick = function () {
    stateRequest.open('POST', 'https://api.spotify.com/v1/me/player/previous');
    stateRequest.setRequestHeader('Authorization', `Bearer ${access_token}`);
    stateRequest.send();
  }
  volumeSlider.onchange = function (e) {
    const newVolume = e.target.value;
    console.log('slider changed');
    stateRequest.open('PUT',`https://api.spotify.com/v1/me/player/volume?volume_percent=${newVolume}`);
    stateRequest.setRequestHeader('Authorization', `Bearer ${access_token}`);
    stateRequest.send();
  }

}

function clearError() {
  const errorHolder = document.getElementById('errorTextHolder');
  errorHolder.parentNode.removeChild(errorHolder);
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
  let volumeSlider = document.getElementById('volumeSlider');
  volumeSlider.value = data.device.volume_percent;
  if (data.progress_ms < last) {
    last = data.progress_ms;
    getNowPlaying();
  } else {
    let time = document.getElementById('time');
    if (!time) {
      buildNowPlaying(data);
      time = document.getElementById('time');
    }
    const ratio = calculateWidth(data);
    time.style.width = `${ratio}%`;
  }
}

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
    window.location.replace('/login');
  }
}

changeDeviceXhr.onload = function () {
  	// Process our return data
	if (changeDeviceXhr.status >= 200 && changeDeviceXhr.status < 300) {
		// This will run when the request is successful
    setTimeout(getDevices,500);
	} else {
		// This will run when it's not
    refreshToken();
	}

	// This will run either way
	// All three of these are optional, depending on what you're trying to do
}

getNowPlayingXhr.onload = function () {
  // Process our return data
if (getNowPlayingXhr.status >= 200 && getNowPlayingXhr.status < 300) {
  // This will run when the request is successful
  getNowPlayingXhr.response ? buildNowPlaying(JSON.parse(getNowPlayingXhr.response)) : null
} else {
    // This will run when it's not
    refreshToken();
  }
}
getTimeXhr.onload = function () {
  if (getTimeXhr.status >= 200 && getTimeXhr.status < 300) {
    getTimeXhr.response ? setTime(JSON.parse(getTimeXhr.response)) : null;
  } else {
		// This will run when it's not
    refreshToken();
	}
}

stateRequest.onload = function () {
  if (stateRequest.status === 403) {
    const sliderHolder = document.getElementById('volumeSliderHolder');
    const errorBox = document.createElement('div');
    errorBox.id = 'errorTextHolder';
    const errorText = document.createElement('p');
    errorText.innerHTML = JSON.parse(stateRequest.response).error.message;
    errorBox.appendChild(errorText);
    sliderHolder.appendChild(errorBox);
    setTimeout(clearError, 2000);
  }
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
buildControls();
getNowPlaying();

const interval = setInterval(getTime, 1000);
