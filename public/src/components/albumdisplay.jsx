import React from 'react';
import AlbumPhotoDisplay from './albumPhotoDisplay.jsx';

/* ------------------------------
Render a single album to the page
 -calls albumPhotoDisplay
-------------------------------*/

const AlbumDisplay = ({currentAlbum, currentPhoto}) => {
  return (
    <div>
      <h1>{currentAlbum.name}</h1>
      <AlbumPhotoDisplay photos={currentAlbum.photos} currentPhoto={currentPhoto}/>
    </div>
  );
};

export default AlbumDisplay;
