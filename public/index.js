const params = (new URL(document.location)).searchParams;
let accessToken = params.get('accessToken');
let refreshToken = params.get('refreshToken');
let isPlaying = true;
// Set up our HTTP request
const xhr = new XMLHttpRequest();
const refreshXhr = new XMLHttpRequest();
const changeDeviceXhr = new XMLHttpRequest();
const getNowPlayingXhr = new XMLHttpRequest();
const getTimeXhr = new XMLHttpRequest();
const stateRequest = new XMLHttpRequest();
let devices = [];
let activeDeviceName = '';

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

async function getShareLink() {
  const response = await fetch(`/shareurl?accessToken=${accessToken}&refreshToken=${refreshToken}`, {
    method: 'POST',
  });
  const { id } = await response.json();
  const fullUrl = `${document.location.origin}/shared/${id}`;
  return fullUrl;
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
  devices = data;
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

function switchHighlightedDevice(name) {
  let found = false;
  devices.forEach((device) => {
    if (device.name === name) {
      device.is_active = true;
      found = true;
    } else {
      device.is_active = false;
    }
  });
  if (!found) {
    devices.push({ name, is_active: true });
  }
  activeDeviceName = name;
  buildDevices(devices);
}

function buildControls() {
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  const search = document.getElementById('queueSearchTextBox');
  const volumeSlider = document.getElementById('volumeSlider');
  const playPause = document.getElementById('playPause');

  playPause.onclick = async () => {
    const playOrPause = isPlaying ? 'pause' : 'play';
    const res = await fetch(`https://api.spotify.com/v1/me/player/${playOrPause}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (res.ok) {
      isPlaying = !isPlaying;
    }
  };
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

  search.onkeyup = async (e) => {
    const searchString = e.target.value;
    if (searchString.length < 2) return drawQueue([]);
    const tracks = await fetch(`https://api.spotify.com/v1/search?q=${encodeURI(searchString)}&type=track&limit=5`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const parsed = await tracks.json();
    if (searchString.length >= search.value.length) return drawQueue(parsed.tracks.items);
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

function setUpLinkSharingButton() {
  const sharableLinkButton = document.getElementById('sharableLinkButton');
  sharableLinkButton.onclick = async () => {
    const link = await getShareLink();
    navigator.clipboard.writeText(link);
    sharableLinkButton.textContent = 'Link copied to clipboard!';
  };
}

function buildNowPlaying(data) {
  const nowPlayingHolder = document.getElementById('nowPlaying');
  const artworkHolder = document.getElementById('artworkHolder');
  const songTextHolder = document.getElementById('songText');
  artworkHolder.innerHTML = '';
  songTextHolder.innerHTML = '';
  const artwork = document.createElement('img');
  const timeDisplay = document.createElement('div');
  timeDisplay.id = 'time';
  timeDisplay.style.width = `${calculateWidth(data)}%`;
  const title = document.createElement('h3');
  title.innerHTML = data.item.name;
  title.id = 'songTitleText';
  const artist = document.createElement('h4');
  artist.id = 'songArtistText';
  artist.innerHTML = `${data.item.artists[0].name} - ${data.item.album.name}`;

  songTextHolder.appendChild(title);
  songTextHolder.appendChild(artist);

  artwork.src = data.item.album.images[1].url;
  artwork.id = 'artwork';
  artworkHolder.appendChild(artwork);
  artworkHolder.appendChild(timeDisplay);
  nowPlayingHolder.appendChild(artworkHolder);
  nowPlayingHolder.appendChild(songTextHolder);
}

function setTime(data) {
  if (data.device.name !== activeDeviceName) switchHighlightedDevice(data.device.name);
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
      const parsed = JSON.parse(getTimeXhr.response);
      setTime(JSON.parse(getTimeXhr.response));
      isPlaying = parsed.is_playing;
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
setUpLinkSharingButton();
setInterval(getTime, 1000);
