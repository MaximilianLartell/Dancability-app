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
    return <div className="playlist" onClick={props.selectPlaylist} id={item.id} key={item.id}>{item.name}</div>
    })

  return (
    <div>
      <h1>Playlists</h1>
      <div className="playlists__items">
      {plName}
      </div>
    </div>
  );
};

export default Playlists;
