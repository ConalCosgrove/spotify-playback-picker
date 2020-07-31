let accessToken;
let refreshToken;

// Set up our HTTP request
const refreshXhr = new XMLHttpRequest();
const getNowPlayingXhr = new XMLHttpRequest();
const getTimeXhr = new XMLHttpRequest();
let last = 0;

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

function setUpSearch() {
  const search = document.getElementById('queueSearchTextBox');
  search.onkeydown = async (e) => {
    const searchString = e.target.value;
    if (searchString.length < 2) return drawQueue([]);
    const tracks = await fetch(`https://api.spotify.com/v1/search?q=${encodeURI(searchString)}&type=track&limit=5`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const parsed = await tracks.json();
    drawQueue(parsed.tracks.items);
  };
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
  nowPlayingHolder.innerHTML = '';
  const artHolder = document.createElement('div');
  artHolder.id = 'artworkHolder';
  const artwork = document.createElement('img');
  const timeDisplay = document.createElement('div');
  timeDisplay.id = 'time';
  timeDisplay.style.width = `${calculateWidth(data)}%`;
  const title = document.createElement('h3');
  title.id = 'songTitleText';
  title.innerHTML = data.item.name;
  const artist = document.createElement('h4');
  artist.innerHTML = `${data.item.artists[0].name} - ${data.item.album.name}`;
  artist.id = 'songArtistText';
  artwork.src = data.item.album.images[1].url;
  artwork.id = 'artwork';
  artHolder.appendChild(artwork);
  artHolder.appendChild(timeDisplay);
  nowPlayingHolder.appendChild(artHolder);
  nowPlayingHolder.appendChild(title);
  nowPlayingHolder.appendChild(artist);
}

function setTime(data) {
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

async function getTokens(id) {
  const tokens = await fetch(`/tokens/${id}`);
  const parsed = await tokens.json();
  return parsed;
}


async function main() {
  const id = document.location.pathname.split('shared/')[1];
  const tokens = await getTokens(id);
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken;
  setUpSearch();
  getNowPlaying();
  setUpLinkSharingButton();
  setInterval(getTime, 1000);
}

main();
