const express = require('express');
const request = require('request');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const fetch = require('node-fetch');

const app = express();

const redirectUri = 'http://localhost:8888/callback';
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

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

// app.get("/fallback", (req, res) => {
//   let code = req.query.code || null;
//   const options = {
//     method: "POST",
//     body: {
//       code: code,
//       redirect_uri,
//       grant_type: "authorization_code",
//     },
//     headers: {
//       Authorization:
//         "Basic " +
//         Buffer.from(client_id + ":" + client_secret).toString("base64"),
//     },
//   };
//   fetch("https://accounts.spotify.com/api/token", options).then((response) =>
//     response.json()
//   );
// });

app.get('/callback', (req, res) => {
  const code = req.query.code || null;
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    },
    headers: {
      Authorization: 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
    },
    json: true,
  };
  request.post(authOptions, (error, response, body) => {
    const accessToken = body.access_token;
    const uri = process.env.FRONTEND_URI || 'http://localhost:3000';
    res.cookie('accessToken', accessToken);
    res.redirect(uri);
  });
});

app.get('/api/user', async (req, res) => {
  const data = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: 'Bearer ' + req.cookies.accessToken },
  }).then(response => response.json());

  const userObject = { name: data.display_name, id: data.id, img_url: data.images[0].url };
  res.json(userObject);
});

app.get('/api/playlists', async (req, res) => {
  const data = await fetch('https://api.spotify.com/v1/me/playlists', {
    headers: { Authorization: 'Bearer ' + req.cookies.accessToken },
  }).then(response => response.json());
  const playlists = data.items.map(li => ({ name: li.name, id: li.id }));
  res.json(playlists);
});

app.get('/api/playlists/:id', async (req, res) => {
  const playlistId = req.params.id;
  let trackIdUrl = '';

  const data = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    headers: { Authorization: 'Bearer ' + req.cookies.accessToken },
  }).then(response => response.json());

  let tracks = data.items.map(item => {
    trackIdUrl += `${item.track.id},`;
    return {
      trackName: item.track.name,
      trackId: item.track.id,
      artist: item.track.artists[0].name,
    };
  });
  const audioFeatures = await fetch(
    `https://api.spotify.com/v1/audio-features/?ids=${trackIdUrl}`,
    {
      headers: { Authorization: 'Bearer ' + req.cookies.accessToken },
    },
  )
    .then(response => response.json())
    .then(data => data.audio_features);
  const meanEnergy =
    (audioFeatures.map(item => item.energy).reduce((a, b) => a + b) / audioFeatures.length) * 100;
  const meanDanceability =
    (audioFeatures.map(item => item.danceability).reduce((a, b) => a + b) / audioFeatures.length) *
    100;

  tracks = tracks.map((item, i) => {
    const itemFeatures = audioFeatures.find(el => el.id === tracks[i].trackId);
    item.audioProperties = {
      danceability: itemFeatures.danceability,
      energy: itemFeatures.energy,
    };
    return item;
  });

  const returnObject = {
      tracks, 
      playlistEnergy: meanEnergy,
      playlistDanceability: meanDanceability,
  };

  res.json(returnObject);
});

const port = process.env.PORT || 8888;
console.log(`Listening on port ${port}. Go /login to initiate authentication flow.`);
app.listen(port);
