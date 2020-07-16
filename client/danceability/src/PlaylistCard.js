import React, { useState, useEffect } from 'react';

const PlaylistCard = ({ name, danceability, energy }) => {
  if (name !== undefined) {
    return (
      <div className="playlist-card">
        <h1 className="playlist-card-title">{name}</h1>
        <h3 className="playlist-danceability">
          Danceability: <br /> {danceability}%
        </h3>
        <h3 className="playlist-energy">
          Energy: <br />
          {energy}%
        </h3>
      </div>
    );
  }

  return (
    <div className="playlist-card">
      <h1 className="playlist-card-title">Select a playlist</h1>
    </div>
  );
};

export default PlaylistCard;
