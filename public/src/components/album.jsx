import React from 'react';
import Photo from './photo.jsx';

/* ------------------------------
Render an individual album row with the first 4 photos to the App for each album:
 -uses selectAlbum method from app.jsx
-------------------------------*/

const Album = ({album, selectAlbum}) => {
  return (
    <div className="album-with-title">
      <div className="row">
        <div className="col-md-12">
          <h3 className="album-title" onClick={() => { selectAlbum(album); }}>{album.name}</h3>
        </div>
      </div>

      <div className="row album-row">{
        album.photos.map((photo, i) => {
          if(i < 4) {
            return (
              <div className="col-md-3" onClick={() => { selectAlbum(album, i); }}>
                <Photo photo={photo}/>
              </div>
            );
          }
        })
      }</div>
    </div>
  );
};

export default Album;
