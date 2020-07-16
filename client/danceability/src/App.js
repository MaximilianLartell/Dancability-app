import Header from './Header';
import Login from './Login';
import Playlists from './Playlists';
import Tracks from './Tracks';
import PlaylistCard from './PlaylistCard';
import './App.css';
import React, { useState } from 'react';
import { useCookies } from 'react-cookie';

const App = () => {
  const [playlistInfo, setPlaylistInfo] = useState({});
  const [cookies] = useCookies(['accessToken']);

  const fetchTracks = event => {
    event.persist();
    console.log('u are in fetch');
    fetch(`http://localhost:8888/api/playlists/${event.target.id}`, {
      headers: { Cookie: cookies.accessToken },
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        console.log('Trackinfo', data);
        setPlaylistInfo({
          name: event.target.textContent,
          id: event.target.id,
          danceability: data.playlistDanceability,
          energy: data.playlistEnergy,
          tracks: [...data.tracks]
        });
      });
  };

  if (!cookies.accessToken) {
    return (
      <div>
        <Login />
      </div>
    );
  }
  return (
    <div className="body">
      <Header />
      <main>
      <Playlists fetchTracks={fetchTracks} />
      <Tracks playlistName={playlistInfo.name} playlistTracks={playlistInfo.tracks} />
      <PlaylistCard name={playlistInfo.name} danceability={playlistInfo.danceability} energy={playlistInfo.energy}/>
      </main>
    </div>
  );
};

export default App;
