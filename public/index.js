console.log('loaded');
document.getElementById('myH1').innerHTML = 'My Spotify Selector';
let params = (new URL(document.location)).searchParams;
console.log(params.get('access_token'));
let access_token = params.get('access_token');
const refresh_token = params.get('refresh_token');


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
      console.log('Changing to', deviceName);
    }
    newDeviceText.id = 'deviceText';
    newDeviceText.innerHTML = data[i].name;
    newDeviceDiv.appendChild(newDeviceText);
    document.getElementById('devices').appendChild(newDeviceDiv);
    
  }

}

// Set up our HTTP request
var xhr = new XMLHttpRequest();
var refreshXhr = new XMLHttpRequest();
var changeDeviceXhr = new XMLHttpRequest();

// Setup our listener to process completed requests
xhr.onload = function () {

	// Process our return data
	if (xhr.status >= 200 && xhr.status < 300) {
		// This will run when the request is successful
    console.log('success!', JSON.parse(xhr.response));
    buildDevices(JSON.parse(xhr.response).devices);
	} else {
		// This will run when it's not
    console.log('The request failed!', xhr);
    refreshToken();
	}

	// This will run either way
	// All three of these are optional, depending on what you're trying to do
	console.log('This always runs...');
};

refreshXhr.onload = function () {
  if (refreshXhr.status >= 200 && refreshXhr.status < 300) {
    console.log('refreshed access token');
    console.log(JSON.parse(refreshXhr.response));
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
    console.log('success!', JSON.parse(changeDeviceXhr.response));
    getDevices();
	} else {
		// This will run when it's not
    console.log('The request failed!', changeDeviceXhr);
	}

	// This will run either way
	// All three of these are optional, depending on what you're trying to do
	console.log('This always runs...');
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

getDevices()