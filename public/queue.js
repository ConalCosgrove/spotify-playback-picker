function getQueueElements() {
  const holder = document.getElementById('queueHolder');
  const searchBox = document.getElementById('queueSearchTextBox');
  const songList = document.getElementById('songList');
  return {
    holder,
    searchBox,
    songList,
  };
}

function clearSearch() {
  const { searchBox, songList } = getQueueElements();
  songList.innerHTML = '';
  searchBox.value = '';
}

async function queueSong(id) {
  const post = await fetch(`https://api.spotify.com/v1/me/player/queue?uri=spotify:track:${id}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (post.status === 204) {
    clearSearch();
  }
}

function buildSongElement(song) {
  const {
    title, artist, album, artwork, id,
  } = song;
  const holderDiv = document.createElement('div');
  holderDiv.className = 'queueItem';
  const infoHolderDiv = document.createElement('div');
  infoHolderDiv.className = 'queueItemInfoHolder';
  const queueItemSongTitle = document.createElement('h3');
  queueItemSongTitle.className = 'queueItemSongTitle';
  queueItemSongTitle.innerText = title;
  const queueItemArtistName = document.createElement('p');
  queueItemArtistName.className = 'queueItemArtistName';
  queueItemArtistName.innerText = artist;

  infoHolderDiv.appendChild(queueItemSongTitle);
  infoHolderDiv.appendChild(queueItemArtistName);


  const queueItemArtworkHolder = document.createElement('div');
  queueItemArtworkHolder.className = 'queueItemArtworkHolder';
  const queueItemArtworkImage = document.createElement('img');
  queueItemArtworkImage.className = 'queueItemArtworkImage';
  queueItemArtworkImage.src = artwork;

  queueItemArtworkHolder.appendChild(queueItemArtworkImage);
  holderDiv.appendChild(queueItemArtworkHolder);
  holderDiv.appendChild(infoHolderDiv);

  const queueButton = document.createElement('button');
  queueButton.className = 'queueButton';
  queueButton.textContent = '+';
  holderDiv.appendChild(queueButton);
  queueButton.onclick = () => queueSong(id);
  return holderDiv;
}

function drawQueue(songs) {
  const { songList } = getQueueElements();
  const songsInfo = songs.map((song) => ({
    title: song.name, artist: song.artists[0].name, album: song.album.name, id: song.id, artwork: song.album.images[2].url,
  }));
  songList.innerHTML = '';
  songsInfo.reverse();
  songsInfo.forEach((song) => songList.appendChild(buildSongElement(song)));
}
