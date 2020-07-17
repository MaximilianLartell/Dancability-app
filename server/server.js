const express = require('express');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();

const redirectUri = 'http://localhost:8888/callback';
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const spotifyBase = 'https://api.spotify.com/v1';

const fetchData = async (url, req) =>
  fetch(url, { headers: { Authorization: `Bearer ${req.cookies.accessToken}` } }).then(response =>
    response.json(),
  );

app.use(cookieParser());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.get('/login', (req, res) => {
  const qs = querystring.stringify({
    response_type: 'code',
    client_id: clientId,
    scope: 'user-read-private user-read-email',
    redirect_uri: redirectUri,
  });
  res.redirect(`https://accounts.spotify.com/authorize?${qs}`);
});

app.get('/callback', async (req, res) => {
  let code = req.query.code || null;
  const params = new URLSearchParams();
  params.append('code', code);
  params.append('redirect_uri', redirectUri);
  params.append('grant_type', 'authorization_code');
  const options = {
    method: 'POST',
    body: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
    },
  };
  const response = await fetch('https://accounts.spotify.com/api/token', options).then(response =>
    response.json(),
  );
  const accessToken = response.access_token;
  const refreshToken = response.refresh_token;
  const uri = 'http://localhost:3000';
  res.cookie('accessToken', accessToken);
  res.redirect(uri);
});

//{ error: { status: 401, message: 'The access token expired' } } response when token has expired
// unhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by 
//throwing inside of an async function without a catch block, or by rejecting a promise which was 
//not handled with .catch(). (rejection id: 2)

app.get('/api/user', async (req, res) => {
  const data = await fetchData(`${spotifyBase}/me`, req);
  const userObject = { name: data.display_name, id: data.id, img_url: data.images[0].url };
  res.status(200);
  res.json(userObject);
});

app.get('/api/playlists', async (req, res) => {
  const data = await fetchData(`${spotifyBase}/me/playlists?limit=50`, req);
  const playlists = data.items.map(li => ({ name: li.name, id: li.id }));
  res.status(200);
  res.json(playlists);
});

app.get('/api/playlists/:id', async (req, res) => {
  const playlistId = req.params.id;
  let trackIdUrl = '';

  const data = await fetchData(`${spotifyBase}/playlists/${playlistId}/tracks`, req);

  let tracks = data.items.map(item => {
    trackIdUrl += `${item.track.id},`;
    return {
      trackName: item.track.name,
      trackId: item.track.id,
      artist: item.track.artists[0].name,
    };
  });

  const audioFeatures = await fetchData(`${spotifyBase}/audio-features/?ids=${trackIdUrl}`, req);

  const meanEnergy = Math.round(
    (audioFeatures.audio_features.map(item => item.energy).reduce((a, b) => a + b) /
      audioFeatures.audio_features.length) *
      100,
  );
  const meanDanceability = Math.round(
    (audioFeatures.audio_features.map(item => item.danceability).reduce((a, b) => a + b) /
      audioFeatures.audio_features.length) *
      100,
  );

  tracks = tracks.map((item, i) => {
    const track = item;
    const itemFeatures = audioFeatures.audio_features.find(el => el.id === tracks[i].trackId);
    track.audioProperties = {
      danceability: Math.round(itemFeatures.danceability * 100),
      energy: Math.round(itemFeatures.energy * 100),
    };
    return track;
  });

  const returnObject = {
    tracks,
    playlistEnergy: meanEnergy,
    playlistDanceability: meanDanceability,
  };

  res.status(200);
  res.json(returnObject);
});

const port = process.env.PORT || 8888;
console.log(`Listening on port ${port}. Go /login to initiate authentication flow.`);
app.listen(port);
