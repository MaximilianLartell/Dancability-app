import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';

const Header = () => {
  const [cookies] = useCookies(['accessToken']);
  const [user, setUser] = useState({ name: null, id: null, img_url: null });
  useEffect(() => {
    fetch('http://localhost:8888/api/user', {
      headers: { Cookie: cookies.accessToken },
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => setUser(data));
  }, []);

  return (
    <header>
      <h1 className="page-title">Danceability</h1>
      <div className="user-info">  
        <h4 className="user-name">{user.name}</h4>
        <img className="user-img" src={user.img_url} alt="Girl in a jacket" width="50" height="50"/>
      </div>
    </header>
  );
};

export default Header;
