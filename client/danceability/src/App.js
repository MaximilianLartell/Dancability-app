import Header from './Header';
import Login from './Login';
import Playlists from './Playlists'
import React, { useState } from 'react';
import { useCookies } from 'react-cookie';

const App = () => {
  const [playlistInfo, setPlaylistInfo] = useState({id: null, danceability: null, energy: null});
  const [cookies] = useCookies(['accessToken']);

  const selectPlaylist = (event) => {
    console.log('YOU CLICKED ME', event.target.id);
    setPlaylistInfo({id: event.target.id}); 
  }

  if(!cookies.accessToken){
    return (
      <div>
        <Login />
      </div>
    );
  }
  return (
    <div>
      <Header />
      <Playlists selectPlaylist={selectPlaylist} />
    </div>
  );
};

export default App;
