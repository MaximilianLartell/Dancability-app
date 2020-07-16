import React, { useState, useEffect } from 'react';

const Tracks = ({ playlistName, playlistTracks }) => {
  console.log('PLAYLIST TRACKS', playlistTracks);
  if (playlistTracks !== undefined) {
    const trackList = playlistTracks.map(item => {
      return (
        <div className="trackCard" key={item.trackId}>
          <h5 className="trackName">{item.trackName}</h5>
          <h5 className="artistName">{item.artist}</h5>
          <p className="track-danceability">Danceability: {item.audioProperties.danceability}</p>
          <p className="track-energy">Energy: {item.audioProperties.danceability}</p>
        </div>
      );
    });
    return (
      <div className="tracks">
        <h1 className="track-list-title">Tracks for: {playlistName}</h1>
        <div className="tracks-container">{trackList}</div>
      </div>
    );
  }

  return (
    <div className="tracks-container">
      <h1 className="track-list-title">Tracks for:</h1>
    </div>
  );
};

export default Tracks;
