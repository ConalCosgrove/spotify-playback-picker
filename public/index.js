
const params = (new URL(document.location)).searchParams;
let accessToken = params.get('accessToken');
let refreshToken = params.get('refreshToken');
// Set up our HTTP request
const xhr = new XMLHttpRequest();
const refreshXhr = new XMLHttpRequest();
const changeDeviceXhr = new XMLHttpRequest();
const getNowPlayingXhr = new XMLHttpRequest();
const getTimeXhr = new XMLHttpRequest();
const stateRequest = new XMLHttpRequest();

function getCookie(cname) {
  const name = `${cname}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i += 1) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

function changeDevice(id) {
  changeDeviceXhr.open('GET', `/changeDevice?accessToken=${accessToken}&device=${id}`);
  changeDeviceXhr.send();
}

function getDevices() {
  xhr.open('GET', 'https://api.spotify.com/v1/me/player/devices');
  xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
  xhr.send();
}

function refreshAccessToken() {
  refreshXhr.open('GET', `/refreshToken?refreshToken=${refreshToken}`);
  refreshXhr.send();
}

function getNowPlaying() {
  getNowPlayingXhr.open('GET', 'https://api.spotify.com/v1/me/player');
  getNowPlayingXhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
  getNowPlayingXhr.send();
}

function getTime() {
  getTimeXhr.open('GET', 'https://api.spotify.com/v1/me/player');
  getTimeXhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
  getTimeXhr.send();
}

if (accessToken) {
  document.cookie = `accessToken=${accessToken}`;
} else {
  accessToken = getCookie('accessToken');
}

if (refreshToken) {
  document.cookie = `refreshToken=${refreshToken}`;
} else {
  refreshToken = getCookie('refreshToken');
}

window.history.pushState('object or string', 'Title', `/${window.location.href.substring(window.location.href.lastIndexOf('/') + 1).split('?')[0]}`);
let last = 0;

function buildDevices(data) {
  document.getElementById('devices').innerHTML = '';
  for (let i = 0; i < data.length; i += 1) {
    const newDeviceDiv = document.createElement('div');
    const newDeviceText = document.createElement('p');
    newDeviceDiv.id = data[i].is_active ? 'deviceHolderActive' : 'deviceHolder';
    const deviceId = data[i].id;
    newDeviceDiv.onclick = () => {
      changeDevice(deviceId);
    };
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
  // const playPause = document.getElementById('playPause');
  next.onclick = () => {
    stateRequest.open('POST', 'https://api.spotify.com/v1/me/player/next');
    stateRequest.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    stateRequest.send();
  };
  prev.onclick = () => {
    stateRequest.open('POST', 'https://api.spotify.com/v1/me/player/previous');
    stateRequest.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    stateRequest.send();
  };
  volumeSlider.onchange = (e) => {
    const newVolume = e.target.value;
    stateRequest.open('PUT', `https://api.spotify.com/v1/me/player/volume?volume_percent=${newVolume}`);
    stateRequest.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    stateRequest.send();
  };
}

function clearError() {
  const errorHolder = document.getElementById('errorTextHolder');
  errorHolder.parentNode.removeChild(errorHolder);
}

function calculateWidth(songData) {
  const currentTime = songData.progress_ms;
  last = currentTime;
  const length = songData.item.duration_ms;

  return Math.floor(100 * (currentTime / length));
}

function buildNowPlaying(data) {
  const nowPlayingHolder = document.getElementById('nowPlaying');
  nowPlayingHolder.innerHTML = '';
  const artHolder = document.createElement('div');
  artHolder.id = 'artworkHolder';
  const artwork = document.createElement('img');
  const timeDisplay = document.createElement('div');
  timeDisplay.id = 'time';
  timeDisplay.style.width = `${calculateWidth(data)}%`;
  const title = document.createElement('h3');
  title.innerHTML = data.item.name;
  const artist = document.createElement('h4');
  artist.innerHTML = `${data.item.artists[0].name} - ${data.item.album.name}`;
  artwork.src = data.item.album.images[1].url;
  artwork.id = 'artwork';
  artHolder.appendChild(artwork);
  artHolder.appendChild(timeDisplay);
  nowPlayingHolder.appendChild(artHolder);
  nowPlayingHolder.appendChild(title);
  nowPlayingHolder.appendChild(artist);
}

function setTime(data) {
  const volumeSlider = document.getElementById('volumeSlider');
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
xhr.onload = () => {
  // Process our return data
  if (xhr.status >= 200 && xhr.status < 300) {
    // This will run when the request is successful
    buildDevices(JSON.parse(xhr.response).devices);
  } else {
    // This will run when it's not
    refreshAccessToken();
  }

  // This will run either way
  // All three of these are optional, depending on what you're trying to do
};

refreshXhr.onload = () => {
  if (refreshXhr.status >= 200 && refreshXhr.status < 300) {
    accessToken = JSON.parse(refreshXhr.response).accessToken;
    getDevices();
  } else {
    console.error('could not refresh access token :(');
    window.location.replace('/login');
  }
};

changeDeviceXhr.onload = () => {
  if (changeDeviceXhr.status >= 200 && changeDeviceXhr.status < 300) {
    setTimeout(getDevices, 500);
  } else {
    refreshAccessToken();
  }
};

getNowPlayingXhr.onload = () => {
  if (getNowPlayingXhr.status >= 200 && getNowPlayingXhr.status < 300) {
    if (getNowPlayingXhr.response) {
      buildNowPlaying(JSON.parse(getNowPlayingXhr.response));
    }
  } else {
    refreshAccessToken();
  }
};
getTimeXhr.onload = () => {
  if (getTimeXhr.status >= 200 && getTimeXhr.status < 300) {
    if (getTimeXhr.response) {
      setTime(JSON.parse(getTimeXhr.response));
    }
  } else {
    // This will run when it's not
    refreshAccessToken();
  }
};

stateRequest.onload = () => {
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
};

getDevices();
buildControls();
getNowPlaying();

setInterval(getTime, 1000);
