import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';

const Playlists = (props) => {
  const [cookies] = useCookies(['accessToken']);
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8888/api/playlists', {
      headers: { Cookie: cookies.accessToken },
      credentials: 'include',
    })
    .then(res => res.json())
    .then(data => setPlaylists(data));
  }, []);

  const plName =playlists.map(item => {
    return <div className="playlist-name" onClick={props.fetchTracks} id={item.id} key={item.id}>{item.name}</div>
    })

  return (
    <div className="playlists">
      <h1 className="playlist-title">Playlists</h1>
      <div className="playlists-container">
      {plName}
      </div>
    </div>
  );
};

export default Playlists;
