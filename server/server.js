let express = require('express');
let request = require('request');
let querystring = require('querystring');
const cookieParser = require('cookie-parser');
const fetch = require('node-fetch');

let app = express();

let redirect_uri = 'http://localhost:8888/callback';
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

app.use(cookieParser());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.get('/login', (req, res) => {
  res.redirect(
    'https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: 'user-read-private user-read-email',
        redirect_uri,
      }),
  );
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
  let code = req.query.code || null;
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri,
      grant_type: 'authorization_code',
    },
    headers: {
      Authorization: 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
    },
    json: true,
  };
  request.post(authOptions, (error, response, body) => {
    let access_token = body.access_token;
    let uri = process.env.FRONTEND_URI || 'http://localhost:3000';
    res.cookie('access_token', access_token);
    res.redirect(uri);
  });
});

app.get('/api/user', (req, res) => {
  console.log('hellooooo');
  console.log('Cookie', req.cookies.access_token);
  fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: 'Bearer ' + req.cookies.access_token },
  })
    .then(response => response.json())
    .then(data => {
        const userObject = { name: data.display_name, id: data.id, img_url: data.images[0].url };
        console.log('user', userObject);
        res.json(userObject)
    });
});

app.get('api/playlists', (req, res) => {
  console.log(req);
});

let port = process.env.PORT || 8888;
console.log(`Listening on port ${port}. Go /login to initiate authentication flow.`);
app.listen(port);
